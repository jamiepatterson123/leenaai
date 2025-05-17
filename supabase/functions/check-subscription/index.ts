
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

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

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
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

    // Set default values
    let hasSubscription = false;
    let usageCount = 0;
    let subscriptionEnd = null;
    let stripeCustomerId = null;
    let firstUsageTime = null;
    let lastUsageTime = null;
    let dailyLimitReached = false;

    // Check if user is in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
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
        hasSubscription = true;
        subscriptionEnd = new Date(subscriptions.data[0].current_period_end * 1000).toISOString();
        logStep("Active subscription found", { 
          subscriptionId: subscriptions.data[0].id, 
          endDate: subscriptionEnd 
        });
      } else {
        logStep("No active subscription found");
      }
    } else {
      logStep("No Stripe customer found");
    }

    // Use existing data if available
    if (subscriberData) {
      usageCount = subscriberData.usage_count;
      firstUsageTime = subscriberData.first_usage_time;
      lastUsageTime = subscriberData.last_usage_time;

      // Check if this is within first 24 hours of usage
      const now = new Date();
      const firstTime = firstUsageTime ? new Date(firstUsageTime) : null;
      const lastTime = lastUsageTime ? new Date(lastUsageTime) : null;
      
      const isWithinFirst24Hours = firstTime && 
        (now.getTime() - firstTime.getTime() < 24 * 60 * 60 * 1000);
      
      if (!hasSubscription) {
        if (isWithinFirst24Hours) {
          // Within first 24 hours: limit is 5 uses
          dailyLimitReached = usageCount >= 5;
        } else {
          // After first 24 hours: check if it's been 24 hours since last usage
          if (lastTime) {
            const hoursSinceLastUsage = (now.getTime() - lastTime.getTime()) / (60 * 60 * 1000);
            dailyLimitReached = hoursSinceLastUsage < 24;
          }
        }
      }
    }

    // Current timestamp
    const now = new Date().toISOString();

    // Upsert subscriber record
    await supabaseClient
      .from("subscribers")
      .upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: stripeCustomerId,
        subscribed: hasSubscription,
        subscription_tier: hasSubscription ? "premium" : "free",
        subscription_end: subscriptionEnd,
        usage_count: usageCount,
        first_usage_time: firstUsageTime || now,
        last_usage_time: lastUsageTime || now,
        updated_at: now,
      }, { onConflict: "user_id" });

    logStep("Database updated", { 
      subscribed: hasSubscription,
      usage_count: usageCount 
    });

    const hasRemaining = hasSubscription || !dailyLimitReached;

    // Calculate hours until next available use
    let hoursUntilNextUse = 0;
    if (!hasSubscription && lastUsageTime) {
      const lastTime = new Date(lastUsageTime);
      hoursUntilNextUse = Math.max(0, 24 - (new Date().getTime() - lastTime.getTime()) / (60 * 60 * 1000));
    }

    return new Response(
      JSON.stringify({
        subscribed: hasSubscription,
        usage_count: usageCount,
        subscription_end: subscriptionEnd,
        daily_limit_reached: dailyLimitReached,
        has_free_uses_remaining: hasRemaining,
        first_usage_time: firstUsageTime,
        last_usage_time: lastUsageTime,
        hours_until_next_use: hoursUntilNextUse
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
