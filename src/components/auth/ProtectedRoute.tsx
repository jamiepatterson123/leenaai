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
    // Clear any persisted auth state
    localStorage.removeItem('supabase.auth.token');
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};