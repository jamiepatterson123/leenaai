
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateTargets } from "@/utils/profileCalculations";
import type { ProfileFormData } from "@/utils/profileCalculations";
import { useQueryClient } from "@tanstack/react-query";

export const useProfileData = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileFormData | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Calculate new targets based on profile data
      const targets = calculateTargets(data);

      // Create a clean copy of profile data, removing any non-database fields
      const { 
        chart_settings, // Remove chart_settings as it doesn't exist in the database schema
        ...profileData 
      } = data;

      // Remove onboarding_completed property if it exists (using a type-safe approach)
      const cleanedData = Object.fromEntries(
        Object.entries(profileData).filter(([key]) => key !== 'onboarding_completed')
      );

      // Log what we're about to save
      console.log("Saving profile data:", cleanedData);

      // Update profile with new data and calculated targets
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...cleanedData,
          target_calories: targets.calories,
          target_protein: targets.protein,
          target_carbs: targets.carbs,
          target_fat: targets.fat,
        });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      // Log weight to weight_history if it exists and is valid
      if (cleanedData.weight_kg) {
        // Convert weight to kg if using imperial units
        const weightInKg = cleanedData.preferred_units === 'imperial' 
          ? cleanedData.weight_kg / 2.20462 
          : cleanedData.weight_kg;
          
        const { error: weightError } = await supabase
          .from("weight_history")
          .insert({
            user_id: user.id,
            weight_kg: weightInKg,
          });
          
        if (weightError) {
          console.error("Error logging weight history:", weightError);
          // Don't throw, just log - we don't want to fail profile update because of weight logging
        }
      }
      
      // Invalidate and refetch queries to ensure data is fresh
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["weightHistory"] });
      
      toast.success("Profile updated successfully");
      
      // Set the profile as saved to hide the reminder on mobile
      setProfileSaved(true);
      
      // Fetch the updated profile
      await fetchProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      // Add more details to the error message if available
      const errorMessage = error.message ? `Failed to update profile: ${error.message}` : "Failed to update profile";
      toast.error(errorMessage);
      throw error; // Rethrow to let the form know submission failed
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (data: Partial<ProfileFormData>) => {
    if (profile) {
      setProfile({ ...profile, ...data });
    }
  };

  return {
    loading,
    profile,
    profileSaved,
    setProfileSaved,
    fetchProfile,
    handleSubmit,
    handleChange
  };
};
