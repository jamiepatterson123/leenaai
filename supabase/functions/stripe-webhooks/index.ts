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
  console.log(`[STRIPE-WEBHOOKS] ${step}${detailsStr}`);
};

// Meta CAPI utility functions moved directly into this file
async function trackSubscriptionStartServerSide(
  pixelId: string,
  accessToken: string,
  email: string,
  value: number,
  currency: string = 'USD',
  subscriptionId?: string,
  plan: string = 'monthly'
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
        event_name: "Subscribe",
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {
          em: [hashedEmail],
          client_user_agent: '',
        },
        custom_data: { 
          value,
          currency,
          subscription_id: subscriptionId,
          subscription_plan: plan
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
    console.log('[META-CAPI] Subscribe:', { result });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send event to Meta CAPI:', error);
    return false;
  }
}

async function trackPurchaseServerSide(
  pixelId: string,
  accessToken: string,
  email: string,
  value: number,
  currency: string = 'USD',
  contentName: string = 'Leena Premium',
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
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {
          em: [hashedEmail],
          client_user_agent: '',
        },
        custom_data: { 
          value,
          currency,
          content_name: contentName,
          content_type: 'product',
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
    console.log('[META-CAPI] Purchase:', { result });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send event to Meta CAPI:', error);
    return false;
  }
}

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

function logCAPIEvent(eventName: string, eventData: any) {
  console.log(`[META-CAPI] ${eventName}:`, eventData);
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
        const session = event.data.object;
        logStep("Checkout session completed", { sessionId: session.id });
        
        // Extract customer email and user ID from session metadata
        const customerEmail = session.customer_details?.email || session.metadata?.user_email;
        const userId = session.metadata?.user_id;
        
        if (!customerEmail) {
          logStep("WARNING", { message: "No customer email found in checkout session" });
          break;
        }
        
        logStep("Customer details found", { email: customerEmail, userId });
        
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
          const subscriptionTier = isYearly ? 'yearly' : 'monthly';
          const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
          
          logStep("Updating subscriber record in database", { 
            email: customerEmail, 
            userId,
            subscriptionTier,
            subscriptionEnd
          });
          
          // Update the subscriber record in the database
          if (userId) {
            // If we have a user ID, update by user ID
            const { data: updateData, error: updateError } = await supabaseClient
              .from("subscribers")
              .upsert({
                user_id: userId,
                email: customerEmail,
                stripe_customer_id: subscription.customer,
                subscribed: true,
                subscription_tier: subscriptionTier,
                subscription_end: subscriptionEnd,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });
              
            if (updateError) {
              logStep("ERROR updating subscriber by user_id", { error: updateError });
            } else {
              logStep("Successfully updated subscriber by user_id", { userId });
            }
          } else {
            // Otherwise update by email
            const { data: updateData, error: updateError } = await supabaseClient
              .from("subscribers")
              .upsert({
                email: customerEmail,
                stripe_customer_id: subscription.customer,
                subscribed: true,
                subscription_tier: subscriptionTier,
                subscription_end: subscriptionEnd,
                updated_at: new Date().toISOString()
              }, { onConflict: 'email' });
              
            if (updateError) {
              logStep("ERROR updating subscriber by email", { error: updateError });
            } else {
              logStep("Successfully updated subscriber by email", { email: customerEmail });
            }
          }
          
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
          
          // Extend subscription end date in our database
          if (customerEmail) {
            const isYearly = subscription.items.data[0]?.plan?.interval === 'year';
            const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
            
            logStep("Updating subscription end date", {
              email: customerEmail,
              subscriptionEnd,
              isRenewal: true
            });
            
            // Update the subscription end date
            const { error: updateError } = await supabaseClient
              .from("subscribers")
              .update({
                subscribed: true,
                subscription_end: subscriptionEnd,
                updated_at: new Date().toISOString()
              })
              .eq("email", customerEmail);
              
            if (updateError) {
              logStep("ERROR updating subscription end date", { error: updateError });
            }
            
            if (metaPixelId && metaAccessToken) {
              // Check if it's a recurring payment (not the first one)
              if (!invoice.billing_reason || invoice.billing_reason === 'subscription_cycle') {
                const amount = invoice.amount_paid / 100; // Convert from cents to dollars
                
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
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        if (!customerId) {
          logStep("WARNING", { message: "No customer ID found in deleted subscription" });
          break;
        }
        
        // Get customer email
        const customerEmail = await getCustomerEmail(stripe, customerId.toString());
        
        if (customerEmail) {
          logStep("Subscription cancelled, updating database", { email: customerEmail });
          
          // Update the subscriber record in the database
          const { error: updateError } = await supabaseClient
            .from("subscribers")
            .update({
              subscribed: false,
              subscription_end: new Date().toISOString(), // End subscription immediately
              updated_at: new Date().toISOString()
            })
            .eq("email", customerEmail);
            
          if (updateError) {
            logStep("ERROR updating cancelled subscription", { error: updateError });
          }
          
          // Track subscription cancelled event
          if (metaPixelId && metaAccessToken) {
            await trackSubscriptionCancelledServerSide(
              metaPixelId,
              metaAccessToken,
              customerEmail,
              subscription.id
            );
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
