import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { generateWeeklyReport } from "../../utils/whatsapp/generateWeeklyReport.ts"

const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY')
const whatsappApiUrl = 'https://graph.facebook.com/v17.0/15551753639/messages'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessage {
  phoneNumber: string
  message: string
  type: 'reminder' | 'weekly_report'
  userId?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { phoneNumber, message, type, userId }: WhatsAppMessage = await req.json()
    let finalMessage = message

    if (type === 'reminder') {
      finalMessage = `🍽️ Daily Nutrition Reminder

Hey there! Time to log your meals and stay on track with your nutrition goals.

📸 Simply take a photo of your food to log it instantly.
💪 Stay consistent with your tracking for better results!

Need help? Just reply to this message.`
    } else if (type === 'weekly_report' && userId) {
      finalMessage = await generateWeeklyReport(userId)
    }

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
        text: { body: finalMessage }
      }),
    })

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${await response.text()}`)
    }

    const result = await response.json()
    console.log('WhatsApp message sent:', result)

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