
import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { CustomTargets } from "@/components/profile/CustomTargets";
import { PasswordChange } from "@/components/profile/PasswordChange";
import { WhatsAppPreferences } from "@/components/whatsapp/WhatsAppPreferences";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateTargets } from "@/utils/profileCalculations";
import type { ProfileFormData } from "@/utils/profileCalculations";
import { Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GlowEffect } from "@/components/ui/glow-effect";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StyleWrapper } from "@/components/profile/StyleWrapper";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileFormData | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query to check WhatsApp preferences
  const { data: whatsappPrefs } = useQuery({
    queryKey: ['whatsapp-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('whatsapp_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) return null;
      return data;
    }
  });

  // Query to check if user has set password
  const { data: userMetadata } = useQuery({
    queryKey: ['user-metadata'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.user_metadata;
    }
  });

  // Check for yearly_success parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const yearlySuccess = searchParams.get('yearly_success');
    
    if (yearlySuccess === 'true') {
      toast.success("Thank you for upgrading to an annual plan!", {
        description: "Please complete your profile setup to get the most out of Leena.ai",
        duration: 6000,
      });
      
      // Clean up the URL by removing the parameter
      const newUrl = `${window.location.pathname}`;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location]);

  const isProfileIncomplete = () => {
    if (!profile) return true;

    // Check if essential profile fields are filled
    const hasBasicInfo = profile.height_cm && 
                        profile.weight_kg && 
                        profile.age && 
                        profile.gender && 
                        profile.activity_level && 
                        profile.fitness_goals;

    // Check if WhatsApp preferences are set
    const hasWhatsAppSetup = whatsappPrefs?.phone_number;

    // Check if password has been set (for email signup users)
    const hasSetPassword = userMetadata?.has_set_password;

    return !(hasBasicInfo && hasWhatsAppSetup && hasSetPassword);
  };

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

      // Calculate new targets based on profile data
      const targets = calculateTargets(data);

      // Check if all required fields are filled
      const isCompleted = data.height_cm && 
                          data.weight_kg && 
                          data.age && 
                          data.gender && 
                          data.activity_level && 
                          data.fitness_goals;

      // Update profile with new data and calculated targets
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...data,
          target_calories: targets.calories,
          target_protein: targets.protein,
          target_carbs: targets.carbs,
          target_fat: targets.fat,
          onboarding_completed: isCompleted, // Mark onboarding as completed if all fields are filled
        });

      if (error) throw error;
      toast.success("Profile updated successfully");
      
      // Set the profile as saved to hide the reminder on mobile
      setProfileSaved(true);
      
      // Invalidate profile queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      await fetchProfile();
      
      // If onboarding is complete, offer to redirect to dashboard
      if (isCompleted) {
        toast.success("Profile setup complete!", {
          description: "Your nutritional targets have been calculated based on your information.",
          action: {
            label: "Go to Dashboard",
            onClick: () => navigate("/dashboard")
          }
        });
      }
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

  const handleContinueToDashboard = () => {
    if (!isProfileIncomplete()) {
      navigate("/dashboard");
    } else {
      toast.error("Please complete your profile before continuing", {
        description: "We need your information to calculate accurate nutrition targets."
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Only show the reminder if the profile is incomplete and it hasn't been saved yet on mobile
  const showReminder = isMobile ? (isProfileIncomplete() && !profileSaved) : isProfileIncomplete();

  const renderContent = () => {
    if (isMobile) {
      return (
        <div className="space-y-6">
          {showReminder && (
            <Alert className="mb-6 relative overflow-hidden">
              <GlowEffect
                colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
                mode="flowHorizontal"
                blur="soft"
                duration={3}
              />
              <AlertDescription className="relative z-10 text-white font-bold text-center">
                Important: Fill out your profile now to start generating your monthly custom targets, daily reminders and weekly nutrition reports (takes 1 min)
              </AlertDescription>
            </Alert>
          )}
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
          <StyleWrapper>
            <WhatsAppPreferences />
          </StyleWrapper>
          <StyleWrapper>
            <PasswordChange />
          </StyleWrapper>
          
          <div className="pt-4">
            <Button 
              variant="gradient" 
              className="w-full" 
              onClick={handleContinueToDashboard}
              disabled={isProfileIncomplete()}
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {showReminder && (
          <Alert className="mb-6 relative overflow-hidden">
            <GlowEffect
              colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
              mode="flowHorizontal"
              blur="soft"
              duration={3}
            />
            <AlertDescription className="relative z-10 text-white font-bold text-center">
              Important: Complete your profile to gain access to the dashboard and all features
            </AlertDescription>
          </Alert>
        )}
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
        <StyleWrapper>
          <WhatsAppPreferences />
        </StyleWrapper>
        <StyleWrapper>
          <PasswordChange />
        </StyleWrapper>
        
        <div className="pt-4">
          <Button 
            variant="gradient" 
            className="w-full" 
            onClick={handleContinueToDashboard}
            disabled={isProfileIncomplete()}
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    );
  };

  return (
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

      {renderContent()}
    </div>
  );
};

export default Profile;
