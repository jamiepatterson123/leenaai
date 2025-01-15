export const getNutritionInfo = async (content: string) => {
  try {
    console.log("Raw content from OpenAI:", content);
    
    // Remove markdown formatting if present
    let jsonStr = content;
    if (content.includes("```json")) {
      jsonStr = content.replace(/```json\n|\n```/g, "");
    }
    
    // Clean up any remaining markdown or text
    jsonStr = jsonStr.replace(/^\s*\[|\]\s*$/g, "");
    
    console.log("Cleaned JSON string:", jsonStr);
    
    let parsedData;
    try {
      parsedData = JSON.parse(`[${jsonStr}]`);
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