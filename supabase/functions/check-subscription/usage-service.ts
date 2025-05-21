
import { logStep } from "./utils.ts";

export async function checkUsageLimits(
  supabaseClient: any,
  userId: string,
  hasSubscription: boolean,
  subscriberData: any
) {
  // Default values
  let usageCount = 0;
  let firstUsageTime = null;
  let lastUsageTime = null;
  let dailyLimitReached = false;
  let hasRemaining = true;
  let hoursUntilNextUse = 0;
  let isWithinFirst24Hours = false;
  
  // If user is subscribed, they have unlimited usage
  if (hasSubscription) {
    logStep("User is subscribed, unlimited usage");
    return { 
      usageCount: 0, 
      firstUsageTime, 
      lastUsageTime, 
      dailyLimitReached: false, 
      hasRemaining: true, 
      hoursUntilNextUse: 0,
      isWithinFirst24Hours: false
    };
  }
  
  // If we have existing subscriber data
  if (subscriberData) {
    usageCount = subscriberData.usage_count || 0;
    firstUsageTime = subscriberData.first_usage_time;
    lastUsageTime = subscriberData.last_usage_time;
    
    const now = new Date();
    
    // Check if within first 24 hours of first usage
    if (firstUsageTime) {
      const firstTime = new Date(firstUsageTime);
      isWithinFirst24Hours = (now.getTime() - firstTime.getTime() < 24 * 60 * 60 * 1000);
    }
    
    // Check if daily limit is reached
    if (lastUsageTime && !isWithinFirst24Hours) {
      const lastTime = new Date(lastUsageTime);
      const hoursSinceLastUsage = (now.getTime() - lastTime.getTime()) / (60 * 60 * 1000);
      
      // If less than 24 hours since last usage and already used today's free image
      if (hoursSinceLastUsage < 24) {
        dailyLimitReached = true;
        hoursUntilNextUse = 24 - hoursSinceLastUsage;
        hasRemaining = false;
      }
    }
    
    // Check if user has free uses remaining
    if (isWithinFirst24Hours && usageCount >= 5) {
      hasRemaining = false;
    } else if (!isWithinFirst24Hours && dailyLimitReached) {
      hasRemaining = false;
    } else if (!isWithinFirst24Hours && !dailyLimitReached) {
      hasRemaining = true; // They get 1 free analysis per day
    }
  }
  
  return { 
    usageCount, 
    firstUsageTime, 
    lastUsageTime, 
    dailyLimitReached, 
    hasRemaining, 
    hoursUntilNextUse,
    isWithinFirst24Hours
  };
}

export async function updateSubscriberRecord(
  supabaseClient: any,
  userId: string,
  email: string,
  customerId: string | null,
  hasSubscription: boolean,
  subscriptionTier: string | null,
  subscriptionEnd: string | null,
  usageCount: number,
  firstUsageTime: string | null,
  lastUsageTime: string | null
) {
  try {
    // First try to find by user ID
    const { data: userData, error: userError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!userError && userData) {
      // Update existing record by user ID
      await supabaseClient.from("subscribers").update({
        stripe_customer_id: customerId,
        subscribed: hasSubscription,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        usage_count: usageCount,
        first_usage_time: firstUsageTime,
        last_usage_time: lastUsageTime,
        updated_at: new Date().toISOString()
      }).eq("user_id", userId);

      logStep("Updated subscriber record by user_id", {
        userId,
        subscribed: hasSubscription,
        subscription_tier: subscriptionTier
      });
    } else {
      // Try to find by email
      const { data: emailData, error: emailError } = await supabaseClient
        .from("subscribers")
        .select("*")
        .eq("email", email)
        .single();

      if (!emailError && emailData) {
        // If we find a record by email but it has a different user_id,
        // update it with the new user_id to link accounts
        await supabaseClient.from("subscribers").update({
          user_id: userId, // Link to current user
          stripe_customer_id: customerId,
          subscribed: hasSubscription,
          subscription_tier: subscriptionTier,
          subscription_end: subscriptionEnd,
          usage_count: usageCount,
          first_usage_time: firstUsageTime,
          last_usage_time: lastUsageTime,
          updated_at: new Date().toISOString()
        }).eq("email", email);

        logStep("Updated subscriber record by email and linked to new user_id", {
          email,
          userId,
          subscribed: hasSubscription
        });
      } else {
        // Create new record if neither found
        await supabaseClient.from("subscribers").insert({
          user_id: userId,
          email: email,
          stripe_customer_id: customerId,
          subscribed: hasSubscription,
          subscription_tier: subscriptionTier,
          subscription_end: subscriptionEnd,
          usage_count: usageCount,
          first_usage_time: firstUsageTime,
          last_usage_time: lastUsageTime
        });

        logStep("Created new subscriber record", {
          userId,
          email,
          subscribed: hasSubscription
        });
      }
    }

    // Now check for any subscriptions associated with different emails in Stripe
    if (customerId) {
      const { data: stripeData, error: stripeError } = await supabaseClient
        .from("subscribers")
        .select("*")
        .eq("stripe_customer_id", customerId)
        .neq("email", email)
        .neq("user_id", userId);

      if (!stripeError && stripeData && stripeData.length > 0) {
        // We found accounts with the same Stripe customer ID but different emails/user_ids
        // Update them to link to the current user
        for (const record of stripeData) {
          await supabaseClient.from("subscribers").update({
            user_id: userId, // Link to current user
            subscribed: hasSubscription,
            subscription_tier: subscriptionTier,
            subscription_end: subscriptionEnd,
            updated_at: new Date().toISOString()
          }).eq("id", record.id);

          logStep("Linked subscription from different email to current user", {
            otherEmail: record.email,
            currentEmail: email,
            currentUserId: userId
          });
        }
      }
    }
  } catch (error) {
    logStep("ERROR updating subscriber record", { 
      message: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}
