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

const ActivityLevelOption = ({ value, label }: { value: string; label: string }) => (
  <div className="flex items-center justify-between gap-2">
    <span>{label}</span>
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="inline-flex items-center justify-center rounded-full w-5 h-5 hover:bg-gray-100 transition-colors">
          <Info className="h-3 w-3 text-gray-500" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent 
        side="right" 
        align="start" 
        className="w-72 p-3"
        sideOffset={-45}
      >
        <p className="text-sm text-muted-foreground whitespace-normal leading-relaxed">
          {activityLevelInfo[value as keyof typeof activityLevelInfo]}
        </p>
      </HoverCardContent>
    </HoverCard>
  </div>
);

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
            <SelectItem value="sedentary">
              <ActivityLevelOption value="sedentary" label="Sedentary" />
            </SelectItem>
            <SelectItem value="lightly_active">
              <ActivityLevelOption value="lightly_active" label="Lightly Active" />
            </SelectItem>
            <SelectItem value="moderately_active">
              <ActivityLevelOption value="moderately_active" label="Moderately Active" />
            </SelectItem>
            <SelectItem value="very_active">
              <ActivityLevelOption value="very_active" label="Very Active" />
            </SelectItem>
            <SelectItem value="extra_active">
              <ActivityLevelOption value="extra_active" label="Extra Active" />
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