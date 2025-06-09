
import React from "react";
import { Progress } from "@/components/ui/progress";
import { useAnalyzing } from "@/context/AnalyzingContext";

export const TopProgressBar = () => {
  const { analyzing } = useAnalyzing();
  
  if (!analyzing) return null;
  
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <Progress 
        value={100} 
        className="h-1 rounded-none animate-pulse"
      />
    </div>
  );
};
