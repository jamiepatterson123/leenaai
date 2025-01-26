import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY')
const whatsappApiUrl = 'https://graph.facebook.com/v17.0/FROM_PHONE_NUMBER_ID/messages' // Replace FROM_PHONE_NUMBER_ID with your WhatsApp Business Account's phone number ID

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessage {
  phoneNumber: string
  message: string
  type: 'reminder' | 'weekly_report'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { phoneNumber, message, type }: WhatsAppMessage = await req.json()

    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: message }
      }),
    })

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${await response.text()}`)
    }

    const result = await response.json()
    console.log('WhatsApp message sent:', result)

    // Store message in database
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    const { error: dbError } = await supabase
      .from('whatsapp_messages')
      .insert({
        user_id: user.id,
        message_type: type,
        content: message,
        status: 'sent'
      })

    if (dbError) {
      throw dbError
    }

    return new Response(
      JSON.stringify({ success: true, result }),
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