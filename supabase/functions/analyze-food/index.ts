
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const SYSTEM_PROMPTS = {
  IMAGE_ANALYSIS: "You are a nutrition expert who identifies individual food items in images. Analyze the image and identify each distinct food item visible. For each item, estimate its specific weight and provide detailed nutrition information.\n\nIMPORTANT WEIGHT GUIDELINES: Provide realistic, non-rounded weights that convey precision. Use specific numbers like 127g, 283g, 157g, 91g instead of rounded numbers like 130g, 300g, 150g, 90g. Weights should vary naturally and not frequently end in 0 or 5.\n\nNUTRITION GUIDELINES: Provide all nutrition values (calories, protein, carbs, fat) as whole numbers without decimals.\n\nReturn your response as a JSON array containing objects for each food item you identify. Each object should have this exact structure:\n{\"name\": \"Specific food name with cooking method\", \"weight_g\": estimated_weight_in_grams, \"nutrition\": {\"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}}\n\nBe specific with food names (e.g., \"Grilled Ribeye Steak\" not just \"steak\"). Estimate weights based on visual cues like plate size, utensils, and portion appearance. Apply a 5% calorie buffer for hidden fats/oils. Return ONLY the JSON array, no other text.",
  
  TEXT_EXTRACTION: "You are a JSON generator for food items. Output only valid JSON arrays containing food items. No markdown, no text, no explanations.",
  
  NUTRITION_ANALYSIS: "You are a JSON generator for nutrition facts. Output only valid JSON objects. No markdown, no text, no explanations."
};

interface FoodItem {
  name: string;
  weight_g: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

serve(async (req) => {
  console.log('analyze-food function started');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API key configured:', !!apiKey);
    
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const contentType = req.headers.get('content-type');
    console.log('Content type:', contentType);
    
    if (!contentType?.includes('application/json')) {
      console.error('Invalid content type:', contentType);
      return new Response(
        JSON.stringify({ error: 'Invalid request - content type must be application/json' }),
        { status: 400, headers: corsHeaders }
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body keys:', Object.keys(requestBody));
    } catch (error) {
      console.error('Failed to parse JSON body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { image, text } = requestBody;
    
    if (!image && !text) {
      console.error('No image or text provided in request');
      return new Response(
        JSON.stringify({ error: 'No image or text provided' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('Processing request with:', { hasImage: !!image, hasText: !!text });

    try {
      let result;

      if (text) {
        console.log('Processing text input');
        result = await processText(text, apiKey);
      } else if (image) {
        console.log('Processing image input');
        result = await processImage(image, apiKey);
      }

      console.log('Processing completed successfully, returning result');
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

async function makeOpenAIRequest(body: any, apiKey: string): Promise<OpenAIResponse> {
  console.log('Making OpenAI API request');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  console.log('OpenAI API response received');
  return result;
}

function cleanResponse(content: string): string {
  return content
    .replace(/```json\n?/g, '')
    .replace(/```/g, '')
    .trim();
}

async function processImage(image: string, apiKey: string): Promise<{ foods: FoodItem[] }> {
  console.log('Starting image processing');
  
  if (!image.match(/^[A-Za-z0-9+/=]+$/)) {
    throw new Error('Invalid base64 image data');
  }

  const openAIResponse = await makeOpenAIRequest({
    model: "gpt-4o",
    temperature: 0.3,
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPTS.IMAGE_ANALYSIS
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Identify each individual food item in this image and provide detailed nutrition estimates for each item separately."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${image}`
            }
          }
        ]
      }
    ]
  }, apiKey);

  console.log('OpenAI image analysis response received');

  if (!openAIResponse.choices?.[0]?.message?.content) {
    throw new Error('Empty response from OpenAI');
  }

  return parseImageResponse(openAIResponse.choices[0].message.content);
}

function parseImageResponse(content: string): { foods: FoodItem[] } {
  console.log('Parsing image response content');
  
  // Extract JSON array from the response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error('No JSON array found in response:', content);
    throw new Error('No JSON array found in response');
  }
  
  const jsonStr = jsonMatch[0];
  console.log('Extracted JSON string:', jsonStr);
  
  let foods;
  try {
    foods = JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    throw new Error('Invalid JSON in OpenAI response');
  }

  // Validate that we have an array of food items
  if (!Array.isArray(foods) || foods.length === 0) {
    console.error('Invalid foods array:', foods);
    throw new Error('Invalid foods array in response');
  }

  // Ensure each food item has the correct structure
  const validatedFoods = foods.map(food => ({
    name: food.name || 'Unknown Food',
    weight_g: food.weight_g || 100,
    nutrition: {
      calories: food.nutrition?.calories || 0,
      protein: food.nutrition?.protein || 0,
      carbs: food.nutrition?.carbs || 0,
      fat: food.nutrition?.fat || 0
    }
  }));

  console.log('Successfully parsed and validated foods:', validatedFoods.length, 'items');
  return { foods: validatedFoods };
}

async function processText(text: string, apiKey: string): Promise<{ foods: FoodItem[] }> {
  console.log('Processing text input:', text);

  const response = await makeOpenAIRequest({
    model: "gpt-4o",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPTS.TEXT_EXTRACTION
      },
      {
        role: "user",
        content: `Extract food items from this text and return a JSON array like this example (NO OTHER TEXT OR FORMATTING): [{"name":"apple","weight_g":100}]. Text: ${text}`
      }
    ],
  }, apiKey);

  if (!response.choices?.[0]?.message?.content) {
    throw new Error('No response from OpenAI');
  }

  const cleanContent = cleanResponse(response.choices[0].message.content);
  console.log('Cleaned text extraction content:', cleanContent);
  
  let foodItems;
  try {
    foodItems = JSON.parse(cleanContent);
  } catch (error) {
    console.error('Failed to parse text extraction JSON:', error);
    throw new Error('Invalid JSON in text extraction response');
  }

  const foods = await Promise.all(foodItems.map(async (item: any) => {
    const nutritionData = await getNutritionData(item, apiKey);
    return {
      ...item,
      nutrition: nutritionData
    };
  }));

  console.log('Successfully processed text input, foods:', foods.length);
  return { foods };
}

async function getNutritionData(item: any, apiKey: string) {
  console.log('Getting nutrition data for:', item.name);
  
  const nutritionResponse = await makeOpenAIRequest({
    model: "gpt-4o",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPTS.NUTRITION_ANALYSIS
      },
      {
        role: "user",
        content: `Return nutrition data as a JSON object like this example (NO OTHER TEXT OR FORMATTING): {"calories":50,"protein":0.5,"carbs":12,"fat":0.2}. Food: ${item.weight_g}g of ${item.name}`
      }
    ],
  }, apiKey);

  const cleanNutritionContent = cleanResponse(
    nutritionResponse.choices[0]?.message?.content || '{}'
  );

  console.log('Cleaned nutrition content:', cleanNutritionContent);
  
  try {
    return JSON.parse(cleanNutritionContent);
  } catch (error) {
    console.error('Failed to parse nutrition JSON:', error);
    // Return default nutrition values if parsing fails
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }
}
