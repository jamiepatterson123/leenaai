import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, userId, generateSuggestions } = await req.json()

    // Initialize OpenAI
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('Missing OpenAI API key')
    }

    const configuration = new Configuration({ apiKey: openAiKey })
    const openai = new OpenAIApi(configuration)

    // Get user profile data
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Prepare the conversation context
    let systemPrompt = "You are a knowledgeable nutrition coach. "
    if (profile) {
      systemPrompt += `The user has the following profile: 
        Age: ${profile.age}, 
        Gender: ${profile.gender},
        Weight: ${profile.weight_kg}kg, 
        Height: ${profile.height_cm}cm, 
        Activity Level: ${profile.activity_level},
        Fitness Goals: ${profile.fitness_goals},
        Dietary Restrictions: ${profile.dietary_restrictions?.join(', ')}`
    }

    // Get response from OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
    })

    let response = completion.data.choices[0].message?.content || "I'm sorry, I couldn't process that request."

    // Generate follow-up suggestions if requested
    let suggestions = []
    if (generateSuggestions) {
      const suggestionsCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Based on the previous conversation, generate 4 relevant follow-up questions that the user might want to ask. Make them concise and specific." },
          { role: "user", content: message },
          { role: "assistant", content: response },
          { role: "user", content: "Generate 4 relevant follow-up questions." }
        ],
        temperature: 0.7,
      })

      const suggestionsText = suggestionsCompletion.data.choices[0].message?.content || ""
      suggestions = suggestionsText
        .split('\n')
        .map(s => s.replace(/^\d+\.\s*/, '').trim())
        .filter(s => s.length > 0)
        .slice(0, 4)
    }

    return new Response(
      JSON.stringify({ response, suggestions }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})