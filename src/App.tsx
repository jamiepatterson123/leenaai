import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import FoodDiary from "./pages/FoodDiary";
import Profile from "./pages/Profile";
import { Reports } from "./pages/Reports";
import { Navigation } from "./components/Navigation";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import WhatsApp from "./pages/WhatsApp";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useSession } from "./hooks/useSession";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

function AppRoutes() {
  const { session, loading } = useSession();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen pb-10">
      {session && <Navigation />}
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<Auth />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/food-diary"
          element={
            <ProtectedRoute>
              <FoodDiary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/whatsapp"
          element={
            <ProtectedRoute>
              <WhatsApp />
            </ProtectedRoute>
          }
        />

        {/* Landing page or redirect to dashboard if authenticated */}
        <Route
          path="/"
          element={
            session ? <Navigate to="/dashboard" replace /> : <Landing />
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  );
}

export default App;