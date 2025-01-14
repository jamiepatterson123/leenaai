import { Navigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import { QueryClient } from "@tanstack/react-query";

interface ProtectedRouteProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export const ProtectedRoute = ({ children, queryClient }: ProtectedRouteProps) => {
  const { session, loading } = useAuthSession(queryClient);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};