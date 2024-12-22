import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";
import { ProfileFormData } from "@/utils/profileCalculations";

interface BasicInfoFieldsProps {
  register: UseFormRegister<ProfileFormData>;
}

export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ register }) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="height">Height (cm)</Label>
        <Input
          id="height"
          type="number"
          {...register('height_cm', { valueAsNumber: true })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="weight">Weight (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
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