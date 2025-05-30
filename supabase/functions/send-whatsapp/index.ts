
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessage {
  id: string
  user_id: string
  content: string
  message_type: string
  status: string
}

interface WhatsAppPreferences {
  phone_number: string
  user_id: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key to bypass RLS
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

    console.log("Fetching pending messages...");

    // Get pending messages first
    const { data: messages, error: fetchError } = await supabaseAdmin
      .from('whatsapp_messages')
      .select('*')
      .eq('status', 'pending')
      .limit(10)

    if (fetchError) {
      console.error('Error fetching messages:', fetchError)
      throw fetchError
    }

    console.log(`Found ${messages?.length || 0} pending messages`);

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending messages' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    let successCount = 0;
    let failureCount = 0;

    // Process each message
    for (const message of messages) {
      try {
        console.log(`Processing message ${message.id} for user ${message.user_id}`);
        
        // Get user's WhatsApp preferences separately
        const { data: preferences, error: prefsError } = await supabaseAdmin
          .from('whatsapp_preferences')
          .select('phone_number')
          .eq('user_id', message.user_id)
          .single()

        if (prefsError || !preferences?.phone_number) {
          console.error(`No WhatsApp preferences found for user ${message.user_id}:`, prefsError);
          
          // Update message status to failed
          await supabaseAdmin
            .from('whatsapp_messages')
            .update({ 
              status: 'failed',
              sent_at: new Date().toISOString()
            })
            .eq('id', message.id)
            
          failureCount++;
          continue;
        }

        console.log(`Sending message to phone ${preferences.phone_number}`);
        
        // Use the correct phone number ID from your WhatsApp Business Manager
        const whatsappApiUrl = 'https://graph.facebook.com/v17.0/15551753639/messages'
        const whatsappPayload = {
          messaging_product: 'whatsapp',
          to: preferences.phone_number,
          type: 'text',
          text: { body: message.content }
        };

        console.log('Sending WhatsApp message with payload:', JSON.stringify(whatsappPayload));

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
          throw new Error(`WhatsApp API error: ${response.statusText}, Response: ${JSON.stringify(responseData)}`)
        }

        // Update message status to sent
        const { error: updateError } = await supabaseAdmin
          .from('whatsapp_messages')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', message.id)

        if (updateError) {
          console.error('Error updating message status:', updateError)
        } else {
          successCount++;
          console.log(`Successfully sent message ${message.id}`);
        }

      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error)
        failureCount++;
        
        // Update message status to failed
        const { error: updateError } = await supabaseAdmin
          .from('whatsapp_messages')
          .update({ 
            status: 'failed',
            sent_at: new Date().toISOString()
          })
          .eq('id', message.id)

        if (updateError) {
          console.error('Error updating message status:', updateError)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Messages processed',
        processed: messages.length,
        success: successCount,
        failed: failureCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-whatsapp function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
