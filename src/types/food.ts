
export interface FoodDiaryEntry {
  id: string;
  user_id: string;
  food_name: string;
  weight_g: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  category?: string;
  state?: string;
  created_at: string;
  meal_name?: string;
  meal_id?: string;
}
