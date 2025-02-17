
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
  whatsapp_preferences: {
    phone_number: string
  }
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

    // Get pending messages with their associated preferences
    const { data: messages, error: fetchError } = await supabaseAdmin
      .from('whatsapp_messages')
      .select(`
        *,
        whatsapp_preferences!inner(phone_number)
      `)
      .eq('status', 'pending')
      .limit(10)

    if (fetchError) {
      console.error('Error fetching messages:', fetchError)
      throw fetchError
    }

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending messages' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process each message
    for (const message of messages) {
      try {
        const whatsappApiUrl = 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages'
        const response = await fetch(whatsappApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('WHATSAPP_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: message.whatsapp_preferences.phone_number,
            type: 'text',
            text: { body: message.content }
          })
        })

        if (!response.ok) {
          throw new Error(`WhatsApp API error: ${response.statusText}`)
        }

        // Update message status to sent
        const { error: updateError } = await supabaseAdmin
          .from('whatsapp_messages')
          .update({ 
            status: 'sent',
            updated_at: new Date().toISOString()
          })
          .eq('id', message.id)

        if (updateError) {
          console.error('Error updating message status:', updateError)
        }

      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error)
        
        // Update message status to failed
        const { error: updateError } = await supabaseAdmin
          .from('whatsapp_messages')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', message.id)

        if (updateError) {
          console.error('Error updating message status:', updateError)
        }
      }
    }

    return new Response(
      JSON.stringify({ message: 'Messages processed successfully' }),
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
