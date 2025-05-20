
export type FoodDiaryRow = {
  calories: number;
  carbs: number;
  category: string | null;
  created_at: string;
  date: string;
  fat: number;
  food_name: string;
  id: string;
  protein: number;
  state: string | null;
  user_id: string | null;
  weight_g: number;
  meal_name: string | null;
  meal_id: string | null;
};

export type FoodDiaryInsert = {
  calories: number;
  carbs: number;
  category?: string | null;
  created_at?: string;
  date?: string;
  fat: number;
  food_name: string;
  id?: string;
  protein: number;
  state?: string | null;
  user_id?: string | null;
  weight_g: number;
  meal_name?: string | null;
  meal_id?: string | null;
};

export type FoodDiaryUpdate = {
  calories?: number;
  carbs?: number;
  category?: string | null;
  created_at?: string;
  date?: string;
  fat?: number;
  food_name?: string;
  id?: string;
  protein?: number;
  state?: string | null;
  user_id?: string | null;
  weight_g?: number;
  meal_name?: string | null;
  meal_id?: string | null;
};
