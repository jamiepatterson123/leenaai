
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
};

// Define a type for chart settings that's compatible with JSON
export type ChartSettingsType = {
  visibleCharts?: {
    [key: string]: boolean;
  };
  viewMode?: "charts" | "table";
};
