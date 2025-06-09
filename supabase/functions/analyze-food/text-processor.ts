
import { OpenAIClient } from './openai-client.ts';
import { FoodItem } from './types.ts';
import { SYSTEM_PROMPTS } from './constants.ts';

export class TextProcessor {
  constructor(private openAIClient: OpenAIClient) {}

  async processText(text: string): Promise<{ foods: FoodItem[] }> {
    console.log('Processing text input:', text);

    const response = await this.openAIClient.makeRequest({
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
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('No response from OpenAI');
    }

    const cleanContent = this.openAIClient.cleanResponse(response.choices[0].message.content);
    console.log('Cleaned content:', cleanContent);
    const foodItems = JSON.parse(cleanContent);

    const foods = await Promise.all(foodItems.map(async (item: any) => {
      const nutritionData = await this.getNutritionData(item);
      return {
        ...item,
        nutrition: nutritionData
      };
    }));

    return { foods };
  }

  private async getNutritionData(item: any) {
    const nutritionResponse = await this.openAIClient.makeRequest({
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
    });

    const cleanNutritionContent = this.openAIClient.cleanResponse(
      nutritionResponse.choices[0]?.message?.content || '{}'
    );

    console.log('Cleaned nutrition content:', cleanNutritionContent);
    return JSON.parse(cleanNutritionContent);
  }
}
