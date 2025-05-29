
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

    // Update the WHATSAPP_API_KEY secret
    const newApiKey = 'EAAYKEghxr0YBOwMvoIEmKPhsAr7vZBn05ZCPcovwzBv6DRV6tigZBGNlqk3kJo1zdpkcTqawcONhsZBllThFtt4RdiVypU0yea0vG3u0B78ZCoBZA5dFdgc5f42z6ofztL5mRWAI8APZCZApswkplgw1Jcv7HhDf2w28wBeuBHiENYff2A2WQ1kY6fMrfp7UVf1aBGxTXrjeeRJ1WLNWYXUCjs6cbBjzNbgZD'

    const { error } = await supabaseAdmin
      .from('secrets')
      .upsert({
        name: 'WHATSAPP_API_KEY',
        value: newApiKey
      })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WHATSAPP_API_KEY updated successfully' 
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
