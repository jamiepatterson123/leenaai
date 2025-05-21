
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { 
  handleCheckoutSessionCompleted, 
  handleInvoicePaid, 
  handleSubscriptionDeleted,
  logStep,
} from "./event-handlers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    
    // Create a Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Get Meta Pixel and CAPI details
    const metaPixelId = Deno.env.get("META_PIXEL_ID");
    const metaAccessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN");
    
    if (!metaPixelId || !metaAccessToken) {
      logStep("WARNING", { message: "Meta Pixel ID or Access Token not set" });
    }
    
    // Parse the request body
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found in headers");
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get the webhook signing secret
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("ERROR", { message: `Webhook signature verification failed: ${err.message}` });
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    logStep("Received Stripe webhook event", { type: event.type });
    
    // Process different webhook events
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(
          event.data.object,
          stripe,
          supabaseClient,
          metaPixelId,
          metaAccessToken
        );
        break;
      }
      
      case 'invoice.paid': {
        await handleInvoicePaid(
          event.data.object,
          stripe,
          supabaseClient,
          metaPixelId,
          metaAccessToken
        );
        break;
      }
      
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(
          event.data.object,
          stripe,
          supabaseClient,
          metaPixelId,
          metaAccessToken
        );
        break;
      }
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }
    
    // Return a 200 response to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), {
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
