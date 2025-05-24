
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';

export interface SubscriptionState {
  isLoading: boolean;
  isSubscribed: boolean;
}

export const useSubscription = () => {
  const { session } = useSession();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [usageCount, setUsageCount] = React.useState(() => {
    const storedUsage = localStorage.getItem('usageCount');
    return storedUsage ? parseInt(storedUsage) : 0;
  });
  
  // Free usage limit
  const FREE_USAGE_LIMIT = 3;
  
  // Check if user has reached their free limit (only applies to non-subscribers)
  const dailyLimitReached = !isSubscribed && usageCount >= FREE_USAGE_LIMIT;
  
  // Check subscription status from Supabase
  const checkSubscription = async () => {
    if (!session?.user?.email) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_status, current_period_end')
        .eq('email', session.user.email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking subscription:', error);
        setIsSubscribed(false);
      } else if (data) {
        const isActive = data.subscribed && 
                        data.subscription_status === 'active' &&
                        (!data.current_period_end || new Date(data.current_period_end) > new Date());
        setIsSubscribed(isActive);
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check subscription on mount and when session changes
  useEffect(() => {
    checkSubscription();
  }, [session?.user?.email]);

  // Mock function to increment usage count (only for non-subscribers)
  const incrementUsage = async () => {
    if (isSubscribed) {
      return true; // Unlimited for subscribers
    }
    
    if (dailyLimitReached) {
      return false;
    }
    
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('usageCount', newCount.toString());
    return true;
  };
  
  // Reset function for testing purposes
  const resetUsage = () => {
    setUsageCount(0);
    localStorage.setItem('usageCount', '0');
  };

  // Create checkout session
  const redirectToCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };
  
  return {
    isLoading,
    isSubscribed,
    checkSubscription,
    incrementUsage,
    resetUsage,
    redirectToCheckout,
    redirectToCustomerPortal: async () => {},
    redirectToYearlyCheckout: redirectToCheckout,
    dailyLimitReached,
    usageCount,
    usageRemaining: Math.max(0, FREE_USAGE_LIMIT - usageCount),
    isWithinFirst24Hours: true,
    hoursUntilNextUse: 0,
    FREE_USAGE_LIMIT
  };
};
