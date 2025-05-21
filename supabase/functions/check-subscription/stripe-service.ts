
import Stripe from "https://esm.sh/stripe@14.21.0";
import { logStep } from "./utils.ts";

export interface StripeSubscriptionInfo {
  hasSubscription: boolean;
  subscriptionEnd: string | null;
  subscriptionTier: string | null;
  customerId: string | null;
}

export async function getStripeSubscriptionInfo(stripeKey: string, email: string): Promise<StripeSubscriptionInfo> {
  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
  
  // Set default values
  let hasSubscription = false;
  let subscriptionEnd = null;
  let stripeCustomerId = null;
  let subscriptionTier = null;

  // Check if user is in Stripe and has an active subscription
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length > 0) {
    stripeCustomerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId: stripeCustomerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
      limit: 1,
    });
    
    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      hasSubscription = true;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Determine subscription tier from the subscription's plan interval
      const interval = subscription.items.data[0]?.plan?.interval;
      subscriptionTier = interval === 'year' ? 'yearly' : 'monthly';
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd,
        tier: subscriptionTier
      });
    } else {
      logStep("No active subscription found");
    }
  } else {
    logStep("No Stripe customer found");
  }

  return {
    hasSubscription,
    subscriptionEnd,
    subscriptionTier,
    customerId: stripeCustomerId
  };
}
