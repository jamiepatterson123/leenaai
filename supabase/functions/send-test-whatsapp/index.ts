
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
    console.log('Starting send-test-whatsapp function...');

    // Create Supabase client with service role key for admin operations
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

    // Get the authenticated user from the request (Supabase handles JWT verification)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create a client with the user's token to get user info
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    
    if (userError || !user) {
      console.error('Authentication error:', userError?.message);
      throw new Error('Authentication failed')
    }

    console.log(`Processing test message for user: ${user.id}`);

    // Check if user has admin role
    console.log('Checking admin role...');
    const { data: hasAdminRole, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    console.log('Admin role check result:', { hasAdminRole, error: roleError?.message });

    if (roleError) {
      console.error('Role check error:', roleError);
      throw new Error(`Role check failed: ${roleError.message}`)
    }

    if (!hasAdminRole) {
      console.error('User does not have admin role');
      throw new Error('Admin access required')
    }

    // Get user's WhatsApp preferences
    console.log('Fetching WhatsApp preferences...');
    const { data: preferences, error: prefsError } = await supabaseAdmin
      .from('whatsapp_preferences')
      .select('phone_number')
      .eq('user_id', user.id)
      .single()

    console.log('Preferences fetch result:', { 
      phoneNumber: preferences?.phone_number, 
      error: prefsError?.message 
    });

    if (prefsError) {
      console.error('Preferences error:', prefsError);
      throw new Error(`Failed to get WhatsApp preferences: ${prefsError.message}`)
    }

    if (!preferences?.phone_number) {
      console.error('No phone number configured');
      throw new Error('WhatsApp phone number not configured')
    }

    console.log(`Sending test message to: ${preferences.phone_number}`);

    // Get WhatsApp API key from secrets table
    const { data: secretData, error: secretError } = await supabaseAdmin
      .from('secrets')
      .select('value')
      .eq('name', 'WHATSAPP_API_KEY')
      .single()

    if (secretError || !secretData?.value) {
      console.error('Failed to get WhatsApp API key:', secretError)
      throw new Error('WhatsApp API key not configured')
    }

    const whatsappApiKey = secretData.value
    console.log('Retrieved API key from database')

    // Send test message directly via WhatsApp API using your phone number ID
    const whatsappApiUrl = 'https://graph.facebook.com/v17.0/15551753639/messages'
    const whatsappPayload = {
      messaging_product: 'whatsapp',
      to: preferences.phone_number,
      type: 'text',
      text: { 
        body: `🧪 Test message from Leena.ai!\n\nSent at: ${new Date().toLocaleString()}\n\nIf you received this, your WhatsApp integration is working correctly! 🎉\n\nPhone Number ID: 15551753639` 
      }
    };

    console.log('Sending to WhatsApp API...');

    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(whatsappPayload)
    })

    const responseData = await response.json();
    console.log('WhatsApp API response:', JSON.stringify(responseData));

    if (!response.ok) {
      console.error('WhatsApp API error:', response.status, response.statusText);
      throw new Error(`WhatsApp API error: ${response.statusText}, Response: ${JSON.stringify(responseData)}`)
    }

    // Log the test message in our database
    console.log('Logging message in database...');
    const { error: logError } = await supabaseAdmin
      .from('whatsapp_messages')
      .insert({
        user_id: user.id,
        content: whatsappPayload.text.body,
        message_type: 'test',
        status: 'sent'
      })

    if (logError) {
      console.error('Error logging test message:', logError)
      // Don't throw here, as the message was sent successfully
    }

    console.log('Test message sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test message sent successfully',
        whatsapp_response: responseData,
        phone_number_id: '15551753639'
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
