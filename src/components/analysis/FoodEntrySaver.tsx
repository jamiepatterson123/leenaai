import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

export const saveFoodEntries = async (foods: any[]) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    toast.error("You must be logged in to save food entries");
    return;
  }

  const today = format(new Date(), 'yyyy-MM-dd');

  const { error } = await supabase.from("food_diary").insert(
    foods.map((food) => ({
      user_id: user.id,
      food_name: food.name,
      weight_g: food.weight_g,
      calories: food.nutrition.calories,
      protein: food.nutrition.protein,
      carbs: food.nutrition.carbs,
      fat: food.nutrition.fat,
      date: today,
      state: food.state,
    }))
  );

  if (error) {
    toast.error("Failed to save food entries");
    throw error;
  }

  toast.success("Food entries saved to diary!");
};