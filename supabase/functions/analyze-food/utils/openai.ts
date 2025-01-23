export const callOpenAIVision = async (openAIApiKey: string, image: string) => {
  console.log("Calling OpenAI Vision API...");
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAIApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4-vision-preview",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: "You are a precise food weight estimation expert. When analyzing food images, pay careful attention to portion sizes and consider these guidelines:\n" +
            "1. For meal prep labels: If you see a nutrition label with food name and macros, extract and return those exact values\n" +
            "2. A typical chicken breast is 150-400g\n" +
            "3. A typical serving of rice is 150-300g\n" +
            "4. A typical serving of vegetables is 100-200g\n" +
            "Consider the plate size and depth of food for better accuracy."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this food image and return a JSON array. If it's a meal prep label, extract the exact values shown. Format: [{\"name\": \"food name\", \"weight_g\": estimated_weight, \"nutrition\": {\"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}}]. If it's a meal prep label with nutrition info, include the nutrition object. For regular food photos, omit the nutrition object. ONLY return the JSON array, no other text."
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

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Vision API Error:", errorData);
    throw new Error(`Vision API request failed: ${errorData.error?.message || 'Unknown error'}`);
  }

  const result = await response.json();
  console.log("OpenAI API Response:", result);
  return result;
}

export const getNutritionInfo = async (openAIApiKey: string, foodList: any[]) => {
  console.log("Getting nutrition info for foods without nutrition data...");
  const nutritionPrompt = foodList
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
          content: "You are a nutrition expert. Provide accurate nutritional information for the specified food and weight."
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
}