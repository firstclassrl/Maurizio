"""
Google Calendar Bidirectional Sync Service for LexAgenda
Handles OAuth2 authentication, watch channels, and bidirectional synchronization
"""

import os
import json
import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import httpx
from supabase import create_client, Client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class EventData:
    """Represents an event for synchronization"""
    id: Optional[str] = None
    google_event_id: Optional[str] = None
    title: str = ""
    description: str = ""
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    source: str = "lex"  # "lex" or "google"
    last_modified: Optional[datetime] = None

@dataclass
class SyncResult:
    """Result of a synchronization operation"""
    success: bool
    events_processed: int = 0
    errors_count: int = 0
    error_details: List[str] = None
    sync_token: Optional[str] = None

class GoogleCalendarSync:
    """Main class for Google Calendar synchronization"""
    
    def __init__(self):
        self.supabase: Client = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        )
        
        # Google OAuth2 configuration
        self.client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GOOGLE_REDIRECT_URI')
        self.scopes = ['https://www.googleapis.com/auth/calendar']
        
        # Webhook configuration
        self.webhook_url = os.getenv('WEBHOOK_BASE_URL', 'https://lexagenda.it')
        
    def create_oauth_url(self, user_id: str) -> str:
        """Create OAuth2 authorization URL for user"""
        try:
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": [self.redirect_uri]
                    }
                },
                scopes=self.scopes
            )
            flow.redirect_uri = self.redirect_uri
            
            # Add state parameter with user_id for security
            state = json.dumps({"user_id": user_id})
            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                state=state
            )
            
            return authorization_url
            
        except Exception as e:
            logger.error(f"Error creating OAuth URL: {e}")
            raise
    
    def handle_oauth_callback(self, code: str, state: str) -> bool:
        """Handle OAuth2 callback and store tokens"""
        try:
            # Verify state parameter
            state_data = json.loads(state)
            user_id = state_data.get('user_id')
            
            if not user_id:
                raise ValueError("Invalid state parameter")
            
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": [self.redirect_uri]
                    }
                },
                scopes=self.scopes
            )
            flow.redirect_uri = self.redirect_uri
            
            # Exchange code for tokens
            flow.fetch_token(code=code)
            credentials = flow.credentials
            
            # Store tokens in database
            result = self.supabase.table('users').upsert({
                'id': user_id,
                'google_access_token': credentials.token,
                'google_refresh_token': credentials.refresh_token,
                'google_token_expiry': datetime.fromtimestamp(credentials.expiry).isoformat(),
                'google_calendar_connected': True
            }).execute()
            
            if result.data:
                logger.info(f"Successfully connected Google Calendar for user {user_id}")
                
                # Create initial watch channel
                self.create_watch_channel(user_id)
                
                return True
            else:
                logger.error(f"Failed to store tokens for user {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error handling OAuth callback: {e}")
            return False
    
    def get_user_credentials(self, user_id: str) -> Optional[Credentials]:
        """Get and refresh user credentials"""
        try:
            result = self.supabase.table('users').select(
                'google_access_token', 'google_refresh_token', 'google_token_expiry'
            ).eq('id', user_id).single().execute()
            
            if not result.data:
                return None
            
            user_data = result.data
            credentials = Credentials(
                token=user_data['google_access_token'],
                refresh_token=user_data['google_refresh_token'],
                token_uri="https://oauth2.googleapis.com/token",
                client_id=self.client_id,
                client_secret=self.client_secret,
                scopes=self.scopes
            )
            
            # Refresh token if expired
            if credentials.expired:
                credentials.refresh(Request())
                
                # Update stored tokens
                self.supabase.table('users').upsert({
                    'id': user_id,
                    'google_access_token': credentials.token,
                    'google_token_expiry': datetime.fromtimestamp(credentials.expiry).isoformat()
                }).execute()
            
            return credentials
            
        except Exception as e:
            logger.error(f"Error getting user credentials: {e}")
            return None
    
    def create_watch_channel(self, user_id: str, calendar_id: str = 'primary') -> bool:
        """Create a watch channel for push notifications"""
        try:
            credentials = self.get_user_credentials(user_id)
            if not credentials:
                return False
            
            service = build('calendar', 'v3', credentials=credentials)
            
            # Generate unique channel ID
            channel_id = str(uuid.uuid4())
            
            # Create watch request
            watch_request = {
                'id': channel_id,
                'type': 'web_hook',
                'address': f"{self.webhook_url}/api/google-calendar/webhook",
                'expiration': int((datetime.now() + timedelta(days=7)).timestamp() * 1000)
            }
            
            # Create the watch channel
            watch_response = service.events().watch(
                calendarId=calendar_id,
                body=watch_request
            ).execute()
            
            # Store channel info in database
            self.supabase.table('watch_channels').insert({
                'user_id': user_id,
                'calendar_id': calendar_id,
                'channel_id': channel_id,
                'resource_id': watch_response.get('resourceId'),
                'expiration': datetime.fromtimestamp(watch_response.get('expiration') / 1000)
            }).execute()
            
            logger.info(f"Created watch channel {channel_id} for user {user_id}")
            return True
            
        except HttpError as e:
            logger.error(f"Google API error creating watch channel: {e}")
            return False
        except Exception as e:
            logger.error(f"Error creating watch channel: {e}")
            return False
    
    def stop_watch_channel(self, user_id: str, channel_id: str) -> bool:
        """Stop a watch channel"""
        try:
            credentials = self.get_user_credentials(user_id)
            if not credentials:
                return False
            
            service = build('calendar', 'v3', credentials=credentials)
            
            # Stop the channel
            service.channels().stop(body={
                'id': channel_id,
                'resourceId': self._get_resource_id(channel_id)
            }).execute()
            
            # Remove from database
            self.supabase.table('watch_channels').delete().eq('channel_id', channel_id).execute()
            
            logger.info(f"Stopped watch channel {channel_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error stopping watch channel: {e}")
            return False
    
    def _get_resource_id(self, channel_id: str) -> Optional[str]:
        """Get resource ID for a channel"""
        result = self.supabase.table('watch_channels').select('resource_id').eq('channel_id', channel_id).single().execute()
        return result.data['resource_id'] if result.data else None
    
    def sync_from_google(self, user_id: str, sync_token: Optional[str] = None) -> SyncResult:
        """Sync events from Google Calendar to LexAgenda"""
        try:
            credentials = self.get_user_credentials(user_id)
            if not credentials:
                return SyncResult(success=False, error_details=["No valid credentials"])
            
            service = build('calendar', 'v3', credentials=credentials)
            
            # Prepare sync parameters
            sync_params = {
                'calendarId': 'primary',
                'singleEvents': True,
                'orderBy': 'startTime'
            }
            
            if sync_token:
                sync_params['syncToken'] = sync_token
            
            # Fetch events
            events_result = service.events().list(**sync_params).execute()
            events = events_result.get('items', [])
            next_sync_token = events_result.get('nextSyncToken')
            
            processed = 0
            errors = 0
            error_details = []
            
            for google_event in events:
                try:
                    self._process_google_event(user_id, google_event)
                    processed += 1
                except Exception as e:
                    errors += 1
                    error_details.append(f"Error processing event {google_event.get('id')}: {str(e)}")
            
            # Log sync operation
            self._log_sync_operation(user_id, 'pull', 'success' if errors == 0 else 'partial', 
                                   processed, errors, error_details, next_sync_token)
            
            return SyncResult(
                success=True,
                events_processed=processed,
                errors_count=errors,
                error_details=error_details,
                sync_token=next_sync_token
            )
            
        except Exception as e:
            logger.error(f"Error syncing from Google: {e}")
            self._log_sync_operation(user_id, 'pull', 'error', 0, 1, [str(e)])
            return SyncResult(success=False, error_details=[str(e)])
    
    def _process_google_event(self, user_id: str, google_event: Dict) -> None:
        """Process a single Google Calendar event"""
        google_event_id = google_event.get('id')
        
        # Check if event already exists
        existing = self.supabase.table('events').select('*').eq('google_event_id', google_event_id).single().execute()
        
        # Parse event data
        event_data = self._parse_google_event(google_event)
        event_data.source = 'google'
        
        if existing.data:
            # Update existing event
            self.supabase.table('events').update({
                'title': event_data.title,
                'description': event_data.description,
                'start_datetime': event_data.start_datetime.isoformat(),
                'end_datetime': event_data.end_datetime.isoformat(),
                'last_modified': event_data.last_modified.isoformat(),
                'sync_status': 'synced',
                'updated_at': datetime.now().isoformat()
            }).eq('id', existing.data['id']).execute()
        else:
            # Create new event
            self.supabase.table('events').insert({
                'user_id': user_id,
                'google_event_id': google_event_id,
                'title': event_data.title,
                'description': event_data.description,
                'start_datetime': event_data.start_datetime.isoformat(),
                'end_datetime': event_data.end_datetime.isoformat(),
                'last_modified': event_data.last_modified.isoformat(),
                'source': 'google',
                'sync_status': 'synced'
            }).execute()
    
    def _parse_google_event(self, google_event: Dict) -> EventData:
        """Parse Google Calendar event to EventData"""
        start = google_event.get('start', {})
        end = google_event.get('end', {})
        
        # Parse start datetime
        start_datetime = None
        if start.get('dateTime'):
            start_datetime = datetime.fromisoformat(start['dateTime'].replace('Z', '+00:00'))
        elif start.get('date'):
            start_datetime = datetime.fromisoformat(start['date'] + 'T00:00:00+00:00')
        
        # Parse end datetime
        end_datetime = None
        if end.get('dateTime'):
            end_datetime = datetime.fromisoformat(end['dateTime'].replace('Z', '+00:00'))
        elif end.get('date'):
            end_datetime = datetime.fromisoformat(end['date'] + 'T00:00:00+00:00')
        
        return EventData(
            google_event_id=google_event.get('id'),
            title=google_event.get('summary', ''),
            description=google_event.get('description', ''),
            start_datetime=start_datetime,
            end_datetime=end_datetime,
            last_modified=datetime.fromisoformat(google_event.get('updated', '').replace('Z', '+00:00'))
        )
    
    def sync_to_google(self, user_id: str, event_id: str) -> SyncResult:
        """Sync a single LexAgenda event to Google Calendar"""
        try:
            # Get event from database
            result = self.supabase.table('events').select('*').eq('id', event_id).eq('user_id', user_id).single().execute()
            
            if not result.data:
                return SyncResult(success=False, error_details=["Event not found"])
            
            event = result.data
            
            credentials = self.get_user_credentials(user_id)
            if not credentials:
                return SyncResult(success=False, error_details=["No valid credentials"])
            
            service = build('calendar', 'v3', credentials=credentials)
            
            # Prepare Google Calendar event
            google_event = self._prepare_google_event(event)
            
            if event['google_event_id']:
                # Update existing event
                updated_event = service.events().update(
                    calendarId='primary',
                    eventId=event['google_event_id'],
                    body=google_event
                ).execute()
                
                # Update database with new Google event ID (in case it changed)
                self.supabase.table('events').update({
                    'google_event_id': updated_event['id'],
                    'sync_status': 'synced',
                    'last_modified': datetime.now().isoformat()
                }).eq('id', event_id).execute()
                
            else:
                # Create new event
                created_event = service.events().insert(
                    calendarId='primary',
                    body=google_event
                ).execute()
                
                # Update database with Google event ID
                self.supabase.table('events').update({
                    'google_event_id': created_event['id'],
                    'sync_status': 'synced',
                    'last_modified': datetime.now().isoformat()
                }).eq('id', event_id).execute()
            
            return SyncResult(success=True, events_processed=1)
            
        except Exception as e:
            logger.error(f"Error syncing to Google: {e}")
            return SyncResult(success=False, error_details=[str(e)])
    
    def _prepare_google_event(self, event: Dict) -> Dict:
        """Prepare LexAgenda event for Google Calendar API"""
        google_event = {
            'summary': event['title'],
            'description': event.get('description', ''),
            'start': {
                'dateTime': event['start_datetime'],
                'timeZone': 'Europe/Rome'
            },
            'end': {
                'dateTime': event['end_datetime'],
                'timeZone': 'Europe/Rome'
            }
        }
        
        return google_event
    
    def handle_webhook(self, channel_id: str, resource_id: str) -> bool:
        """Handle Google Calendar webhook notification"""
        try:
            # Validate channel exists and get user_id
            result = self.supabase.table('watch_channels').select('user_id').eq('channel_id', channel_id).single().execute()
            
            if not result.data:
                logger.warning(f"Unknown channel ID: {channel_id}")
                return False
            
            user_id = result.data['user_id']
            
            # Get last sync token for this user
            last_sync = self.supabase.table('sync_log').select('sync_token').eq('user_id', user_id).eq('sync_type', 'pull').order('created_at', desc=True).limit(1).execute()
            
            sync_token = last_sync.data[0]['sync_token'] if last_sync.data else None
            
            # Sync from Google
            sync_result = self.sync_from_google(user_id, sync_token)
            
            logger.info(f"Webhook processed for user {user_id}: {sync_result.events_processed} events")
            return sync_result.success
            
        except Exception as e:
            logger.error(f"Error handling webhook: {e}")
            return False
    
    def renew_channels_job(self) -> None:
        """Renew expiring watch channels (run as cron job)"""
        try:
            # Find channels expiring in next 24 hours
            expiry_threshold = datetime.now() + timedelta(hours=24)
            
            result = self.supabase.table('watch_channels').select('*').lt('expiration', expiry_threshold).execute()
            
            for channel in result.data:
                user_id = channel['user_id']
                channel_id = channel['channel_id']
                calendar_id = channel['calendar_id']
                
                # Stop old channel
                self.stop_watch_channel(user_id, channel_id)
                
                # Create new channel
                self.create_watch_channel(user_id, calendar_id)
                
                logger.info(f"Renewed channel for user {user_id}")
                
        except Exception as e:
            logger.error(f"Error in renew channels job: {e}")
    
    def full_resync_job(self) -> None:
        """Full resync for all connected users (run as nightly cron job)"""
        try:
            # Get all connected users
            result = self.supabase.table('users').select('id').eq('google_calendar_connected', True).execute()
            
            for user in result.data:
                user_id = user['id']
                
                try:
                    # Full sync without sync token
                    sync_result = self.sync_from_google(user_id)
                    logger.info(f"Full resync for user {user_id}: {sync_result.events_processed} events")
                    
                except Exception as e:
                    logger.error(f"Error in full resync for user {user_id}: {e}")
                    
        except Exception as e:
            logger.error(f"Error in full resync job: {e}")
    
    def _log_sync_operation(self, user_id: str, sync_type: str, status: str, 
                          events_processed: int, errors_count: int, 
                          error_details: List[str], sync_token: Optional[str] = None) -> None:
        """Log synchronization operation"""
        try:
            self.supabase.table('sync_log').insert({
                'user_id': user_id,
                'sync_type': sync_type,
                'status': status,
                'events_processed': events_processed,
                'errors_count': errors_count,
                'error_details': json.dumps(error_details) if error_details else None,
                'sync_token': sync_token,
                'completed_at': datetime.now().isoformat()
            }).execute()
            
        except Exception as e:
            logger.error(f"Error logging sync operation: {e}")
    
    def get_sync_status(self, user_id: str) -> Dict:
        """Get synchronization status for a user"""
        try:
            result = self.supabase.rpc('get_user_sync_status', {'user_uuid': user_id}).execute()
            return result.data[0] if result.data else {}
            
        except Exception as e:
            logger.error(f"Error getting sync status: {e}")
            return {}

# Utility functions for cron jobs
def renew_watch_channels():
    """Cron job function to renew expiring watch channels"""
    sync = GoogleCalendarSync()
    sync.renew_channels_job()

def full_resync():
    """Cron job function for full resync"""
    sync = GoogleCalendarSync()
    sync.full_resync_job()

def cleanup_expired_channels():
    """Cron job function to clean up expired channels"""
    sync = GoogleCalendarSync()
    sync.supabase.rpc('cleanup_expired_watch_channels').execute()
