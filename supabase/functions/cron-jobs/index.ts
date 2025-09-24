/**
 * Cron Jobs for Google Calendar Sync
 * Handles watch channel renewal and full resync
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { job_type } = await req.json()

    if (!job_type) {
      return new Response(
        JSON.stringify({ error: 'Missing job_type parameter' }),
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

    let result: any = {}

    switch (job_type) {
      case 'renew_channels':
        result = await renewWatchChannels(supabase)
        break
      
      case 'full_resync':
        result = await fullResync(supabase)
        break
      
      case 'cleanup_expired':
        result = await cleanupExpiredChannels(supabase)
        break
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid job_type' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        job_type,
        result
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Cron job error:', error)
    
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

async function renewWatchChannels(supabase: any) {
  try {
    console.log('Starting watch channel renewal job')
    
    // Find channels expiring in next 24 hours
    const expiryThreshold = new Date()
    expiryThreshold.setHours(expiryThreshold.getHours() + 24)
    
    const { data: expiringChannels, error } = await supabase
      .from('watch_channels')
      .select('*')
      .lt('expiration', expiryThreshold.toISOString())
    
    if (error) {
      throw error
    }

    let renewed = 0
    let errors = 0

    for (const channel of expiringChannels || []) {
      try {
        // Stop old channel
        await stopWatchChannel(supabase, channel.user_id, channel.channel_id)
        
        // Create new channel
        await createWatchChannel(supabase, channel.user_id, channel.calendar_id)
        
        renewed++
        console.log(`Renewed channel for user ${channel.user_id}`)
        
      } catch (error) {
        errors++
        console.error(`Error renewing channel for user ${channel.user_id}:`, error)
      }
    }

    // Log the job execution
    await supabase
      .from('sync_log')
      .insert({
        user_id: null, // System job
        sync_type: 'channel_renewal',
        status: errors === 0 ? 'success' : 'partial',
        events_processed: renewed,
        errors_count: errors,
        completed_at: new Date().toISOString()
      })

    return {
      channels_renewed: renewed,
      errors: errors,
      total_expiring: expiringChannels?.length || 0
    }

  } catch (error) {
    console.error('Error in renew watch channels job:', error)
    throw error
  }
}

async function fullResync(supabase: any) {
  try {
    console.log('Starting full resync job')
    
    // Get all connected users
    const { data: connectedUsers, error } = await supabase
      .from('users')
      .select('id')
      .eq('google_calendar_connected', true)
    
    if (error) {
      throw error
    }

    let synced = 0
    let errors = 0

    for (const user of connectedUsers || []) {
      try {
        // Trigger full sync for each user
        await triggerUserSync(supabase, user.id, 'full_resync')
        synced++
        
      } catch (error) {
        errors++
        console.error(`Error in full resync for user ${user.id}:`, error)
      }
    }

    // Log the job execution
    await supabase
      .from('sync_log')
      .insert({
        user_id: null, // System job
        sync_type: 'full_resync',
        status: errors === 0 ? 'success' : 'partial',
        events_processed: synced,
        errors_count: errors,
        completed_at: new Date().toISOString()
      })

    return {
      users_synced: synced,
      errors: errors,
      total_users: connectedUsers?.length || 0
    }

  } catch (error) {
    console.error('Error in full resync job:', error)
    throw error
  }
}

async function cleanupExpiredChannels(supabase: any) {
  try {
    console.log('Starting cleanup expired channels job')
    
    // Call the cleanup function
    const { data, error } = await supabase
      .rpc('cleanup_expired_watch_channels')
    
    if (error) {
      throw error
    }

    const deletedCount = data || 0

    return {
      channels_deleted: deletedCount
    }

  } catch (error) {
    console.error('Error in cleanup expired channels job:', error)
    throw error
  }
}

async function stopWatchChannel(supabase: any, userId: string, channelId: string) {
  // In a real implementation, you would call the Google Calendar API
  // to stop the watch channel. For now, we'll just remove it from the database.
  
  const { error } = await supabase
    .from('watch_channels')
    .delete()
    .eq('channel_id', channelId)
    .eq('user_id', userId)
  
  if (error) {
    throw error
  }
}

async function createWatchChannel(supabase: any, userId: string, calendarId: string = 'primary') {
  // In a real implementation, you would call the Google Calendar API
  // to create a new watch channel. For now, we'll just create a placeholder.
  
  const channelId = crypto.randomUUID()
  const expiration = new Date()
  expiration.setDate(expiration.getDate() + 7) // 7 days from now
  
  const { error } = await supabase
    .from('watch_channels')
    .insert({
      user_id: userId,
      calendar_id: calendarId,
      channel_id: channelId,
      resource_id: 'placeholder', // Would be set by Google API
      expiration: expiration.toISOString()
    })
  
  if (error) {
    throw error
  }
}

async function triggerUserSync(supabase: any, userId: string, syncType: string) {
  // In a real implementation, you would trigger the actual sync process
  // For now, we'll just log it
  
  console.log(`Triggering ${syncType} for user ${userId}`)
  
  // You could implement actual sync logic here or call an external service
}
