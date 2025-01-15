import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    // First pass: Identify and separate food items
    console.log("First pass: Identifying food items...");
    const identificationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a precise food identification expert. Your task is to identify and separate distinct food items in the image. Focus on clear separation and description of each item's position and appearance."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "List all distinct food items in this image. Return ONLY a JSON array of objects with 'name' and 'description' fields. Example: [{\"name\": \"chicken breast\", \"description\": \"grilled chicken breast on the left side\"}]. Be specific about location and appearance."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
      })
    });

    if (!identificationResponse.ok) {
      const errorData = await identificationResponse.json();
      console.error("First pass API Error:", errorData);
      throw new Error(`First pass API request failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const identificationData = await identificationResponse.json();
    console.log("First pass completed");

    // Parse the identified items
    let identifiedItems;
    try {
      const content = identificationData.choices[0].message.content.trim();
      console.log("First pass content:", content);
      
      const jsonMatch = content.match(/\[.*\]/s);
      if (!jsonMatch) {
        throw new Error('No JSON array found in first pass response');
      }
      
      identifiedItems = JSON.parse(jsonMatch[0]);
      console.log("Identified items:", identifiedItems);
    } catch (parseError) {
      console.error("Error parsing first pass response:", parseError);
      throw new Error('Failed to parse identified items');
    }

    // Second pass: Weight estimation
    console.log("Second pass: Weight estimation...");
    const weightEstimationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a precise food weight estimation expert. Consider these guidelines:\n" +
              "1. Typical protein portions (chicken/fish/meat):\n" +
              "   - Small: 150-200g\n" +
              "   - Medium: 200-300g\n" +
              "   - Large: 300-400g\n" +
              "2. Common side portions:\n" +
              "   - Rice/Pasta: 150-300g cooked\n" +
              "   - Vegetables: 100-200g\n" +
              "3. Consider each item independently\n" +
              "4. Use plate size, height, and density for reference\n" +
              "5. Account for cooking method (e.g., grilled vs. fried)\n" +
              "Always err on the higher side for protein portions."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze each food item separately: ${JSON.stringify(identifiedItems)}. Return a JSON array matching this format: [{\"name\": \"food name\", \"weight_g\": estimated_weight}]. Focus on realistic portion sizes in grams.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
      })
    });

    if (!weightEstimationResponse.ok) {
      const errorData = await weightEstimationResponse.json();
      console.error("Second pass API Error:", errorData);
      throw new Error(`Second pass API request failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const weightEstimationData = await weightEstimationResponse.json();
    console.log("Second pass completed");

    try {
      const content = weightEstimationData.choices[0].message.content.trim();
      console.log("Second pass content:", content);
      
      const jsonMatch = content.match(/\[.*\]/s);
      if (!jsonMatch) {
        throw new Error('No JSON array found in second pass response');
      }
      
      let foodList = JSON.parse(jsonMatch[0]);
      // Apply calibration factor of 1.1 to weight estimates
      foodList = foodList.map(item => ({
        ...item,
        weight_g: Math.round(item.weight_g * 1.1)
      }));
      console.log("Food list with calibration:", foodList);

      // Now get nutritional information with enhanced accuracy checks
      console.log("Getting nutrition information...");
      const nutritionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a nutrition database expert. Follow these guidelines for accurate nutrition calculations:\n" +
                "1. Cross-reference your calculations with standard USDA database values\n" +
                "2. For meats/fish (per 100g):\n" +
                "   - Chicken breast: ~31g protein\n" +
                "   - Fish: 20-25g protein\n" +
                "   - Beef: 26-29g protein\n" +
                "3. Validation rules:\n" +
                "   - Protein cannot exceed 35g per 100g of any food\n" +
                "   - Total calories should match macros (protein/carbs × 4 + fat × 9)\n" +
                "   - For meat products, protein should be 25-30% of total weight\n" +
                "4. Double-check all calculations before returning\n" +
                "Return ONLY a JSON object in this format: {\"foods\": [{\"name\": string, \"weight_g\": number, \"nutrition\": {\"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}}]}. Round all numbers to integers."
            },
            {
              role: "user",
              content: `Calculate accurate nutrition for: ${JSON.stringify(foodList)}`
            }
          ],
        }),
      });

      if (!nutritionResponse.ok) {
        const errorData = await nutritionResponse.json();
        console.error("Nutrition API Error:", errorData);
        throw new Error(`Nutrition API request failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const nutritionData = await nutritionResponse.json();
      console.log("Nutrition information received");

      try {
        const content = nutritionData.choices[0].message.content.trim();
        console.log("Nutrition content:", content);
        
        const jsonMatch = content.match(/\{.*\}/s);
        if (!jsonMatch) {
          throw new Error('No JSON object found in nutrition response');
        }
        
        const parsedContent = JSON.parse(jsonMatch[0]);
        console.log("Final output:", parsedContent);
        
        return new Response(JSON.stringify(parsedContent), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error("Error parsing nutrition response:", parseError);
        throw new Error('Error processing the nutritional information');
      }

    } catch (error) {
      console.error("Error in final processing:", error);
      throw error;
    }
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
