
import { Navigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { AuthLoading } from "./AuthLoading";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCompleteProfile?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireCompleteProfile = true 
}: ProtectedRouteProps) => {
  const { session, loading } = useSession();
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", session.user.id)
          .single();

        if (error) throw error;
        
        setProfileCompleted(!!data?.onboarding_completed);
      } catch (error) {
        console.error("Error checking profile completion:", error);
      } finally {
        setProfileChecked(true);
        setIsCheckingProfile(false);
      }
    };

    if (session?.user?.id && requireCompleteProfile) {
      checkProfileCompletion();
    } else {
      setProfileChecked(true);
      setIsCheckingProfile(false);
    }
  }, [session, requireCompleteProfile]);

  if (loading || (requireCompleteProfile && !profileChecked)) {
    return <AuthLoading />;
  }

  if (!session) {
    // Clear any existing auth data and redirect to auth page
    localStorage.removeItem('supabase.auth.token');
    return <Navigate to="/auth" replace />;
  }

  if (requireCompleteProfile && !profileCompleted && profileChecked) {
    // If profile completion is required but not completed, redirect to profile
    toast.error("Please complete your profile to continue", { 
      id: "profile-incomplete",
      description: "We need your information to calculate accurate nutrition targets."
    });
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};
