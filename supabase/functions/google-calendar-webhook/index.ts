/**
 * Google Calendar Webhook Handler
 * Handles push notifications from Google Calendar
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface WebhookRequest {
  resourceId?: string;
  channelId?: string;
  channelExpiration?: string;
  channelToken?: string;
  resourceState?: string;
  resourceUri?: string;
  messageNumber?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get headers for validation
    const resourceId = req.headers.get('X-Goog-Resource-ID')
    const channelId = req.headers.get('X-Goog-Channel-ID')
    const resourceState = req.headers.get('X-Goog-Resource-State')
    const resourceUri = req.headers.get('X-Goog-Resource-URI')
    const messageNumber = req.headers.get('X-Goog-Message-Number')

    console.log('Webhook received:', {
      resourceId,
      channelId,
      resourceState,
      resourceUri,
      messageNumber
    })

    // Validate required headers
    if (!resourceId || !channelId) {
      console.error('Missing required headers')
      return new Response(
        JSON.stringify({ error: 'Missing required headers' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate channel exists in database
    const { data: channel, error: channelError } = await supabase
      .from('watch_channels')
      .select('user_id, resource_id')
      .eq('channel_id', channelId)
      .single()

    if (channelError || !channel) {
      console.error('Channel not found:', channelError)
      return new Response(
        JSON.stringify({ error: 'Channel not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate resource ID matches
    if (channel.resource_id !== resourceId) {
      console.error('Resource ID mismatch')
      return new Response(
        JSON.stringify({ error: 'Resource ID mismatch' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Handle different resource states
    switch (resourceState) {
      case 'sync':
        console.log('Initial sync notification')
        // For initial sync, we can trigger a full sync
        await triggerSync(supabase, channel.user_id, 'webhook')
        break
        
      case 'exists':
        console.log('Resource exists notification')
        // For existing resource updates, trigger incremental sync
        await triggerSync(supabase, channel.user_id, 'webhook')
        break
        
      case 'not_exists':
        console.log('Resource not exists notification')
        // Resource was deleted, but we handle this in sync
        await triggerSync(supabase, channel.user_id, 'webhook')
        break
        
      default:
        console.log('Unknown resource state:', resourceState)
        await triggerSync(supabase, channel.user_id, 'webhook')
    }

    // Log the webhook event
    await supabase
      .from('sync_log')
      .insert({
        user_id: channel.user_id,
        sync_type: 'webhook',
        status: 'success',
        events_processed: 0,
        errors_count: 0,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        userId: channel.user_id,
        resourceState
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function triggerSync(supabase: any, userId: string, triggerType: string) {
  try {
    // Here you would typically trigger the actual sync process
    // For now, we'll just log it and update the sync status
    
    console.log(`Triggering sync for user ${userId} via ${triggerType}`)
    
    // You could implement actual sync logic here or trigger an external service
    // For example, calling your Python sync service or implementing sync logic directly
    
    // Update user's last sync timestamp
    await supabase
      .from('users')
      .update({ 
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)
      
  } catch (error) {
    console.error('Error triggering sync:', error)
  }
}
