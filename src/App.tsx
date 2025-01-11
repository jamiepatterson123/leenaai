import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthPage from "@/pages/Auth";
import Index from "@/pages/Index";
import { Reports } from "@/pages/Reports";
import Profile from "@/pages/Profile";
import FoodDiary from "@/pages/FoodDiary";
import Coach from "@/pages/Coach";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<Index />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/food-diary" element={<FoodDiary />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;