import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FoodDiaryPage from "./pages/FoodDiary";
import AuthPage from "./pages/Auth";
import ApiSettings from "./pages/ApiSettings";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Coach from "./pages/Coach";
import Learn from "./pages/Learn";
import Community from "./pages/Community";
import { Navigation } from "./components/Navigation";
import { HelpPopup } from "./components/HelpPopup";
import { HealthDataConnect } from "./components/health/HealthDataConnect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<Index />} />
            <Route path="/food-diary" element={<FoodDiaryPage />} />
            <Route path="/api-settings" element={<ApiSettings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/community" element={<Community />} />
            <Route path="/integrations" element={<HealthDataConnect />} />
          </Routes>
          <HelpPopup />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;