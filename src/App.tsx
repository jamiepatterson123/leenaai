
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import { Reports } from "./pages/Reports";
import Chat from "./pages/Chat";
import Coach from "./pages/Coach";
import WhatsApp from "./pages/WhatsApp";
import Community from "./pages/Community";
import Learn from "./pages/Learn";
import FoodDiary from "./pages/FoodDiary";
import NutritionConsultation from "./pages/NutritionConsultation";
import OneTimeOffer from "./pages/OneTimeOffer";
import Landing from "./pages/Landing";
import DownloadApp from "./pages/DownloadApp";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSession } from "@/hooks/useSession";
import { AuthLoading } from "@/components/auth/AuthLoading";
import { TopProgressBar } from "@/components/ui/top-progress-bar";

const queryClient = new QueryClient();

const App = () => {
  const { session, loading } = useSession();

  if (loading) {
    return <AuthLoading />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <TopProgressBar />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/download-app" element={<DownloadApp />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="/coach" element={
                <ProtectedRoute>
                  <Coach />
                </ProtectedRoute>
              } />
              <Route path="/whatsapp" element={
                <ProtectedRoute>
                  <WhatsApp />
                </ProtectedRoute>
              } />
              <Route path="/community" element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              } />
              <Route path="/learn" element={
                <ProtectedRoute>
                  <Learn />
                </ProtectedRoute>
              } />
              <Route path="/food-diary" element={
                <ProtectedRoute>
                  <FoodDiary />
                </ProtectedRoute>
              } />
              <Route path="/consultation" element={
                <ProtectedRoute>
                  <NutritionConsultation />
                </ProtectedRoute>
              } />
              <Route path="/offer" element={
                <ProtectedRoute>
                  <OneTimeOffer />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
