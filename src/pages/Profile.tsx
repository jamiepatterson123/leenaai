import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { CustomTargets } from "@/components/profile/CustomTargets";
import { PasswordChange } from "@/components/profile/PasswordChange";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateTargets } from "@/utils/profileCalculations";
import type { ProfileFormData } from "@/utils/profileCalculations";
import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileFormData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Please sign in to view your profile");
          navigate("/auth");
          return;
        }
        await fetchProfile();
      } catch (error) {
        console.error("Error checking auth:", error);
        toast.error("Authentication error");
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <div className="text-muted-foreground animate-pulse">
            Loading profile...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="inline-flex items-center justify-center rounded-full w-6 h-6 hover:bg-gray-100 transition-colors">
                <Info className="h-4 w-4 text-gray-500" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Why do we need this information?</h4>
                <p className="text-sm text-muted-foreground">
                  Your biometric data helps us calculate your personalized nutrition targets. We use scientifically-backed formulas to determine your:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li>Basal Metabolic Rate (BMR)</li>
                  <li>Daily calorie needs</li>
                  <li>Optimal macro-nutrient ratios</li>
                </ul>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="space-y-6">
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

          <PasswordChange />
        </div>
      </div>
    </>
  );
};

export default Profile;