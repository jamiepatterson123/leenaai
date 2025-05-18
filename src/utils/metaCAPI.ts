
/**
 * Utility for Meta Conversions API (CAPI) server-side tracking
 */

// Create a SHA-256 hash of the input string (e.g. email)
export const hashData = (input: string): string => {
  // This is a simplified implementation. In an environment with crypto available,
  // you would use crypto.createHash('sha256').update(input).digest('hex')
  // For Deno edge functions, we'll use the SubtleCrypto API
  if (!input) return '';
  
  // For emails, normalize by trimming and lowercasing before hashing
  const normalized = input.trim().toLowerCase();
  return normalized;
};

// Send an event to Meta Conversions API
export const sendEvent = async (
  pixelId: string, 
  accessToken: string,
  eventName: string, 
  userData: {
    email?: string;
    externalId?: string;
    [key: string]: any;
  }, 
  customData: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_type?: string;
    [key: string]: any;
  }
): Promise<boolean> => {
  try {
    // Only hash the email if it's provided
    let hashedEmail;
    if (userData.email) {
      // Convert the string to a buffer of bytes
      const encoder = new TextEncoder();
      const data = encoder.encode(userData.email.trim().toLowerCase());
      
      // Hash the email using SHA-256
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      // Convert the hash to a hexadecimal string
      hashedEmail = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
    
    // Build the event payload
    const eventData = {
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {
          ...(hashedEmail && { em: [hashedEmail] }),
          ...(userData.externalId && { external_id: [userData.externalId] }),
          client_user_agent: userData.userAgent || '',
        },
        custom_data: {
          ...customData
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
    console.log('Meta CAPI response:', result);
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send event to Meta CAPI:', error);
    return false;
  }
};

// Helper function to log CAPI events
export const logCAPIEvent = (eventName: string, eventData: any) => {
  console.log(`[META-CAPI] ${eventName}:`, eventData);
};

/**
 * Specific event types for the app
 */

// Track purchase server-side
export const trackPurchaseServerSide = async (
  pixelId: string,
  accessToken: string,
  email: string,
  value: number,
  currency: string = 'USD',
  contentName: string = 'Leena Premium',
  subscriptionId?: string
) => {
  logCAPIEvent('Purchase', { email, value, currency, contentName });
  
  return sendEvent(
    pixelId,
    accessToken,
    'Purchase',
    { email },
    { 
      value,
      currency,
      content_name: contentName,
      content_type: 'product',
      ...(subscriptionId && { subscription_id: subscriptionId })
    }
  );
};

// Track subscription started server-side
export const trackSubscriptionStartServerSide = async (
  pixelId: string,
  accessToken: string,
  email: string,
  value: number,
  currency: string = 'USD',
  subscriptionId?: string,
  plan: string = 'monthly'
) => {
  logCAPIEvent('Subscribe', { email, value, currency, subscriptionId, plan });
  
  return sendEvent(
    pixelId,
    accessToken,
    'Subscribe',
    { email },
    { 
      value,
      currency,
      subscription_id: subscriptionId,
      subscription_plan: plan
    }
  );
};

// Track recurring payment server-side
export const trackRecurringPaymentServerSide = async (
  pixelId: string,
  accessToken: string,
  email: string,
  value: number,
  currency: string = 'USD',
  subscriptionId?: string
) => {
  logCAPIEvent('RecurringPayment', { email, value, currency, subscriptionId });
  
  return sendEvent(
    pixelId,
    accessToken,
    'RecurringPayment',
    { email },
    { 
      value,
      currency,
      subscription_id: subscriptionId
    }
  );
};

// Track subscription cancelled server-side
export const trackSubscriptionCancelledServerSide = async (
  pixelId: string,
  accessToken: string,
  email: string,
  subscriptionId?: string
) => {
  logCAPIEvent('SubscriptionCancelled', { email, subscriptionId });
  
  return sendEvent(
    pixelId,
    accessToken,
    'SubscriptionCancelled',
    { email },
    { subscription_id: subscriptionId }
  );
};
