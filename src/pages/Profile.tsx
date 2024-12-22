import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateTargets } from "@/utils/profileCalculations";
import type { ProfileFormData } from "@/utils/profileCalculations";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileFormData | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const targets = calculateTargets(data);

      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...data,
          target_calories: targets.calories,
          target_protein: targets.protein,
          target_carbs: targets.carbs,
          target_fat: targets.fat,
        });

      if (error) throw error;
      toast.success("Profile updated successfully");
      await fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleChange = (data: Partial<ProfileFormData>) => {
    if (profile) {
      setProfile({ ...profile, ...data });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      <ProfileForm 
        onSubmit={handleSubmit} 
        onChange={handleChange}
        initialData={profile || undefined} 
      />
    </div>
  );
};

export default Profile;