import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileFormData } from "@/utils/profileCalculations";

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => void;
  onChange: (data: Partial<ProfileFormData>) => void;
}

export const ProfileForm = ({ initialData, onSubmit, onChange }: ProfileFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<ProfileFormData>({
    defaultValues: initialData,
  });

  const formData = watch();

  // Update parent component when form values change
  React.useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            onValueChange={(value) => setValue('gender', value)}
            value={formData.gender}
          >
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
          <Select
            onValueChange={(value) => setValue('activity_level', value)}
            value={formData.activity_level}
          >
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
          <Select
            onValueChange={(value) => setValue('fitness_goals', value)}
            value={formData.fitness_goals}
          >
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
      </div>

      <Button type="submit" className="w-full">
        Save Profile
      </Button>
    </form>
  );
};