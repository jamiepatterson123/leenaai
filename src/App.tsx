
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TopProgressBar } from "@/components/ui/top-progress-bar";
import { AppContent } from "@/components/AppContent";
import { AnalyzingProvider } from "@/context/AnalyzingContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalyzingProvider>
        <TooltipProvider>
          <Toaster />
          <TopProgressBar />
          <AppContent />
        </TooltipProvider>
      </AnalyzingProvider>
    </QueryClientProvider>
  );
};

export default App;
