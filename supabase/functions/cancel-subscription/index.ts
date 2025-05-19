
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
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Meta CAPI utility function moved directly into this file
async function trackSubscriptionCancelledServerSide(
  pixelId: string,
  accessToken: string,
  email: string,
  subscriptionId?: string
) {
  try {
    // Hash the email using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(email.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashedEmail = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Build the event payload
    const eventData = {
      data: [{
        event_name: "SubscriptionCancelled",
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {
          em: [hashedEmail],
          client_user_agent: '',
        },
        custom_data: {
          subscription_id: subscriptionId
        }
      }]
    };
    
    // Send the event to Meta CAPI
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      }
    );
    
    const result = await response.json();
    console.log('[META-CAPI] SubscriptionCancelled:', { result });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send event to Meta CAPI:', error);
    return false;
  }
}

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

    // Parse request body to get subscription ID to cancel
    if (!req.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Request must include JSON body with subscription_id");
    }
    
    const body = await req.json();
    const subscriptionId = body.subscription_id;
    
    if (!subscriptionId) {
      throw new Error("subscription_id is required");
    }
    
    logStep("Received subscription ID to cancel", { subscriptionId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Cancel the subscription
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
    
    logStep("Subscription canceled", { 
      subscriptionId: canceledSubscription.id,
      status: canceledSubscription.status
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

    return new Response(JSON.stringify({ 
      success: true, 
      subscription_id: canceledSubscription.id,
      status: canceledSubscription.status
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
