
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { trackSubscriptionStartServerSide, trackSubscriptionCancelledServerSide } from "../../src/utils/metaCAPI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPGRADE-TO-YEARLY] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Get Meta CAPI details
    const metaPixelId = Deno.env.get("META_PIXEL_ID");
    const metaAccessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN");

    // Create Supabase client using the anon key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body to get monthly subscription ID
    if (!req.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Request must be JSON");
    }
    
    const body = await req.json();
    const monthlySubscriptionId = body.monthly_subscription_id;
    
    if (!monthlySubscriptionId) {
      throw new Error("monthly_subscription_id is required");
    }
    
    logStep("Received monthly subscription ID", { monthlySubscriptionId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Step 1: Cancel the monthly subscription (at period end)
    const canceledSubscription = await stripe.subscriptions.update(monthlySubscriptionId, {
      cancel_at_period_end: true,
    });
    
    logStep("Monthly subscription set to cancel at period end", { 
      subscriptionId: canceledSubscription.id,
      cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end
    });

    // Track subscription cancellation with Meta CAPI if credentials are available
    if (metaPixelId && metaAccessToken) {
      try {
        await trackSubscriptionCancelledServerSide(
          metaPixelId,
          metaAccessToken,
          user.email,
          canceledSubscription.id
        );
        logStep("Sent subscription cancellation event to Meta CAPI");
      } catch (capiError) {
        logStep("Failed to send CAPI event", { error: capiError.message });
        // Non-blocking, we continue even if CAPI fails
      }
    }
    
    // Step 2: Get customer data
    const customerId = canceledSubscription.customer as string;
    logStep("Retrieved customer ID", { customerId });
    
    // Step 3: Get payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    if (paymentMethods.data.length === 0) {
      throw new Error("No payment methods found for customer");
    }
    
    const defaultPaymentMethodId = paymentMethods.data[0].id;
    logStep("Retrieved payment method", { paymentMethodId: defaultPaymentMethodId });
    
    // Step 4: Create new yearly subscription
    const yearlySubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: 'price_1RP4bMLKGAMmFDpiFaJZpYlb', // Yearly subscription price ID
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      default_payment_method: defaultPaymentMethodId,
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_email: user.email,
        user_id: user.id,
        previous_subscription_id: monthlySubscriptionId
      },
    });
    
    logStep("Created yearly subscription", { 
      newSubscriptionId: yearlySubscription.id,
      status: yearlySubscription.status
    });

    // Track yearly subscription start with Meta CAPI if credentials are available
    if (metaPixelId && metaAccessToken) {
      try {
        await trackSubscriptionStartServerSide(
          metaPixelId,
          metaAccessToken,
          user.email,
          99.00, // $99 yearly subscription
          'USD',
          yearlySubscription.id,
          'yearly'
        );
        logStep("Sent yearly subscription event to Meta CAPI");
      } catch (capiError) {
        logStep("Failed to send CAPI event", { error: capiError.message });
        // Non-blocking, we continue even if CAPI fails
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      monthly_subscription_id: canceledSubscription.id,
      monthly_cancellation_status: canceledSubscription.cancel_at_period_end,
      yearly_subscription_id: yearlySubscription.id,
      yearly_subscription_status: yearlySubscription.status
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
