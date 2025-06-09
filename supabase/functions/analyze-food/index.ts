
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

import { corsHeaders } from './constants.ts';
import { OpenAIClient } from './openai-client.ts';
import { TextProcessor } from './text-processor.ts';
import { ImageProcessor } from './image-processor.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!req.headers.get('content-type')?.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { image, text } = await req.json();
    
    if (!image && !text) {
      return new Response(
        JSON.stringify({ error: 'No image or text provided' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const openAIClient = new OpenAIClient(apiKey);

    try {
      let result;

      if (text) {
        const textProcessor = new TextProcessor(openAIClient);
        result = await textProcessor.processText(text);
      } else if (image) {
        const imageProcessor = new ImageProcessor(openAIClient);
        result = await imageProcessor.processImage(image);
      }

      return new Response(
        JSON.stringify(result),
        { headers: corsHeaders }
      );

    } catch (error) {
      console.error('Error processing input:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process input', 
          details: error.message,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

  } catch (error) {
    console.error('Error in analyze-food function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: error.message 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
