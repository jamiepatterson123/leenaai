
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, logStep } from "./utils.ts";
import { getStripeSubscriptionInfo } from "./stripe-service.ts";
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

    // Check if user exists in subscribers table
    const { data: subscriberData, error: subscriberError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subscriberError && subscriberError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is expected for new users
      throw new Error(`Error checking subscriber status: ${subscriberError.message}`);
    }

    // Check subscription status with Stripe
    const { hasSubscription, subscriptionEnd, subscriptionTier, customerId } = 
      await getStripeSubscriptionInfo(stripeKey, user.email);

    // Check usage limits
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
      hasSubscription,
      subscriberData
    );

    // Update subscriber record in database
    await updateSubscriberRecord(
      supabaseClient,
      user.id,
      user.email,
      customerId,
      hasSubscription,
      subscriptionTier,
      subscriptionEnd,
      usageCount,
      firstUsageTime,
      lastUsageTime
    );

    return new Response(
      JSON.stringify({
        subscribed: hasSubscription,
        usage_count: usageCount,
        subscription_end: subscriptionEnd,
        subscription_tier: subscriptionTier,
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
