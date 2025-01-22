import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import FoodDiary from "./pages/FoodDiary";
import Profile from "./pages/Profile";
import { Reports } from "./pages/Reports";
import { Navigation } from "./components/Navigation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen pb-10">
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/food-diary" element={<FoodDiary />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;