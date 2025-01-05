import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Toaster } from "sonner";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import FoodDiary from "@/pages/FoodDiary";
import Reports from "@/pages/Reports";
import Coach from "@/pages/Coach";
import ApiSettings from "@/pages/ApiSettings";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen pb-20 md:pb-0">
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/food-diary" element={<FoodDiary />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/api-settings" element={<ApiSettings />} />
          </Routes>
        </div>
        <Toaster position="top-center" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;