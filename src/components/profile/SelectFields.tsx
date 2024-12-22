import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFieldsProps {
  gender: string;
  activityLevel: string;
  fitnessGoals: string;
  onGenderChange: (value: string) => void;
  onActivityLevelChange: (value: string) => void;
  onFitnessGoalsChange: (value: string) => void;
}

export const SelectFields: React.FC<SelectFieldsProps> = ({
  gender,
  activityLevel,
  fitnessGoals,
  onGenderChange,
  onActivityLevelChange,
  onFitnessGoalsChange,
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select onValueChange={onGenderChange} value={gender}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activity_level">Activity Level</Label>
        <Select onValueChange={onActivityLevelChange} value={activityLevel}>
          <SelectTrigger>
            <SelectValue placeholder="Select activity level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentary">Sedentary</SelectItem>
            <SelectItem value="lightly_active">Lightly Active</SelectItem>
            <SelectItem value="moderately_active">Moderately Active</SelectItem>
            <SelectItem value="very_active">Very Active</SelectItem>
            <SelectItem value="extra_active">Extra Active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fitness_goals">Fitness Goals</Label>
        <Select onValueChange={onFitnessGoalsChange} value={fitnessGoals}>
          <SelectTrigger>
            <SelectValue placeholder="Select your primary fitness goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weight_loss">Weight Loss</SelectItem>
            <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};