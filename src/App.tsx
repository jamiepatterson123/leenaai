
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
import OneTimeOffer from "./pages/OneTimeOffer";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthLoading } from "./components/auth/AuthLoading";
import { AnalyzingProvider, useAnalyzing } from "./context/AnalyzingContext";
import { Progress } from "@/components/ui/progress";
import Chat from "./pages/Chat";
import { UpgradeButton } from './components/subscription/UpgradeButton';

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

// Loading bar component that will be displayed on all pages
const GlobalLoadingBar = () => {
  const { analyzing } = useAnalyzing();
  
  return analyzing ? (
    <div className="fixed top-0 left-0 w-full z-50">
      <Progress 
        value={100} 
        className="h-2 animate-pulse"
      />
    </div>
  ) : null;
};

// Main App component
function AppContent() {
  return (
    <Router>
      <div className="min-h-screen pb-10">
        <GlobalLoadingBar />
        <Navigation />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<Auth />} />
          
          {/* Make the OTO page accessible without authentication */}
          <Route path="/oto" element={<OneTimeOffer />} />
          
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
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* Landing page or redirect to dashboard if authenticated */}
          <Route
            path="/"
            element={<Landing />}
          />
          
          {/* Catch-all route - redirect to home for any page not found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalyzingProvider>
        <AppContent />
        {/* Add the floating upgrade button */}
        <UpgradeButton />
      </AnalyzingProvider>
    </QueryClientProvider>
  );
}

export default App;
