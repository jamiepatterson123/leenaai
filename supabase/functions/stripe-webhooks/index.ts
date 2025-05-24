
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get the signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No stripe signature found");

    // Get the raw body
    const body = await req.text();
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook verified", { type: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        logStep("Processing checkout.session.completed", { sessionId: session.id });
        
        if (session.mode === 'subscription') {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customer = await stripe.customers.retrieve(session.customer as string);
          
          logStep("Retrieved subscription and customer", { 
            subscriptionId: subscription.id,
            customerId: customer.id,
            customerEmail: (customer as any).email
          });

          // Update the subscribers table
          const { error: updateError } = await supabaseClient
            .from('subscribers')
            .upsert({
              email: (customer as any).email,
              stripe_customer_id: customer.id,
              stripe_subscription_id: subscription.id,
              subscribed: true,
              subscription_status: subscription.status,
              subscription_tier: 'Premium',
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            }, { 
              onConflict: 'email',
              ignoreDuplicates: false 
            });

          if (updateError) {
            logStep("Error updating subscriber", { error: updateError });
            throw updateError;
          }

          logStep("Successfully updated subscriber status");
        }
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscriptionEvent = event.data.object;
        const customerForSub = await stripe.customers.retrieve(subscriptionEvent.customer as string);
        
        logStep(`Processing ${event.type}`, { 
          subscriptionId: subscriptionEvent.id,
          status: subscriptionEvent.status 
        });

        const isActive = subscriptionEvent.status === 'active';
        
        const { error: subUpdateError } = await supabaseClient
          .from('subscribers')
          .update({
            subscribed: isActive,
            subscription_status: subscriptionEvent.status,
            current_period_end: subscriptionEvent.current_period_end 
              ? new Date(subscriptionEvent.current_period_end * 1000).toISOString() 
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerForSub.id);

        if (subUpdateError) {
          logStep("Error updating subscription status", { error: subUpdateError });
          throw subUpdateError;
        }

        logStep("Successfully updated subscription status");
        break;

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
