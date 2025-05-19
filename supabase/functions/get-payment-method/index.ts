
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
  console.log(`[GET-PAYMENT-METHOD] ${step}${detailsStr}`);
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

    // Parse request body to get subscription ID
    if (!req.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Request must be JSON");
    }
    
    const body = await req.json();
    const subscriptionId = body.subscription_id;
    
    if (!subscriptionId) {
      throw new Error("subscription_id is required");
    }
    
    logStep("Received subscription ID", { subscriptionId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get subscription details to find customer
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }
    
    const customerId = subscription.customer as string;
    logStep("Retrieved customer ID from subscription", { customerId });
    
    // Get payment methods for this customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    if (paymentMethods.data.length === 0) {
      throw new Error("No payment methods found for customer");
    }
    
    const defaultPaymentMethodId = paymentMethods.data[0].id;
    logStep("Retrieved default payment method", { paymentMethodId: defaultPaymentMethodId });

    return new Response(JSON.stringify({ 
      payment_method_id: defaultPaymentMethodId,
      customer_id: customerId
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
