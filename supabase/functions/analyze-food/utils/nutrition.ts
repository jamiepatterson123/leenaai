const nutritionSystemPrompt = "You are a nutrition expert. Provide accurate nutritional information for the specified food and weight.";

export const getNutritionInfo = async (foods: any[], openAIApiKey: string) => {
  const nutritionPrompt = foods
    .filter(item => !item.nutrition)
    .map(item => `${item.weight_g}g of ${item.name}`)
    .join(", ");

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAIApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: nutritionSystemPrompt
        },
        {
          role: "user",
          content: `Calculate precise nutrition for: ${nutritionPrompt}. Return in JSON format: {"foods": [{"name": string, "weight_g": number, "nutrition": {"calories": number, "protein": number, "carbs": number, "fat": number}}]}. ONLY return the JSON object, no other text.`
        }
      ],
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Nutrition API Error:", errorData);
    throw new Error(`Nutrition API request failed: ${errorData.error?.message || 'Unknown error'}`);
  }

  return response.json();
};