
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
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

    // Get the new API key from request body if provided, otherwise use the default
    const body = await req.json().catch(() => ({}))
    const newApiKey = body.apiKey || 'EAAYKEghxr0YBOwMvoIEmKPhsAr7vZBn05ZCPcovwzBv6DRV6tigZBGNlqk3kJo1zdpkcTqawcONhsZBllThFtt4RdiVypU0yea0vG3u0B78ZCoBZA5dFdgc5f42z6ofztL5mRWAI8APZCZApswkplgw1Jcv7HhDf2w28wBeuBHiENYff2A2WQ1kY6fMrfp7UVf1aBGxTXrjeeRJ1WLNWYXUCjs6cbBjzNbgZD'

    console.log('Updating WHATSAPP_API_KEY with new token...')

    // First try to update the existing key
    const { error: updateError } = await supabaseAdmin
      .from('secrets')
      .update({ value: newApiKey })
      .eq('name', 'WHATSAPP_API_KEY')

    if (updateError) {
      console.log('Update failed, trying insert:', updateError)
      // If update fails, try to insert (in case the key doesn't exist)
      const { error: insertError } = await supabaseAdmin
        .from('secrets')
        .insert({
          name: 'WHATSAPP_API_KEY',
          value: newApiKey
        })

      if (insertError) {
        console.error('Insert also failed:', insertError)
        throw insertError
      }
    }

    console.log('WHATSAPP_API_KEY updated successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WHATSAPP_API_KEY updated successfully',
        phoneNumberId: '15551753639'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error updating WHATSAPP_API_KEY:', error)
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
