
import React from 'react';

interface TrialGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const TrialGuard: React.FC<TrialGuardProps> = ({ children }) => {
  // Always allow access - no more trial restrictions
  return <>{children}</>;
};
