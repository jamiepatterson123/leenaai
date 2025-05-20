
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { ProfileFormData } from "@/utils/profileCalculations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicInfoFieldsProps {
  register: UseFormRegister<ProfileFormData>;
  preferredUnits: string;
  onUnitsChange: (value: string) => void;
  watch: UseFormWatch<ProfileFormData>;
}

export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ 
  register, 
  preferredUnits,
  onUnitsChange,
  watch
}) => {
  const heightPlaceholder = preferredUnits === 'imperial' ? 'inches' : 'cm';
  const weightPlaceholder = preferredUnits === 'imperial' ? 'lbs' : 'kg';
  
  const [prevWeight, setPrevWeight] = useState<number | null>(null);
  const currentWeight = watch('weight_kg');
  
  // Log weight changes to weight history
  useEffect(() => {
    // Only update if the weight has been set, is different from previous weight, and is not null/0
    if (currentWeight && currentWeight !== prevWeight && prevWeight !== null) {
      const logWeightHistory = async () => {
        try {
          const weightInKg = preferredUnits === 'imperial' 
            ? currentWeight / 2.20462  // Convert lbs to kg
            : currentWeight;
            
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          const { error } = await supabase
            .from("weight_history")
            .insert({
              user_id: user.id,
              weight_kg: weightInKg,
            });
            
          if (error) throw error;
        } catch (error) {
          console.error("Error logging weight history:", error);
        }
      };
      
      logWeightHistory();
    }
    
    // Update previous weight after handling the change
    if (currentWeight) {
      setPrevWeight(currentWeight);
    }
  }, [currentWeight, preferredUnits, prevWeight]);
  
  // Set initial weight value from the form
  useEffect(() => {
    if (currentWeight && prevWeight === null) {
      setPrevWeight(currentWeight);
    }
  }, [currentWeight, prevWeight]);

  return (
    <>
      <div className="space-y-2">
        <Label>Preferred Units</Label>
        <Select value={preferredUnits} onValueChange={onUnitsChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="metric">Metric (cm, kg)</SelectItem>
            <SelectItem value="imperial">Imperial (in, lbs)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="height">Height ({heightPlaceholder})</Label>
        <Input
          id="height"
          type="number"
          step="0.1"
          placeholder={`Enter height in ${heightPlaceholder}`}
          {...register('height_cm', { valueAsNumber: true })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="weight">Weight ({weightPlaceholder})</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          placeholder={`Enter weight in ${weightPlaceholder}`}
          {...register('weight_kg', { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          {...register('age', { valueAsNumber: true })}
        />
      </div>
    </>
  );
};
