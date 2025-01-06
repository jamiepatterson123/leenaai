import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Navigation } from "@/components/Navigation";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import FoodDiary from "@/pages/FoodDiary";
import Reports from "@/pages/Reports";
import Coach from "@/pages/Coach";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen pb-20 md:pb-0">
          <Navigation />
          <div className="mt-16 md:mt-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/food-diary" element={<FoodDiary />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/coach" element={<Coach />} />
            </Routes>
          </div>
        </div>
        <Toaster position="top-center" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;