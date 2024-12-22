import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ProfileFormData } from "@/utils/profileCalculations";
import { BasicInfoFields } from "./BasicInfoFields";
import { SelectFields } from "./SelectFields";

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => void;
  onChange: (data: Partial<ProfileFormData>) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  onChange,
}) => {
  const { register, handleSubmit, setValue, watch } = useForm<ProfileFormData>({
    defaultValues: initialData,
  });

  const formData = watch();

  React.useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BasicInfoFields register={register} />
        <SelectFields
          gender={formData.gender || ""}
          activityLevel={formData.activity_level || ""}
          fitnessGoals={formData.fitness_goals || ""}
          onGenderChange={(value) => setValue("gender", value)}
          onActivityLevelChange={(value) => setValue("activity_level", value)}
          onFitnessGoalsChange={(value) => setValue("fitness_goals", value)}
        />
      </div>

      <Button type="submit" className="w-full">
        Save Profile
      </Button>
    </form>
  );
};