
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FoodItemForm } from "./FoodItemForm";
import { useFoodItems } from "./useFoodItems";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, Eye, RotateCw } from "lucide-react";

interface FoodItem {
  name: string;
  weight_g: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  state: string;
  category?: string;
  confidence?: number;
}

interface FoodVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  foods: FoodItem[];
  onConfirm: (foods: FoodItem[]) => void;
  analysisMetadata?: any;
}

export const FoodVerificationDialog = ({
  isOpen,
  onClose,
  foods,
  onConfirm,
  analysisMetadata,
}: FoodVerificationDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("uncategorized");
  const {
    editedFoods,
    updating,
    tempNames,
    handleNameChange,
    handleNameBlur,
    handleWeightChange,
    handleDeleteFood
  } = useFoodItems(foods);

  const handleConfirm = () => {
    // Apply the selected category to all food items
    const foodsWithCategory = editedFoods.map(food => ({
      ...food,
      category: selectedCategory
    }));
    onConfirm(foodsWithCategory);
  };

  const categories = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  // Calculate average confidence
  const avgConfidence = editedFoods.length > 0 
    ? editedFoods.reduce((sum, food) => sum + (food.confidence || 0.7), 0) / editedFoods.length
    : 0.7;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Verify Food Items
            {analysisMetadata?.image_count > 1 && (
              <Badge variant="secondary" className="text-xs">
                {analysisMetadata.image_count} angles
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Analysis info */}
          {analysisMetadata && (
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                {analysisMetadata.image_count > 1 ? (
                  <>
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Multi-angle analysis completed
                    </span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Single photo analysis
                    </span>
                  </>
                )}
                <Badge className={`text-xs ${getConfidenceColor(avgConfidence)}`}>
                  {getConfidenceLabel(avgConfidence)} confidence
                </Badge>
              </div>
              
              {analysisMetadata.image_count > 1 && (
                <p className="text-xs text-blue-600">
                  Enhanced accuracy from multiple viewing angles
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Meal Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.toLowerCase()} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {editedFoods.map((food, index) => (
            <div key={index} className="space-y-2">
              <FoodItemForm
                name={tempNames[index]}
                weight={food.weight_g}
                index={index}
                isUpdating={updating === index}
                nutrition={food.nutrition}
                onNameChange={handleNameChange}
                onNameBlur={handleNameBlur}
                onWeightChange={handleWeightChange}
                onDelete={handleDeleteFood}
              />
              {food.confidence !== undefined && (
                <div className="flex justify-end">
                  <Badge className={`text-xs ${getConfidenceColor(food.confidence)}`}>
                    {Math.round(food.confidence * 100)}% confidence
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <DialogFooter className="bg-background pt-2 flex-col-reverse sm:flex-row gap-3">
          <Button 
            onClick={handleConfirm}
            disabled={updating !== null || editedFoods.length === 0}
            className="w-full sm:w-auto order-2 sm:order-1"
            variant="gradient"
          >
            Add to Diary
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
