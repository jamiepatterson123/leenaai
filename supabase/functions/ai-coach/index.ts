import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch user's profile data
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch recent health data
    const { data: appleHealthData } = await supabaseClient
      .from('apple_health_data')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    const { data: whoopData } = await supabaseClient
      .from('whoop_data')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    // Prepare context for the AI
    const healthContext = `
      Recent Health Data:
      ${appleHealthData ? `
        Apple Health Metrics (Last 7 days):
        - Steps: ${calculateAverage(appleHealthData.filter(d => d.data_type === 'steps'))} steps/day
        - Active Energy: ${calculateAverage(appleHealthData.filter(d => d.data_type === 'activeEnergy'))} kcal/day
        - Heart Rate: ${calculateAverage(appleHealthData.filter(d => d.data_type === 'heartRate'))} bpm
      ` : 'No Apple Health data available'}

      ${whoopData ? `
        Whoop Metrics (Last 7 days):
        - Recovery: ${calculateAverage(whoopData.filter(d => d.data_type === 'recovery'))}%
        - Strain: ${calculateAverage(whoopData.filter(d => d.data_type === 'strain'))}
        - Sleep Performance: ${calculateAverage(whoopData.filter(d => d.data_type === 'sleepPerformance'))}%
      ` : 'No Whoop data available'}
    `;

    // Call OpenAI API with enhanced context
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: "You are a knowledgeable nutrition and fitness coach. Analyze the user's health data and provide personalized advice. Be concise but friendly. Focus on actionable insights and encouragement."
          },
          {
            role: 'user',
            content: `Context about the user's health:\n${healthContext}\n\nUser message: ${message}`
          }
        ],
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-coach function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateAverage(data: any[]) {
  if (!data || data.length === 0) return 0;
  return (data.reduce((sum, item) => sum + Number(item.value), 0) / data.length).toFixed(1);
}