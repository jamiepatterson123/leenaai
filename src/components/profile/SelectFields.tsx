import React from "react";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface SelectFieldsProps {
  gender: string;
  activityLevel: string;
  fitnessGoals: string;
  onGenderChange: (value: string) => void;
  onActivityLevelChange: (value: string) => void;
  onFitnessGoalsChange: (value: string) => void;
}

const activityLevelInfo = {
  sedentary: "Little to no exercise, desk job (e.g., office work with minimal movement)",
  lightly_active: "Light exercise 1-3 days/week (e.g., walking, light yoga, casual cycling)",
  moderately_active: "Moderate exercise 3-5 days/week (e.g., jogging, gym workouts, recreational sports)",
  very_active: "Hard exercise 6-7 days/week (e.g., intense training, competitive sports)",
  extra_active: "Very hard exercise daily & physical job (e.g., professional athletes, construction work)"
};

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
        <div className="flex items-center gap-2">
          <Label htmlFor="activity_level">Activity Level</Label>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="inline-flex items-center justify-center rounded-full w-5 h-5 hover:bg-gray-100 transition-colors">
                <Info className="h-3 w-3 text-gray-500" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" side="right">
              <div className="space-y-4">
                <h4 className="font-medium">Activity Levels Explained</h4>
                {Object.entries(activityLevelInfo).map(([level, description]) => (
                  <div key={level} className="space-y-1">
                    <p className="font-medium capitalize">{level.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
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
            <SelectItem value="weight_loss">Reduce Bodyfat</SelectItem>
            <SelectItem value="muscle_gain">Lean Muscle Gain</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};