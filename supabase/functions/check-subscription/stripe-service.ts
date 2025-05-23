
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
    
    // Try to find by other emails in our database - this will be handled by the main function
    // that calls getStripeSubscriptionInfo then checks our database for mappings
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
    logStep("No active subscriptions found for email customer");
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
  } else if (priceId === "price_1RP3dMLKGAMmFDpiq07LsXmG") {
    subscriptionTier = "monthly";
  } else {
    // Try to determine from the plan interval if price ID doesn't match known values
    try {
      const interval = latestSubscription.items.data[0]?.plan?.interval;
      if (interval === 'year') {
        subscriptionTier = "yearly";
      } else if (interval === 'month') {
        subscriptionTier = "monthly";
      } else {
        // Default to monthly for any other subscription
        subscriptionTier = "monthly";
      }
    } catch (e) {
      // Default to monthly if we can't determine
      subscriptionTier = "monthly";
    }
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

// Add a helper function to check for any customer that matches a subscription
export async function findCustomerBySubscriptionId(
  stripeKey: string,
  subscriptionId: string
): Promise<string | null> {
  if (!subscriptionId) return null;
  
  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
  
  try {
    logStep("Attempting to retrieve subscription by ID", { subscriptionId });
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription && subscription.customer) {
      const customerId = typeof subscription.customer === 'string' 
        ? subscription.customer 
        : subscription.customer.id;
        
      logStep("Successfully retrieved customer ID from subscription", { customerId });
      return customerId;
    } else {
      logStep("No customer found for this subscription ID", { subscriptionId });
    }
  } catch (error) {
    logStep("Error retrieving subscription", { error: error.message });
  }
  
  return null;
}

// Add additional function to double-check subscription by customer ID
export async function checkSubscriptionByCustomerId(
  stripeKey: string,
  customerId: string
): Promise<{
  hasSubscription: boolean;
  subscriptionEnd: string | null;
  subscriptionTier: string | null;
}> {
  if (!customerId) {
    return {
      hasSubscription: false,
      subscriptionEnd: null,
      subscriptionTier: null
    };
  }
  
  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
  
  try {
    logStep("Checking subscriptions by customer ID", { customerId });
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10
    });
    
    if (subscriptions.data.length === 0) {
      logStep("No active subscriptions found for this customer", { customerId });
      return {
        hasSubscription: false,
        subscriptionEnd: null,
        subscriptionTier: null
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
    
    // Determine subscription tier from price or plan interval
    let subscriptionTier = null;
    const priceId = latestSubscription.items.data[0]?.price?.id;
    
    if (priceId === "price_1RP4bMLKGAMmFDpiFaJZpYlb") {
      subscriptionTier = "yearly";
    } else if (priceId === "price_1RP3dMLKGAMmFDpiq07LsXmG") {
      subscriptionTier = "monthly";
    } else {
      // Try to determine from the plan interval
      try {
        const interval = latestSubscription.items.data[0]?.plan?.interval;
        if (interval === 'year') {
          subscriptionTier = "yearly";
        } else if (interval === 'month') {
          subscriptionTier = "monthly";
        } else {
          subscriptionTier = "monthly"; // Default
        }
      } catch (e) {
        subscriptionTier = "monthly"; // Default
      }
    }
    
    logStep("Found active subscription by customer ID", {
      subscriptionId: latestSubscription.id,
      tier: subscriptionTier,
      endDate: subscriptionEnd
    });
    
    return {
      hasSubscription: true,
      subscriptionEnd,
      subscriptionTier
    };
  } catch (error) {
    logStep("Error checking subscriptions by customer ID", { error: error.message });
    return {
      hasSubscription: false,
      subscriptionEnd: null,
      subscriptionTier: null
    };
  }
}
