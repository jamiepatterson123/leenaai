
import { Navigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { AuthLoading } from "./AuthLoading";
import { useEffect } from "react";
import { triggerSuccessConfetti } from "@/utils/confetti";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, loading } = useSession();

  useEffect(() => {
    // Celebrate authentication success on initial protected route access
    // This covers cases where the user is already logged in and navigates to a protected route
    if (session && !loading) {
      const hasJustAuthenticated = sessionStorage.getItem('just_authenticated');
      if (hasJustAuthenticated === 'true') {
        // Only trigger once per session
        triggerSuccessConfetti();
        sessionStorage.removeItem('just_authenticated');
      }
    }
  }, [session, loading]);

  if (loading) {
    return <AuthLoading />;
  }

  if (!session) {
    // Clear any existing auth data and redirect to auth page
    localStorage.removeItem('supabase.auth.token');
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
