
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AnalyzingContextType {
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
}

const AnalyzingContext = createContext<AnalyzingContextType | undefined>(undefined);

export const AnalyzingProvider = ({ children }: { children: ReactNode }) => {
  const [analyzing, setAnalyzing] = useState(false);

  return (
    <AnalyzingContext.Provider value={{ analyzing, setAnalyzing }}>
      {children}
    </AnalyzingContext.Provider>
  );
};

export const useAnalyzing = () => {
  const context = useContext(AnalyzingContext);
  if (context === undefined) {
    throw new Error('useAnalyzing must be used within an AnalyzingProvider');
  }
  return context;
};
