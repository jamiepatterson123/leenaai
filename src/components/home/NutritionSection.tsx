import { NutritionCard } from "@/components/NutritionCard";
import { Link } from "react-router-dom";

interface NutritionSectionProps {
  nutritionData: any;
}

export const NutritionSection = ({ nutritionData }: NutritionSectionProps) => {
  const handleDelete = () => {
    // No-op since we don't want to allow deletion from the analysis view
  };

  const handleUpdateCategory = async (foodId: string, newCategory: string) => {
    const { error } = await supabase
      .from('food_diary')
      .update({ category: newCategory })
      .eq('id', foodId);

    if (error) throw error;
    toast.success(`Food category updated to ${newCategory}`);
  };

  return (
    <div className="space-y-6">
      {nutritionData && (
        <NutritionCard 
          foods={nutritionData.foods} 
          onDelete={handleDelete} 
          onUpdateCategory={handleUpdateCategory}
        />
      )}
      <div className="text-center">
        <Link
          to="/food-diary"
          className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2 transition-colors"
        >
          View Food Diary →
        </Link>
      </div>
    </div>
  );
};
