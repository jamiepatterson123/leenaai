import { useState, useEffect } from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNutritionTargets } from "@/components/nutrition/useNutritionTargets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  const [customTargets, setCustomTargets] = useState({
    protein: targets.protein,
    carbs: targets.carbs,
    fat: targets.fat
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    setCustomTargets({
      protein: targets.protein,
      carbs: targets.carbs,
      fat: targets.fat
    });
  }, [targets]);

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

  const calculateCalories = () => {
    return customTargets.protein * 4 + customTargets.carbs * 4 + customTargets.fat * 9;
  };

  const handleTargetsSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const calories = calculateCalories();
      const { error } = await supabase
        .from("profiles")
        .update({
          target_calories: calories,
          target_protein: customTargets.protein,
          target_carbs: customTargets.carbs,
          target_fat: customTargets.fat,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Nutrition targets updated successfully");
      await fetchProfile();
    } catch (error) {
      console.error("Error updating nutrition targets:", error);
      toast.error("Failed to update nutrition targets");
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
          <CardHeader>
            <CardTitle className="text-2xl">Custom Nutrition Targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={customTargets.protein}
                  onChange={(e) => setCustomTargets(prev => ({ ...prev, protein: Number(e.target.value) }))}
                  className="text-2xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={customTargets.carbs}
                  onChange={(e) => setCustomTargets(prev => ({ ...prev, carbs: Number(e.target.value) }))}
                  className="text-2xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  value={customTargets.fat}
                  onChange={(e) => setCustomTargets(prev => ({ ...prev, fat: Number(e.target.value) }))}
                  className="text-2xl h-12"
                />
              </div>
              <div className="pt-2">
                <div className="text-lg">Calculated Daily Calories</div>
                <div className="text-3xl font-medium">{Math.round(calculateCalories())} kcal</div>
              </div>
              <Button 
                onClick={handleTargetsSubmit}
                className="w-full mt-4"
              >
                Save Targets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;