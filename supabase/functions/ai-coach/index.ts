import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, generateSuggestions } = await req.json();

    // Initialize OpenAI
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const configuration = new Configuration({ apiKey: openAiKey });
    const openai = new OpenAIApi(configuration);

    // Get user profile data
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Prepare the conversation context
    let systemPrompt = "You are a knowledgeable nutrition coach. ";
    if (profile) {
      systemPrompt += `The user has the following profile: 
        Age: ${profile.age}, 
        Gender: ${profile.gender},
        Weight: ${profile.weight_kg}kg, 
        Height: ${profile.height_cm}cm, 
        Activity Level: ${profile.activity_level},
        Fitness Goals: ${profile.fitness_goals},
        Dietary Restrictions: ${profile.dietary_restrictions?.join(', ')}`;
    }

    console.log('Sending request to OpenAI with system prompt:', systemPrompt);

    // Get response from OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    console.log('Received response from OpenAI:', completion.data);

    const response = completion.data.choices[0].message?.content || "I'm sorry, I couldn't process that request.";

    // Generate follow-up suggestions if requested
    let suggestions = [];
    if (generateSuggestions) {
      console.log('Generating suggestions...');
      
      const suggestionsPrompt = `Based on the user's profile and our conversation:
User Profile:
- Age: ${profile?.age}
- Weight: ${profile?.weight_kg}kg
- Goals: ${profile?.fitness_goals}
- Dietary Restrictions: ${profile?.dietary_restrictions?.join(', ')}

Last Question: "${message}"
My Response: "${response}"

Generate 4 relevant follow-up questions that would be helpful for the user's nutrition and fitness journey. Focus on:
1. Daily nutrition advice
2. Progress tracking
3. Goal-specific recommendations
4. Personalized meal planning

Make questions concise and specific to their profile.`;

      const suggestionsCompletion = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a nutrition coach assistant. Generate relevant follow-up questions based on the user's profile and conversation context." },
          { role: "user", content: suggestionsPrompt }
        ],
        temperature: 0.7,
      });

      const suggestionsText = suggestionsCompletion.data.choices[0].message?.content || "";
      suggestions = suggestionsText
        .split('\n')
        .map(s => s.replace(/^\d+\.\s*/, '').trim())
        .filter(s => s.length > 0 && s.endsWith('?'))
        .slice(0, 4);
        
      console.log('Generated suggestions:', suggestions);

      // If we don't get enough suggestions, add some defaults
      const defaultSuggestions = [
        "What advice would you give me from today's nutrition?",
        "How can I improve my meal planning for tomorrow?",
        "Based on my profile, what should my macros be?",
        "What are healthy snack options for my fitness goals?"
      ];

      while (suggestions.length < 4) {
        suggestions.push(defaultSuggestions[suggestions.length]);
      }
    }

    return new Response(
      JSON.stringify({ response, suggestions }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in AI coach:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});