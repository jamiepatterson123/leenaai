export const parseVisionResponse = (visionData: any) => {
  console.log("Parsing vision response...");
  const content = visionData.choices[0].message.content.trim();
  console.log("Raw vision content:", content);
  
  const jsonMatch = content.match(/\[.*\]/s);
  if (!jsonMatch) {
    throw new Error('No JSON array found in response');
  }
  
  let foodList = JSON.parse(jsonMatch[0]);
  console.log("Parsed food list:", foodList);
  
  if (!Array.isArray(foodList)) {
    throw new Error('Vision response is not an array');
  }

  // Apply calibration factor to weights
  foodList = foodList.map(item => ({
    ...item,
    weight_g: Math.round(item.weight_g * 1.1) // Calibration factor of 1.1
  }));

  // Validate the structure of each food item
  foodList.forEach((item: any, index: number) => {
    if (!item.name || typeof item.weight_g !== 'number') {
      throw new Error(`Invalid food item at index ${index}`);
    }
  });

  return foodList;
}

export const parseNutritionResponse = (nutritionData: any, originalFoodList: any[]) => {
  console.log("Parsing nutrition response...");
  const content = nutritionData.choices[0].message.content.trim();
  console.log("Raw nutrition content:", content);
  
  const jsonMatch = content.match(/\{.*\}/s);
  if (!jsonMatch) {
    throw new Error('No JSON object found in response');
  }
  
  const parsedContent = JSON.parse(jsonMatch[0]);
  console.log("Parsed nutrition content:", parsedContent);
  
  if (!parsedContent.foods || !Array.isArray(parsedContent.foods)) {
    throw new Error('Invalid response format: missing foods array');
  }

  // Merge nutrition data with existing food list
  return originalFoodList.map(item => {
    if (item.nutrition) return item; // Keep existing nutrition data
    const nutritionItem = parsedContent.foods.find(
      (f: any) => f.name.toLowerCase() === item.name.toLowerCase()
    );
    return nutritionItem || item;
  });
}