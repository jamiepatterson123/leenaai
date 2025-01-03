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
          <SelectContent className="w-[400px]">
            <SelectItem value="sedentary" className="py-3">
              <div className="space-y-1.5">
                <div className="font-medium">Sedentary</div>
                <p className="text-xs text-muted-foreground whitespace-normal leading-relaxed">
                  Little to no exercise, desk job (e.g., office work with minimal movement)
                </p>
              </div>
            </SelectItem>
            <SelectItem value="lightly_active" className="py-3">
              <div className="space-y-1.5">
                <div className="font-medium">Lightly Active</div>
                <p className="text-xs text-muted-foreground whitespace-normal leading-relaxed">
                  Light exercise 1-3 days/week (e.g., walking, light yoga, casual cycling)
                </p>
              </div>
            </SelectItem>
            <SelectItem value="moderately_active" className="py-3">
              <div className="space-y-1.5">
                <div className="font-medium">Moderately Active</div>
                <p className="text-xs text-muted-foreground whitespace-normal leading-relaxed">
                  Moderate exercise 3-5 days/week (e.g., jogging, gym workouts, recreational sports)
                </p>
              </div>
            </SelectItem>
            <SelectItem value="very_active" className="py-3">
              <div className="space-y-1.5">
                <div className="font-medium">Very Active</div>
                <p className="text-xs text-muted-foreground whitespace-normal leading-relaxed">
                  Hard exercise 6-7 days/week (e.g., intense training, competitive sports)
                </p>
              </div>
            </SelectItem>
            <SelectItem value="extra_active" className="py-3">
              <div className="space-y-1.5">
                <div className="font-medium">Extra Active</div>
                <p className="text-xs text-muted-foreground whitespace-normal leading-relaxed">
                  Very hard exercise daily & physical job (e.g., professional athletes, construction work)
                </p>
              </div>
            </SelectItem>
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