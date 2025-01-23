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
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};