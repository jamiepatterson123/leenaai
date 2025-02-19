
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the user from the request
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      req.headers.get('Authorization')?.split('Bearer ')[1] ?? ''
    )

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (rolesError || !roles) {
      throw new Error('Unauthorized - Admin access required')
    }

    // Get user's WhatsApp preferences
    const { data: preferences, error: preferencesError } = await supabaseAdmin
      .from('whatsapp_preferences')
      .select('phone_number')
      .eq('user_id', user.id)
      .single()

    if (preferencesError || !preferences) {
      throw new Error('WhatsApp preferences not found')
    }

    console.log('Sending test message to:', preferences.phone_number)

    // Send test message via WhatsApp API
    const whatsappApiUrl = 'https://graph.facebook.com/v17.0/15551753639/messages'
    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('WHATSAPP_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: preferences.phone_number,
        type: 'text',
        text: { 
          body: '🧪 Test message from Leena.ai admin panel\n\nIf you received this, the WhatsApp integration is working correctly!' 
        }
      })
    })

    const responseData = await response.json()
    console.log('WhatsApp API response:', responseData)

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Test message sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-test-whatsapp function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send test message' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
