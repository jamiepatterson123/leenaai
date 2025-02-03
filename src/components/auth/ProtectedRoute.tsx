import { Navigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { AuthLoading } from "./AuthLoading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, loading } = useSession();

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