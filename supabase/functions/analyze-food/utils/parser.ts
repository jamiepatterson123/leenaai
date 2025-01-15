export const parseVisionResponse = (visionData: any) => {
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
};

export const mergeNutritionData = (foodList: any[], nutritionData: any) => {
  // Add logging to help debug the issue
  console.log("Merging nutrition data:", { foodList, nutritionData });

  // Validate inputs
  if (!Array.isArray(foodList)) {
    console.error("foodList is not an array:", foodList);
    throw new Error("Invalid foodList: expected array");
  }

  if (!nutritionData || !Array.isArray(nutritionData.foods)) {
    console.log("No nutrition data to merge, returning original food list");
    return foodList;
  }

  return foodList.map(item => {
    if (item.nutrition) {
      console.log(`Item ${item.name} already has nutrition data`);
      return item;
    }

    const nutritionItem = nutritionData.foods.find(
      (f: any) => f.name.toLowerCase() === item.name.toLowerCase()
    );

    if (nutritionItem) {
      console.log(`Found nutrition data for ${item.name}`);
    } else {
      console.log(`No nutrition data found for ${item.name}`);
    }

    return nutritionItem || item;
  });
};