
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { analyzeMessageIntent } from './message-intent.ts';
import { fetchRelevantData } from './data-fetcher.ts';
import { buildContextForIntent } from './context-builder.ts';
import { createThread, addMessageToThread, createAndWaitForRun, getLatestAssistantMessage } from './openai-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASSISTANT_ID = 'asst_gCaTiV0aEDfB8SfJmoqH9V6Z';
const CONSULTATION_ASSISTANT_ID = 'asst_G8uPDKNcQLl3Y1xiKqvCT45X';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, threadId, image, consultationMode, extractInsights } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Choose assistant based on mode
    const assistantId = consultationMode ? CONSULTATION_ASSISTANT_ID : ASSISTANT_ID;

    // For consultation mode, we don't need complex data context
    let messageContent = [];
    
    if (consultationMode) {
      // Simple context for consultation
      messageContent.push({
        type: "text",
        text: message
      });
    } else if (extractInsights) {
      // Special mode for extracting insights
      messageContent.push({
        type: "text",
        text: message
      });
    } else {
      // Fetch user's profile data including consultation insights
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Analyze user message to determine what data to fetch
      const dataIntent = analyzeMessageIntent(message);
      console.log('Data intent analyzed:', dataIntent);

      // Fetch relevant data based on intent
      const contextData = await fetchRelevantData(supabaseClient, userId, dataIntent);

      // Build context based on intent, now including consultation insights
      const nutritionContext = buildContextForIntent(profile, contextData, dataIntent);

      // Add text content first
      messageContent.push({
        type: "text",
        text: `User data context:\n${nutritionContext}\n\nUser message: ${message}`
      });
    }

    // Add image if provided - this must be added after text content
    if (image) {
      console.log('Adding image to message content');
      messageContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${image}`,
          detail: "high"
        }
      });
    }

    // Create or use existing thread
    let currentThreadId = threadId;
    if (!currentThreadId) {
      currentThreadId = await createThread();
    }

    // Add message to thread
    await addMessageToThread(currentThreadId, messageContent);

    // Create run and wait for completion
    await createAndWaitForRun(currentThreadId, assistantId);

    // Get the assistant's response
    const aiResponse = await getLatestAssistantMessage(currentThreadId);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      threadId: currentThreadId 
    }), {
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
