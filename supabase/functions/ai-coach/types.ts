
export interface MessageIntent {
  timeScope: 'today' | 'week' | 'month' | 'trends' | 'comprehensive';
  dataFocus: 'weight' | 'calories' | 'macros' | 'performance' | 'all';
  questionType: 'performance_review' | 'trend_analysis' | 'advice' | 'general';
}

export interface ContextData {
  foodEntries: any[];
  weightHistory: any[];
  timeScope: string;
  startDate: string;
  endDate: string;
}

export interface NutritionAnalysis {
  dailyTotals: { [date: string]: { calories: number; protein: number; carbs: number; fat: number; meals: number } };
  averages: { calories: number; protein: number; carbs: number; fat: number };
  consistency: { overall: number };
}

export interface WeightTrend {
  description: string;
  weeklyRate: number;
  totalChange: number;
}

export interface GoalAnalysis {
  fitnessGoal: string;
  goalStatus: string;
  calorieDeviation: number;
  weightTrend: WeightTrend;
}
