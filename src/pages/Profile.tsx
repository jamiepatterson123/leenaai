import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { NutritionBarChart } from "@/components/NutritionBarChart";

interface ProfileFormData {
  height_cm: number;
  weight_kg: number;
  age: number;
  activity_level: string;
  dietary_restrictions: string[];
  fitness_goals: string;
  gender: string;
}

interface TargetCalculations {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

const calculateBMR = (data: ProfileFormData): number => {
  const { weight_kg, height_cm, age, gender } = data;
  const baseBMR = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
};

const getActivityMultiplier = (activityLevel: string): number => {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  return multipliers[activityLevel as keyof typeof multipliers] || 1.2;
};

const calculateTargets = (data: ProfileFormData): TargetCalculations => {
  const bmr = calculateBMR(data);
  const tdee = bmr * getActivityMultiplier(data.activity_level);
  
  let targetCalories = tdee;
  
  // Adjust calories based on fitness goals
  switch (data.fitness_goals) {
    case 'weight_loss':
      targetCalories *= 0.8; // 20% deficit
      break;
    case 'muscle_gain':
      targetCalories *= 1.1; // 10% surplus
      break;
    // maintenance stays at TDEE
  }

  // Calculate macros
  const protein = data.weight_kg * 2; // 2g per kg
  const proteinCalories = protein * 4;
  
  const fatCalories = targetCalories * 0.3; // 30% of calories from fat
  const fat = fatCalories / 9;
  
  const remainingCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = remainingCalories / 4;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
  };
};

const Profile = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState<TargetCalculations | null>(null);
  const { register, handleSubmit, setValue, watch } = useForm<ProfileFormData>();
  const formData = watch();

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    if (formData.height_cm && formData.weight_kg && formData.age && formData.activity_level && formData.gender) {
      const newTargets = calculateTargets(formData);
      setTargets(newTargets);
    }
  }, [formData]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setEmail(user.email || "");
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setValue('height_cm', profile.height_cm);
          setValue('weight_kg', profile.weight_kg);
          setValue('age', profile.age);
          setValue('activity_level', profile.activity_level);
          setValue('dietary_restrictions', profile.dietary_restrictions);
          setValue('fitness_goals', profile.fitness_goals);
          setValue('gender', profile.gender);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...data
        });

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">Profile</h1>
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-6 w-6" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health & Fitness Information</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {targets && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-lg">
                  Target Calories: {targets.calories} kcal/day
                </div>
                <NutritionBarChart
                  data={[
                    { name: 'Protein', value: targets.protein, fill: '#22c55e' },
                    { name: 'Fat', value: targets.fat, fill: '#eab308' },
                    { name: 'Carbs', value: targets.carbs, fill: '#3b82f6' },
                  ]}
                />
                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>Protein: {targets.protein}g</div>
                  <div>Fat: {targets.fat}g</div>
                  <div>Carbs: {targets.carbs}g</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;