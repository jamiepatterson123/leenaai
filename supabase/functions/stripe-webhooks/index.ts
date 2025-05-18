
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { trackSubscriptionStartServerSide, trackPurchaseServerSide, logCAPIEvent } from "../../src/utils/metaCAPI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOKS] ${step}${detailsStr}`);
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
        const session = event.data.object;
        logStep("Checkout session completed", { sessionId: session.id });
        
        // Extract customer email from session or metadata
        const customerEmail = session.customer_details?.email || session.metadata?.user_email;
        if (!customerEmail) {
          logStep("WARNING", { message: "No customer email found in checkout session" });
          break;
        }
        
        // Check if this is a subscription or one-time payment
        if (session.mode === 'subscription') {
          // Determine if it's a monthly or yearly subscription
          const subscriptionId = session.subscription;
          if (!subscriptionId) {
            logStep("WARNING", { message: "No subscription ID found in checkout session" });
            break;
          }
          
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price?.id;
          
          // Check if this is a yearly subscription (based on price ID or interval)
          const isYearly = subscription.items.data[0]?.plan?.interval === 'year' || 
                          priceId === 'price_1RP4bMLKGAMmFDpiFaJZpYlb';  // Your yearly price ID
          
          const amount = isYearly ? 99.00 : 10.00;  // Yearly: $99, Monthly: $10
          
          logStep("Tracking subscription with Meta CAPI", { 
            email: customerEmail, 
            amount, 
            isYearly,
            subscriptionId 
          });
          
          // Track subscription event with Meta CAPI
          if (metaPixelId && metaAccessToken) {
            await trackSubscriptionStartServerSide(
              metaPixelId,
              metaAccessToken,
              customerEmail,
              amount,
              'USD',
              subscriptionId,
              isYearly ? 'yearly' : 'monthly'
            );
          }
          
          // For yearly subscriptions that came from the OTO page
          if (isYearly && session.metadata?.monthly_subscription_id) {
            logStep("One-time offer accepted", { 
              previousSubscriptionId: session.metadata.monthly_subscription_id 
            });
            
            // Track OTO purchase specific event
            if (metaPixelId && metaAccessToken) {
              await trackPurchaseServerSide(
                metaPixelId,
                metaAccessToken,
                customerEmail,
                99.00,
                'USD',
                'Yearly Plan (OTO)',
                subscriptionId
              );
            }
          }
        }
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object;
        // Handle subscription renewals here
        logStep("Invoice paid", { invoiceId: invoice.id });
        
        // If this is a subscription invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const customerEmail = invoice.customer_email || 
            (invoice.customer ? await getCustomerEmail(stripe, invoice.customer) : null);
          
          if (customerEmail && metaPixelId && metaAccessToken) {
            // Check if it's a recurring payment (not the first one)
            if (!invoice.billing_reason || invoice.billing_reason === 'subscription_cycle') {
              const amount = invoice.amount_paid / 100; // Convert from cents to dollars
              const isYearly = subscription.items.data[0]?.plan?.interval === 'year';
              
              logStep("Tracking recurring payment", {
                email: customerEmail,
                amount,
                isYearly
              });
              
              await trackPurchaseServerSide(
                metaPixelId,
                metaAccessToken,
                customerEmail,
                amount,
                invoice.currency || 'USD',
                isYearly ? 'Yearly Renewal' : 'Monthly Renewal',
                subscription.id
              );
            }
          }
        }
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

// Helper function to get customer email from Stripe
async function getCustomerEmail(stripe: Stripe, customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if ('email' in customer && customer.email) {
      return customer.email;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving customer:", error);
    return null;
  }
}
