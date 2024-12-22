import { useState, useEffect } from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNutritionTargets } from "@/components/nutrition/useNutritionTargets";
import { NutritionTargetsDialog } from "@/components/nutrition/NutritionTargetsDialog";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const targets = useNutritionTargets();

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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      
      <div className="space-y-8">
        <ProfileForm 
          onSubmit={handleSubmit} 
          onChange={handleChange}
          initialData={profile || undefined} 
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl">Custom Nutrition Targets</CardTitle>
            <NutritionTargetsDialog
              currentTargets={targets}
              trigger={
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Settings2 className="w-5 h-5" />
                </Button>
              }
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="text-lg mb-2">Protein (g)</div>
                <div className="text-3xl font-medium">{Math.round(targets.protein)}</div>
              </div>
              <div>
                <div className="text-lg mb-2">Carbs (g)</div>
                <div className="text-3xl font-medium">{Math.round(targets.carbs)}</div>
              </div>
              <div>
                <div className="text-lg mb-2">Fat (g)</div>
                <div className="text-3xl font-medium">{Math.round(targets.fat)}</div>
              </div>
              <div className="pt-2">
                <div className="text-lg">Calculated Daily Calories</div>
                <div className="text-3xl font-medium">{Math.round(targets.calories)} kcal</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
