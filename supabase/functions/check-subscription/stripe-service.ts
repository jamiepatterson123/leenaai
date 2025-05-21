
import Stripe from "https://esm.sh/stripe@14.21.0";
import { logStep } from "./utils.ts";

export async function getStripeSubscriptionInfo(
  stripeKey: string, 
  userEmail: string
): Promise<{
  hasSubscription: boolean;
  subscriptionEnd: string | null;
  subscriptionTier: string | null;
  customerId: string | null;
}> {
  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
  
  // First check by email
  let customers = await stripe.customers.list({ email: userEmail, limit: 1 });
  
  // If no customer found by email, check the subscribers table to see if we have a mapping
  if (customers.data.length === 0) {
    logStep("No Stripe customer found by direct email match", { email: userEmail });
    return {
      hasSubscription: false,
      subscriptionEnd: null,
      subscriptionTier: null,
      customerId: null
    };
  }
  
  const customerId = customers.data[0].id;
  logStep("Found Stripe customer", { customerId });
  
  // Check for active subscriptions
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 10, // Check more than 1 in case there are multiple subscriptions
  });
  
  if (subscriptions.data.length === 0) {
    logStep("No active subscriptions found");
    return {
      hasSubscription: false,
      subscriptionEnd: null,
      subscriptionTier: null,
      customerId
    };
  }
  
  // Find the subscription with the latest end date
  let latestSubscription = subscriptions.data[0];
  let latestEndDate = latestSubscription.current_period_end;
  
  for (const sub of subscriptions.data) {
    if (sub.current_period_end > latestEndDate) {
      latestSubscription = sub;
      latestEndDate = sub.current_period_end;
    }
  }
  
  const subscriptionEnd = new Date(latestEndDate * 1000).toISOString();
  
  // Determine subscription tier from price
  let subscriptionTier = null;
  const priceId = latestSubscription.items.data[0]?.price?.id;
  
  // Check if it's yearly or monthly based on price ID
  if (priceId === "price_1RP4bMLKGAMmFDpiFaJZpYlb") {
    subscriptionTier = "yearly";
  } else {
    subscriptionTier = "monthly";
  }
  
  logStep("Active subscription found", { 
    subscriptionId: latestSubscription.id, 
    tier: subscriptionTier,
    endDate: subscriptionEnd 
  });
  
  return {
    hasSubscription: true,
    subscriptionEnd,
    subscriptionTier,
    customerId
  };
}
