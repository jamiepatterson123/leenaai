
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { trackPurchaseServerSide, trackSubscriptionCancelledServerSide, trackSubscriptionStartServerSide } from "./meta-capi.ts";

// Helper logging function
export const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOKS] ${step}${detailsStr}`);
};

// Helper function to get customer email from Stripe
export async function getCustomerEmail(stripe: Stripe, customerId: string): Promise<string | null> {
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

// Helper function to handle linking accounts with different emails
async function linkAccountByStripeCustomer(
  supabaseClient: any, 
  stripeCustomerId: string, 
  email: string,
  userId?: string
) {
  if (!stripeCustomerId) return;
  
  logStep("Checking for subscriber accounts to link by Stripe customer ID", { 
    stripeCustomerId, email, userId 
  });
  
  // First, find any subscribers with this Stripe customer ID
  const { data: subscriberData, error: subscriberError } = await supabaseClient
    .from("subscribers")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId);
    
  if (subscriberError || !subscriberData || subscriberData.length === 0) {
    // No existing subscribers with this Stripe customer ID
    logStep("No existing subscribers found with this Stripe customer ID");
    return;
  }
  
  // Look for exact matches by email
  const exactMatch = subscriberData.find(sub => sub.email === email);
  if (exactMatch) {
    logStep("Found exact subscriber match by email", { id: exactMatch.id });
    
    // If userId is provided and doesn't match, update the record
    if (userId && exactMatch.user_id !== userId) {
      await supabaseClient
        .from("subscribers")
        .update({ user_id: userId })
        .eq("id", exactMatch.id);
      
      logStep("Updated user_id for subscriber", { 
        id: exactMatch.id, 
        oldUserId: exactMatch.user_id,
        newUserId: userId 
      });
    }
    
    return;
  }
  
  // If no exact match by email, we'll update the first record we found
  // to link it with this email/userId
  const firstRecord = subscriberData[0];
  
  const updateData: any = {
    email: email,
    updated_at: new Date().toISOString()
  };
  
  if (userId) {
    updateData.user_id = userId;
  }
  
  await supabaseClient
    .from("subscribers")
    .update(updateData)
    .eq("id", firstRecord.id);
    
  logStep("Linked subscriber record to new email/user", { 
    id: firstRecord.id, 
    oldEmail: firstRecord.email,
    newEmail: email,
    oldUserId: firstRecord.user_id,
    newUserId: userId || 'unchanged'
  });
}

/**
 * Handle checkout.session.completed event
 */
export async function handleCheckoutSessionCompleted(
  session: any,
  stripe: Stripe,
  supabaseClient: any,
  metaPixelId?: string,
  metaAccessToken?: string
) {
  logStep("Checkout session completed", { sessionId: session.id });
  
  // Extract customer email and user ID from session metadata
  const customerEmail = session.customer_details?.email || session.metadata?.user_email;
  const userId = session.metadata?.user_id;
  
  if (!customerEmail) {
    logStep("WARNING", { message: "No customer email found in checkout session" });
    return;
  }
  
  logStep("Customer details found", { email: customerEmail, userId });
  
  // Check if this is a subscription or one-time payment
  if (session.mode === 'subscription') {
    // Determine if it's a monthly or yearly subscription
    const subscriptionId = session.subscription;
    if (!subscriptionId) {
      logStep("WARNING", { message: "No subscription ID found in checkout session" });
      return;
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
    
    // First, check if there's an existing subscriber with this customer ID
    await linkAccountByStripeCustomer(
      supabaseClient,
      subscription.customer.toString(),
      customerEmail,
      userId
    );
    
    // Update the subscriber record in the database
    if (userId) {
      // If we have a user ID, update by user ID
      const { data: updateData, error: updateError } = await supabaseClient
        .from("subscribers")
        .upsert({
          user_id: userId,
          email: customerEmail,
          stripe_customer_id: subscription.customer.toString(),
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
          stripe_customer_id: subscription.customer.toString(),
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
}

/**
 * Handle invoice.paid event
 */
export async function handleInvoicePaid(
  invoice: any,
  stripe: Stripe,
  supabaseClient: any,
  metaPixelId?: string,
  metaAccessToken?: string
) {
  logStep("Invoice paid", { invoiceId: invoice.id });
  
  // If this is a subscription invoice
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const customerEmail = invoice.customer_email || 
      (invoice.customer ? await getCustomerEmail(stripe, invoice.customer) : null);
    
    // If we have the customer email, check if we need to link accounts
    if (customerEmail && invoice.customer) {
      await linkAccountByStripeCustomer(
        supabaseClient,
        invoice.customer.toString(),
        customerEmail
      );
    }
    
    // Extend subscription end date in our database
    if (customerEmail) {
      const isYearly = subscription.items.data[0]?.plan?.interval === 'year';
      const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      logStep("Updating subscription end date", {
        email: customerEmail,
        subscriptionEnd,
        isRenewal: true
      });
      
      // First try to find by customer ID
      const { data: customerData } = await supabaseClient
        .from("subscribers")
        .select("id")
        .eq("stripe_customer_id", invoice.customer.toString())
        .limit(1);
        
      if (customerData && customerData.length > 0) {
        await supabaseClient
          .from("subscribers")
          .update({
            subscribed: true,
            subscription_end: subscriptionEnd,
            updated_at: new Date().toISOString()
          })
          .eq("id", customerData[0].id);
      } else {
        // Update by email as fallback
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
}

/**
 * Handle customer.subscription.deleted event
 */
export async function handleSubscriptionDeleted(
  subscription: any,
  stripe: Stripe,
  supabaseClient: any,
  metaPixelId?: string,
  metaAccessToken?: string
) {
  const customerId = subscription.customer;
  
  if (!customerId) {
    logStep("WARNING", { message: "No customer ID found in deleted subscription" });
    return;
  }
  
  // Get customer email
  const customerEmail = await getCustomerEmail(stripe, customerId.toString());
  
  if (customerEmail) {
    logStep("Subscription cancelled, updating database", { email: customerEmail });
    
    // First try to find by customer ID
    const { data: customerData } = await supabaseClient
      .from("subscribers")
      .select("id")
      .eq("stripe_customer_id", customerId.toString())
      .limit(1);
      
    if (customerData && customerData.length > 0) {
      await supabaseClient
        .from("subscribers")
        .update({
          subscribed: false,
          subscription_end: new Date().toISOString(), // End subscription immediately
          updated_at: new Date().toISOString()
        })
        .eq("id", customerData[0].id);
    } else {
      // Update by email as fallback
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
}
