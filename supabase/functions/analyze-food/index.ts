import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "./utils/cors.ts";
import { analyzeImageWithVision } from "./utils/vision.ts";
import { getNutritionInfo } from "./utils/nutrition.ts";
import { parseVisionResponse, mergeNutritionData } from "./utils/parser.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log("Starting analyze-food function");
    
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
    console.log("Calling OpenAI Vision API...");
    const visionData = await analyzeImageWithVision(image, openAIApiKey);
    
    let foodList = parseVisionResponse(visionData);

    // Check if all items already have nutrition information (from meal prep labels)
    const needsNutritionInfo = foodList.some(item => !item.nutrition);

    if (needsNutritionInfo) {
      // Only make the second API call if we need nutrition information
      console.log("Some items need nutrition info, calling OpenAI for nutrition analysis...");
      const nutritionData = await getNutritionInfo(foodList, openAIApiKey);
      console.log("Nutrition analysis response received");
      foodList = mergeNutritionData(foodList, nutritionData);
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