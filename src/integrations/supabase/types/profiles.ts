
export type ProfileRow = {
  id: string;
  user_id: string | null;
  first_name: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  age: number | null;
  activity_level: string | null;
  dietary_restrictions: string[] | null;
  fitness_goals: string | null;
  created_at: string;
  updated_at: string;
  gender: string | null;
  target_calories: number | null;
  target_protein: number | null;
  target_carbs: number | null;
  target_fat: number | null;
  chart_settings: ChartSettingsType | null;
  consultation_completed: boolean | null;
  consultation_insights: ConsultationInsights | null;
  consultation_completed_at: string | null;
};

export type ProfileInsert = {
  id?: string;
  user_id?: string | null;
  first_name?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  age?: number | null;
  activity_level?: string | null;
  dietary_restrictions?: string[] | null;
  fitness_goals?: string | null;
  created_at?: string;
  updated_at?: string;
  gender?: string | null;
  target_calories?: number | null;
  target_protein?: number | null;
  target_carbs?: number | null;
  target_fat?: number | null;
  chart_settings?: ChartSettingsType | null;
  consultation_completed?: boolean | null;
  consultation_insights?: ConsultationInsights | null;
  consultation_completed_at?: string | null;
};

export type ProfileUpdate = {
  id?: string;
  user_id?: string | null;
  first_name?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  age?: number | null;
  activity_level?: string | null;
  dietary_restrictions?: string[] | null;
  fitness_goals?: string | null;
  created_at?: string;
  updated_at?: string;
  gender?: string | null;
  target_calories?: number | null;
  target_protein?: number | null;
  target_carbs?: number | null;
  target_fat?: number | null;
  chart_settings?: ChartSettingsType | null;
  consultation_completed?: boolean | null;
  consultation_insights?: ConsultationInsights | null;
  consultation_completed_at?: string | null;
};

// Define a type for chart settings that's compatible with JSON
export type ChartSettingsType = {
  visibleCharts?: {
    [key: string]: boolean;
  };
  viewMode?: "charts" | "table";
};

// Define a type for consultation insights
export type ConsultationInsights = {
  primaryGoals?: string[];
  challenges?: string[];
  preferences?: string[];
  currentHabits?: string[];
  recommendations?: string[];
  timeConstraints?: string;
  experience_level?: string;
  motivation_factors?: string[];
  barriers?: string[];
  summary?: string;
  consultation_date?: string;
};
