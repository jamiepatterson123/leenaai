
import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface TrialGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const TrialGuard: React.FC<TrialGuardProps> = ({ children, fallback }) => {
  const { hasAccess, isLoading, redirectToCheckout } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D946EF]"></div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-[#D946EF]/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-[#D946EF]" />
          </div>
          <CardTitle>Premium Feature</CardTitle>
          <CardDescription>
            Your free trial has ended. Upgrade to premium to continue using Leena.ai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={redirectToCheckout}
            className="w-full bg-[#D946EF] hover:bg-[#D946EF]/90"
          >
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
