
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, logStep } from "./utils.ts";
import { getStripeSubscriptionInfo, findCustomerBySubscriptionId } from "./stripe-service.ts";
import { checkUsageLimits, updateSubscriberRecord } from "./usage-service.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client using the service role key to bypass RLS
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Step 1: Check if there's a URL parameter for subscription_id (from redirect after payment)
    let subscriptionId = null;
    const url = new URL(req.url);
    const subscriptionIdParam = url.searchParams.get("subscription_id");
    if (subscriptionIdParam) {
      subscriptionId = subscriptionIdParam;
      logStep("Found subscription ID in URL params", { subscriptionId });
    }

    // Step 2: Check if user exists in subscribers table by user_id or email
    const { data: subscriberData, error: subscriberError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .single();

    if (subscriberError && subscriberError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is expected for new users
      throw new Error(`Error checking subscriber status: ${subscriberError.message}`);
    }

    // Step 3: If we have a subscription ID from URL, try to find the customer and link them
    let stripeCustomerId = null;
    if (subscriptionId) {
      stripeCustomerId = await findCustomerBySubscriptionId(stripeKey, subscriptionId);
      if (stripeCustomerId) {
        logStep("Found Stripe customer from subscription ID", { 
          subscriptionId,
          customerId: stripeCustomerId 
        });
      }
    }

    // Step 4: Check subscription status with Stripe
    const { 
      hasSubscription, 
      subscriptionEnd, 
      subscriptionTier, 
      customerId 
    } = await getStripeSubscriptionInfo(stripeKey, user.email);
    
    // If no subscription found with user's email but we found a customer ID from the subscription
    // parameter, use that customer ID to look for subscriptions
    const finalCustomerId = customerId || stripeCustomerId;
    let finalHasSubscription = hasSubscription;
    let finalSubscriptionEnd = subscriptionEnd;
    let finalSubscriptionTier = subscriptionTier;

    // Step 5: Check usage limits
    const { 
      usageCount, 
      firstUsageTime, 
      lastUsageTime, 
      dailyLimitReached, 
      hasRemaining, 
      hoursUntilNextUse, 
      isWithinFirst24Hours 
    } = await checkUsageLimits(
      supabaseClient, 
      user.id, 
      finalHasSubscription,
      subscriberData
    );

    // Step 6: Update subscriber record in database
    await updateSubscriberRecord(
      supabaseClient,
      user.id,
      user.email,
      finalCustomerId,
      finalHasSubscription,
      finalSubscriptionTier,
      finalSubscriptionEnd,
      usageCount,
      firstUsageTime,
      lastUsageTime
    );

    return new Response(
      JSON.stringify({
        subscribed: finalHasSubscription,
        usage_count: usageCount,
        subscription_end: finalSubscriptionEnd,
        subscription_tier: finalSubscriptionTier,
        daily_limit_reached: dailyLimitReached,
        has_free_uses_remaining: hasRemaining,
        first_usage_time: firstUsageTime,
        last_usage_time: lastUsageTime,
        hours_until_next_use: hoursUntilNextUse,
        within_first_24_hours: isWithinFirst24Hours
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
