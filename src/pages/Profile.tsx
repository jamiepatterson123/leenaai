import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { CustomTargets } from "@/components/profile/CustomTargets";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileFormData {
  height_cm: number;
  weight_kg: number;
  age: number;
  gender: string;
  activity_level: string;
  dietary_restrictions: string[];
  fitness_goals: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
}

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

      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...data,
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
      <h1 className="text-3xl font-bold mb-8">Profile and Targets</h1>
      <ProfileForm 
        onSubmit={handleSubmit} 
        onChange={handleChange}
        initialData={profile || undefined} 
      />
      <CustomTargets 
        initialData={{
          target_protein: profile?.target_protein,
          target_carbs: profile?.target_carbs,
          target_fat: profile?.target_fat,
        }}
      />
    </div>
  );
};

export default Profile;