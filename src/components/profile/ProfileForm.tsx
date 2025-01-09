import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ProfileFormData } from "@/utils/profileCalculations";
import { BasicInfoFields } from "./BasicInfoFields";
import { SelectFields } from "./SelectFields";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, watch } = useForm<ProfileFormData>({
    defaultValues: initialData,
  });

  // Use React Query to manage the preferred units state
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("preferred_units")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const [preferredUnits, setPreferredUnits] = React.useState(profile?.preferred_units || initialData?.preferred_units || 'metric');

  // Watch form data changes
  const formData = watch();

  React.useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  // Effect to sync preferred units with profile data
  React.useEffect(() => {
    if (profile?.preferred_units) {
      setPreferredUnits(profile.preferred_units);
    }
  }, [profile?.preferred_units]);

  const handleUnitsChange = async (value: string) => {
    setPreferredUnits(value);
    
    // Convert existing values when switching units
    const currentHeight = formData.height_cm;
    const currentWeight = formData.weight_kg;

    if (currentHeight) {
      if (value === 'imperial') {
        setValue('height_cm', Math.round(currentHeight / 2.54 * 10) / 10); // cm to inches
      } else {
        setValue('height_cm', Math.round(currentHeight * 2.54 * 10) / 10); // inches to cm
      }
    }

    if (currentWeight) {
      if (value === 'imperial') {
        setValue('weight_kg', Math.round(currentWeight * 2.20462 * 10) / 10); // kg to lbs
      } else {
        setValue('weight_kg', Math.round(currentWeight / 2.20462 * 10) / 10); // lbs to kg
      }
    }

    // Update preferred units in the database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ preferred_units: value })
        .eq("user_id", user.id);

      if (error) {
        console.error('Error updating preferred units:', error);
      } else {
        // Invalidate and refetch profile data
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    }
  };

  const handleFormSubmit = (data: ProfileFormData) => {
    // Convert measurements back to metric if using imperial
    if (preferredUnits === 'imperial') {
      data.height_cm = data.height_cm * 2.54; // inches to cm
      data.weight_kg = data.weight_kg / 2.20462; // lbs to kg
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BasicInfoFields 
          register={register} 
          preferredUnits={preferredUnits}
          onUnitsChange={handleUnitsChange}
        />
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