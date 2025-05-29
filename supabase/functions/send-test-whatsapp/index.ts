
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
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client with the user's session
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    console.log(`Sending test message for user: ${user.id}`);

    // Check if user has admin role
    const { data: hasAdminRole, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !hasAdminRole) {
      throw new Error('Admin access required')
    }

    // Get user's WhatsApp preferences
    const { data: preferences, error: prefsError } = await supabase
      .from('whatsapp_preferences')
      .select('phone_number')
      .eq('user_id', user.id)
      .single()

    if (prefsError || !preferences?.phone_number) {
      throw new Error('WhatsApp phone number not configured')
    }

    console.log(`Sending test message to: ${preferences.phone_number}`);

    // Send test message directly via WhatsApp API
    const whatsappApiUrl = 'https://graph.facebook.com/v17.0/15551753639/messages'
    const whatsappPayload = {
      messaging_product: 'whatsapp',
      to: preferences.phone_number,
      type: 'text',
      text: { 
        body: `🧪 Test message from Leena.ai!\n\nSent at: ${new Date().toLocaleString()}\n\nIf you received this, your WhatsApp integration is working correctly! 🎉` 
      }
    };

    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('WHATSAPP_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(whatsappPayload)
    })

    const responseData = await response.json();
    console.log('WhatsApp API response:', JSON.stringify(responseData));

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}, Response: ${JSON.stringify(responseData)}`)
    }

    // Log the test message in our database
    const { error: logError } = await supabase
      .from('whatsapp_messages')
      .insert({
        user_id: user.id,
        content: whatsappPayload.text.body,
        message_type: 'test',
        status: 'sent'
      })

    if (logError) {
      console.error('Error logging test message:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test message sent successfully',
        whatsapp_response: responseData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-test-whatsapp function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
