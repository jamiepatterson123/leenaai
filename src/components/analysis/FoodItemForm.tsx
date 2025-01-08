import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FoodVerificationDialog } from "./FoodVerificationDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FoodItemFormProps {
  foodData: {
    name: string;
    weight_g: number;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  selectedDate: Date;
  onSuccess?: () => void;
}

export const FoodItemForm: React.FC<FoodItemFormProps> = ({
  foodData,
  selectedDate,
  onSuccess,
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      const { error } = await supabase.from("food_diary").insert([
        {
          food_name: foodData.name,
          weight_g: foodData.weight_g,
          calories: foodData.nutrition.calories,
          protein: foodData.nutrition.protein,
          carbs: foodData.nutrition.carbs,
          fat: foodData.nutrition.fat,
          date: selectedDate.toISOString().split("T")[0],
        },
      ]);

      if (error) throw error;

      toast.success("Food added to diary");
      setIsDialogOpen(false);
      
      // Clean up and navigate
      if (onSuccess) {
        onSuccess();
      }
      
      // Use replace to prevent back navigation to the dialog
      navigate("/food-diary", { 
        replace: true,
        state: { fromVerification: true }
      });
    } catch (error) {
      console.error("Error saving food entry:", error);
      toast.error("Failed to save food entry");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Food Name</Label>
        <Input
          id="name"
          value={foodData.name}
          readOnly
          className="bg-muted"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="weight">Weight (g)</Label>
        <Input
          id="weight"
          value={foodData.weight_g}
          readOnly
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label>Nutrition Information</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              value={foodData.nutrition.calories}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="protein">Protein (g)</Label>
            <Input
              id="protein"
              value={foodData.nutrition.protein}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input
              id="carbs"
              value={foodData.nutrition.carbs}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="fat">Fat (g)</Label>
            <Input
              id="fat"
              value={foodData.nutrition.fat}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>
      </div>

      <Button 
        className="w-full" 
        onClick={() => setIsDialogOpen(true)}
      >
        Verify and Save
      </Button>

      <FoodVerificationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleSave}
        foodData={[foodData]} // Wrap the single food item in an array
      />
    </div>
  );
};