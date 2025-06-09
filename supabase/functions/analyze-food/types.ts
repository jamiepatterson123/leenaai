
export interface FoodItem {
  name: string;
  weight_g: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface AnalysisOptions {
  setNutritionData?: (data: any) => void;
  saveFoodEntries?: (foods: FoodItem[]) => Promise<void>;
}

export interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}
