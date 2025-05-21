
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { logStep } from "./utils.ts";
import { isWithin24Hours, calculateHoursUntilNextUse } from "./utils.ts";

export interface SubscriberData {
  usageCount: number;
  firstUsageTime: string | null;
  lastUsageTime: string | null;
  dailyLimitReached: boolean;
  hasRemaining: boolean;
  hoursUntilNextUse: number;
  isWithinFirst24Hours: boolean;
}

export async function checkUsageLimits(
  supabaseClient: any,
  userId: string,
  hasSubscription: boolean,
  subscriberData: any
): Promise<SubscriberData> {
  // Set default values
  let usageCount = 0;
  let firstUsageTime = null;
  let lastUsageTime = null;
  let dailyLimitReached = false;

  // Constants for limits
  const FREE_INITIAL_USES = 3; // Initial 3 free uses for new users
  const FREE_DAILY_USES = 2;   // 2 free uses per day after initial period

  if (subscriberData) {
    usageCount = subscriberData.usage_count;
    firstUsageTime = subscriberData.first_usage_time;
    lastUsageTime = subscriberData.last_usage_time;

    // Check if this is within first 24 hours of usage
    const now = new Date();
    const firstTime = firstUsageTime ? new Date(firstUsageTime) : null;
    const lastTime = lastUsageTime ? new Date(lastUsageTime) : null;
    
    const isWithinFirst24Hours = isWithin24Hours(firstTime, now);
    
    // Skip usage limits for subscribed users
    if (!hasSubscription) {
      if (isWithinFirst24Hours) {
        // Within first 24 hours: limit is 3 uses
        dailyLimitReached = usageCount >= FREE_INITIAL_USES;
        logStep("Within first 24 hours", { 
          usageCount,
          dailyLimitReached,
          firstUseLimit: FREE_INITIAL_USES
        });
      } else {
        // After first 24 hours: check today's usage or time since last usage
        if (lastTime) {
          const hoursSinceLastUsage = (now.getTime() - lastTime.getTime()) / (60 * 60 * 1000);
          
          if (hoursSinceLastUsage < 24) {
            // Check today's usage count
            const todaysDate = new Date().toISOString().split('T')[0];
            const { data: todaysEntries, error: countError } = await supabaseClient
              .from("food_diary")
              .select("id")
              .eq("user_id", userId)
              .gte("created_at", `${todaysDate}T00:00:00Z`)
              .lt("created_at", `${todaysDate}T23:59:59Z`);
              
            if (!countError) {
              dailyLimitReached = todaysEntries && todaysEntries.length >= FREE_DAILY_USES;
            }
            
            logStep("Checking today's usage", { 
              todaysUsage: todaysEntries?.length || 0,
              dailyLimitReached,
              dailyLimit: FREE_DAILY_USES
            });
          } else {
            // New day, reset daily limit
            dailyLimitReached = false;
            logStep("New day detected, resetting daily limit", { dailyLimitReached });
          }
        }
      }
    } else {
      dailyLimitReached = false; // Subscribed users never reach limits
    }
  }

  const hasRemaining = hasSubscription || !dailyLimitReached;
  
  // Calculate hours until next available use
  const hoursUntilNextUse = !hasSubscription && lastUsageTime ? 
    calculateHoursUntilNextUse(lastUsageTime) : 0;

  return {
    usageCount,
    firstUsageTime,
    lastUsageTime,
    dailyLimitReached,
    hasRemaining,
    hoursUntilNextUse,
    isWithinFirst24Hours: firstUsageTime ? 
      isWithin24Hours(new Date(firstUsageTime), new Date()) : false
  };
}

export async function updateSubscriberRecord(
  supabaseClient: any, 
  userId: string, 
  email: string,
  stripeCustomerId: string | null, 
  hasSubscription: boolean, 
  subscriptionTier: string | null,
  subscriptionEnd: string | null,
  usageCount: number,
  firstUsageTime: string | null,
  lastUsageTime: string | null
) {
  // Current timestamp
  const now = new Date().toISOString();

  // Upsert subscriber record with latest information
  await supabaseClient
    .from("subscribers")
    .upsert({
      user_id: userId,
      email: email,
      stripe_customer_id: stripeCustomerId,
      subscribed: hasSubscription,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      usage_count: usageCount,
      first_usage_time: firstUsageTime || now,
      last_usage_time: lastUsageTime || now,
      updated_at: now,
    }, { onConflict: "user_id" });

  logStep("Database updated", { 
    subscribed: hasSubscription,
    subscription_tier: subscriptionTier,
    usage_count: usageCount 
  });
}
