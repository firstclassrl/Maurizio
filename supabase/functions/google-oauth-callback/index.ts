/**
 * Google OAuth Callback Handler
 * Handles OAuth2 callback from Google Calendar
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

    const { code, state } = await req.json()

    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: 'Missing code or state parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse state to get user_id
    let userId: string
    try {
      const stateData = JSON.parse(state)
      userId = stateData.user_id
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid state parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForTokens(code)
    
    if (!tokenResponse.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to exchange code for tokens',
          details: tokenResponse.error 
        }),
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

    // Store tokens in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        google_access_token: tokenResponse.tokens.access_token,
        google_refresh_token: tokenResponse.tokens.refresh_token,
        google_token_expiry: new Date(tokenResponse.tokens.expiry * 1000).toISOString(),
        google_calendar_connected: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user tokens:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to store tokens' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create initial watch channel
    const watchResult = await createWatchChannel(userId, supabase)
    
    if (!watchResult.success) {
      console.error('Failed to create watch channel:', watchResult.error)
      // Don't fail the whole process, just log the error
    }

    // Log successful connection
    await supabase
      .from('sync_log')
      .insert({
        user_id: userId,
        sync_type: 'oauth',
        status: 'success',
        events_processed: 0,
        errors_count: 0,
        completed_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Google Calendar connected successfully',
        userId: userId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('OAuth callback error:', error)
    
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

async function exchangeCodeForTokens(code: string) {
  try {
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI')

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Google OAuth configuration')
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token'
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Token exchange failed: ${errorData}`)
    }

    const tokens = await response.json()
    
    return {
      success: true,
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry: Date.now() / 1000 + tokens.expires_in
      }
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function createWatchChannel(userId: string, supabase: any) {
  try {
    // Generate unique channel ID
    const channelId = crypto.randomUUID()
    
    // For now, we'll just store a placeholder
    // In a real implementation, you'd call the Google Calendar API
    const { error } = await supabase
      .from('watch_channels')
      .insert({
        user_id: userId,
        calendar_id: 'primary',
        channel_id: channelId,
        resource_id: 'placeholder', // Would be set by Google API
        expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      })

    if (error) {
      throw error
    }

    return { success: true }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
