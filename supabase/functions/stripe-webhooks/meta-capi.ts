
// Utility functions for Meta CAPI (Conversions API)

/**
 * Track subscription start event via Meta Conversions API
 */
export async function trackSubscriptionStartServerSide(
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

/**
 * Track purchase event via Meta Conversions API
 */
export async function trackPurchaseServerSide(
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

/**
 * Track subscription cancelled event via Meta Conversions API
 */
export async function trackSubscriptionCancelledServerSide(
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
