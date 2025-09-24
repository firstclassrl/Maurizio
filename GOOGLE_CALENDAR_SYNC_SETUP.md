# Google Calendar Sync Setup Guide

This guide will help you set up bidirectional synchronization between LexAgenda and Google Calendar.

## Prerequisites

- Google Cloud Project with Calendar API enabled
- Supabase project with service role key
- HTTPS domain for webhook endpoints

## 1. Google Cloud Project Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API

### Step 2: Configure OAuth2 Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required fields:
   - App name: "LexAgenda"
   - User support email: your email
   - Developer contact: your email
4. Add scopes: `https://www.googleapis.com/auth/calendar`
5. Add test users (your email initially)

### Step 3: Create OAuth2 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set authorized redirect URIs:
   - `https://lexagenda.it/api/google-oauth/callback`
   - `http://localhost:3000/api/google-oauth/callback` (for development)
5. Save and note down Client ID and Client Secret

## 2. Environment Configuration

Create `.env.local` file with:

```bash
# Google OAuth2
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://lexagenda.it/api/google-oauth/callback

# Webhook
WEBHOOK_BASE_URL=https://lexagenda.it
WEBHOOK_SECRET=your_random_secret_here

# Supabase (already configured)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 3. Database Setup

Run the migration to create required tables:

```sql
-- Apply the migration file
-- supabase/migrations/20250124_google_calendar_sync.sql
```

## 4. Deploy Supabase Functions

Deploy the Edge Functions:

```bash
# Deploy webhook handler
supabase functions deploy google-calendar-webhook

# Deploy OAuth callback handler
supabase functions deploy google-oauth-callback

# Deploy cron jobs handler
supabase functions deploy cron-jobs
```

## 5. Set up Cron Jobs

### Option A: Using Supabase Cron (Recommended)
Add to your Supabase project:

```sql
-- Daily channel renewal (runs at 2 AM UTC)
SELECT cron.schedule(
    'google-calendar-renew-channels',
    '0 2 * * *',
    'SELECT net.http_post(
        url:=''https://your-project.supabase.co/functions/v1/cron-jobs'',
        headers:=''{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}''::jsonb,
        body:=''{"job_type": "renew_channels"}''::jsonb
    );'
);

-- Nightly full resync (runs at 3 AM UTC)
SELECT cron.schedule(
    'google-calendar-full-resync',
    '0 3 * * *',
    'SELECT net.http_post(
        url:=''https://your-project.supabase.co/functions/v1/cron-jobs'',
        headers:=''{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}''::jsonb,
        body:=''{"job_type": "full_resync"}''::jsonb
    );'
);

-- Weekly cleanup (runs Sundays at 4 AM UTC)
SELECT cron.schedule(
    'google-calendar-cleanup',
    '0 4 * * 0',
    'SELECT net.http_post(
        url:=''https://your-project.supabase.co/functions/v1/cron-jobs'',
        headers:=''{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}''::jsonb,
        body:=''{"job_type": "cleanup_expired"}''::jsonb
    );'
);
```

### Option B: External Cron Service
Use a service like GitHub Actions, Vercel Cron, or a VPS:

```bash
# Daily at 2 AM UTC
0 2 * * * curl -X POST https://your-project.supabase.co/functions/v1/cron-jobs \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"job_type": "renew_channels"}'

# Daily at 3 AM UTC
0 3 * * * curl -X POST https://your-project.supabase.co/functions/v1/cron-jobs \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"job_type": "full_resync"}'
```

## 6. Frontend Integration

Add the Google Calendar sync component to your app:

```tsx
import { GoogleCalendarSync } from './components/google-calendar/GoogleCalendarSync'

// In your settings page
<GoogleCalendarSync user={user} />
```

## 7. Testing

### Test OAuth Flow
1. Click "Connect Google Calendar" button
2. Complete Google OAuth flow
3. Verify connection in database

### Test Webhook
1. Create an event in Google Calendar
2. Check that it appears in LexAgenda
3. Create an event in LexAgenda
4. Check that it appears in Google Calendar

### Test Sync Status
```sql
-- Check sync status
SELECT * FROM sync_dashboard;

-- Check recent sync logs
SELECT * FROM sync_log ORDER BY created_at DESC LIMIT 10;

-- Check watch channels
SELECT * FROM watch_channels WHERE expiration > NOW();
```

## 8. Monitoring

### Database Views
Use these views to monitor sync status:

```sql
-- Overall sync dashboard
SELECT * FROM sync_dashboard;

-- User sync status
SELECT * FROM get_user_sync_status('user-uuid-here');

-- Recent sync operations
SELECT * FROM sync_log 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Error Handling
Monitor these tables for issues:

```sql
-- Failed sync operations
SELECT * FROM sync_log WHERE status = 'error';

-- Events with sync issues
SELECT * FROM events WHERE sync_status = 'failed';

-- Expired watch channels
SELECT * FROM watch_channels WHERE expiration < NOW();
```

## 9. Security Considerations

### OAuth2 Security
- Store tokens securely in database
- Implement token refresh logic
- Use HTTPS for all endpoints
- Validate state parameter in OAuth flow

### Webhook Security
- Validate webhook headers
- Implement rate limiting
- Use webhook secrets for verification
- Log all webhook events

### Database Security
- Use Row Level Security (RLS)
- Limit service role permissions
- Encrypt sensitive data
- Regular security audits

## 10. Troubleshooting

### Common Issues

#### OAuth Errors
- Check client ID/secret configuration
- Verify redirect URI matches exactly
- Ensure OAuth consent screen is configured
- Check API quotas

#### Sync Failures
- Verify tokens are valid and not expired
- Check Google Calendar API quotas
- Review sync logs for error details
- Ensure webhook endpoint is accessible

#### Webhook Issues
- Verify webhook URL is HTTPS
- Check Supabase function logs
- Validate webhook headers
- Ensure database permissions

### Debug Commands

```sql
-- Check user tokens
SELECT id, email, google_calendar_connected, google_token_expiry 
FROM auth.users 
WHERE google_calendar_connected = true;

-- Check watch channels
SELECT user_id, channel_id, expiration 
FROM watch_channels 
WHERE expiration > NOW();

-- Check sync status
SELECT sync_type, status, COUNT(*) 
FROM sync_log 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY sync_type, status;
```

## 11. Performance Optimization

### Database Indexes
Ensure these indexes exist:
```sql
CREATE INDEX CONCURRENTLY idx_events_user_sync ON events(user_id, sync_status);
CREATE INDEX CONCURRENTLY idx_events_google_id ON events(google_event_id);
CREATE INDEX CONCURRENTLY idx_sync_log_user_created ON sync_log(user_id, created_at);
```

### Rate Limiting
Implement rate limiting for:
- Google Calendar API calls
- Webhook processing
- OAuth flows

### Caching
Consider caching:
- User credentials (with TTL)
- Sync status
- Calendar metadata

## 12. Maintenance

### Regular Tasks
- Monitor API quotas
- Review sync logs weekly
- Update OAuth consent screen as needed
- Backup sync configuration

### Scaling Considerations
- Implement connection pooling
- Use batch operations for large syncs
- Consider async processing for webhooks
- Monitor database performance

This setup provides a robust, scalable solution for bidirectional Google Calendar synchronization with proper error handling, monitoring, and security measures.
