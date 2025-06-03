
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';

export interface SubscriptionState {
  isLoading: boolean;
  isSubscribed: boolean;
  trialActive: boolean;
  trialDaysRemaining: number;
  trialEndDate: Date | null;
  hasAccess: boolean;
}

export const useSubscription = () => {
  const { session } = useSession();
  const [isLoading, setIsLoading] = React.useState(true);
  const [subscriptionState, setSubscriptionState] = React.useState<SubscriptionState>({
    isLoading: true,
    isSubscribed: false,
    trialActive: false,
    trialDaysRemaining: 0,
    trialEndDate: null,
    hasAccess: false,
  });

  const checkSubscription = React.useCallback(async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get or create subscriber record
      const { data: subscriber, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      // If no subscriber record exists, create one with trial
      if (!subscriber) {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        
        const { data: newSubscriber, error: insertError } = await supabase
          .from('subscribers')
          .insert({
            user_id: session.user.id,
            email: session.user.email!,
            trial_start_date: new Date().toISOString(),
            trial_end_date: trialEndDate.toISOString(),
            trial_active: true,
            subscribed: false,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating subscriber:', insertError);
          return;
        }

        setSubscriptionState({
          isLoading: false,
          isSubscribed: false,
          trialActive: true,
          trialDaysRemaining: 7,
          trialEndDate,
          hasAccess: true,
        });
        return;
      }

      const now = new Date();
      const trialEndDate = subscriber.trial_end_date ? new Date(subscriber.trial_end_date) : null;
      const isTrialActive = subscriber.trial_active && trialEndDate && now < trialEndDate;
      const daysRemaining = trialEndDate ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

      setSubscriptionState({
        isLoading: false,
        isSubscribed: subscriber.subscribed,
        trialActive: isTrialActive,
        trialDaysRemaining: daysRemaining,
        trialEndDate,
        hasAccess: subscriber.subscribed || isTrialActive,
      });

    } catch (error) {
      console.error('Error in checkSubscription:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  React.useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const redirectToCheckout = async () => {
    window.open('https://buy.stripe.com/eVqaEYgDQ4Bgam54Dqe7m02', '_blank');
  };

  const redirectToCustomerPortal = async () => {
    // Implementation for customer portal
  };

  const redirectToYearlyCheckout = async () => {
    window.open('https://buy.stripe.com/eVqaEYgDQ4Bgam54Dqe7m02', '_blank');
  };

  return {
    isLoading,
    isSubscribed: subscriptionState.isSubscribed,
    trialActive: subscriptionState.trialActive,
    trialDaysRemaining: subscriptionState.trialDaysRemaining,
    trialEndDate: subscriptionState.trialEndDate,
    hasAccess: subscriptionState.hasAccess,
    checkSubscription,
    redirectToCheckout,
    redirectToCustomerPortal,
    redirectToYearlyCheckout,
    // Legacy properties for compatibility
    dailyLimitReached: !subscriptionState.hasAccess,
    usageCount: 0,
    usageRemaining: subscriptionState.hasAccess ? 999 : 0,
    isWithinFirst24Hours: false,
    hoursUntilNextUse: 0,
    FREE_USAGE_LIMIT: 0,
  };
};
