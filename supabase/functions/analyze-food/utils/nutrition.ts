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
      model: "gpt-4o",
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

  const data = await response.json();
  console.log("OpenAI response:", data);

  // Extract the content from the OpenAI response
  const content = data.choices[0].message.content.trim();
  console.log("Extracted content:", content);

  // Parse the JSON from the content
  try {
    const parsedData = JSON.parse(content);
    console.log("Parsed nutrition data:", parsedData);
    
    if (!parsedData.foods || !Array.isArray(parsedData.foods)) {
      console.error("Invalid nutrition data format:", parsedData);
      throw new Error('Invalid nutrition data format: missing foods array');
    }

    return parsedData;
  } catch (error) {
    console.error("Error parsing nutrition data:", error, "Content:", content);
    throw new Error(`Failed to parse nutrition data: ${error.message}`);
  }
};