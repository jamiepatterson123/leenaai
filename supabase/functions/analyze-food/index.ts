import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callOpenAIVision, getNutritionInfo } from "./utils/openai.ts";
import { parseVisionResponse, parseNutritionResponse } from "./utils/parser.ts";

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
    console.log("Starting image analysis...");
    
    const { image } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    if (!image) {
      console.error('No image data received');
      throw new Error('No image data received');
    }

    console.log("Image data received, length:", image.length);

    // First, analyze the image using the vision model
    const visionData = await callOpenAIVision(openAIApiKey, image);
    let foodList = parseVisionResponse(visionData);

    // Check if all items already have nutrition information (from meal prep labels)
    const needsNutritionInfo = foodList.some(item => !item.nutrition);

    if (needsNutritionInfo) {
      const nutritionData = await getNutritionInfo(openAIApiKey, foodList);
      foodList = parseNutritionResponse(nutritionData, foodList);
    } else {
      console.log("All items have nutrition info from labels, skipping nutrition API call");
    }

    return new Response(JSON.stringify({ foods: foodList }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in analyze-food function:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});