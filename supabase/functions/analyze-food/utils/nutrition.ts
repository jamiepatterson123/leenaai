export const getNutritionInfo = async (content: string) => {
  try {
    console.log("Raw content from OpenAI:", content);
    
    // First, try to find a JSON object or array in the content
    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON found in content");
    }

    let jsonStr = jsonMatch[0];
    
    // Remove any markdown formatting
    if (content.includes("```")) {
      jsonStr = jsonStr.replace(/```json\n|\n```/g, "");
    }
    
    console.log("Cleaned JSON string:", jsonStr);
    
    let parsedData;
    try {
      parsedData = JSON.parse(jsonStr);
      
      // If we got a single object, wrap it in an array
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error(`Failed to parse nutrition data: ${parseError.message}`);
    }

    if (!Array.isArray(parsedData)) {
      throw new Error("Parsed data is not an array");
    }

    return parsedData;
  } catch (error) {
    console.error("Error in getNutritionInfo:", error);
    throw error;
  }
}