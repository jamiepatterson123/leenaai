
import { OpenAIClient } from './openai-client.ts';
import { FoodItem } from './types.ts';
import { SYSTEM_PROMPTS } from './constants.ts';

export class ImageProcessor {
  constructor(private openAIClient: OpenAIClient) {}

  async processImage(image: string): Promise<{ foods: FoodItem[] }> {
    console.log('Processing image input');
    
    if (!image.match(/^[A-Za-z0-9+/=]+$/)) {
      throw new Error('Invalid base64 image data');
    }

    const openAIResponse = await this.openAIClient.makeRequest({
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
    });

    console.log('Raw OpenAI response:', openAIResponse);

    if (!openAIResponse.choices?.[0]?.message?.content) {
      throw new Error('Empty response from OpenAI');
    }

    return this.parseImageResponse(openAIResponse.choices[0].message.content);
  }

  private parseImageResponse(content: string): { foods: FoodItem[] } {
    console.log('Full response content:', content);
    
    // Extract JSON array from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    
    const jsonStr = jsonMatch[0];
    console.log('Extracted JSON string:', jsonStr);
    const foods = JSON.parse(jsonStr);

    // Validate that we have an array of food items
    if (!Array.isArray(foods) || foods.length === 0) {
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

    return { foods: validatedFoods };
  }
}
