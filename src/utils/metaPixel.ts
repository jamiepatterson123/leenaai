
/**
 * Utility functions for Meta Pixel tracking
 */

// Standard event tracking
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, params);
    console.log(`Meta Pixel tracked: ${eventName}`, params);
  }
};

// E-commerce specific events
export const trackPurchase = (value: number, currency: string = 'USD', transactionId?: string) => {
  trackEvent('Purchase', { 
    value, 
    currency,
    transaction_id: transactionId
  });
};

export const trackSubscriptionStart = (value: number, currency: string = 'USD', subscriptionId?: string) => {
  trackEvent('Subscribe', { 
    value, 
    currency,
    subscription_id: subscriptionId
  });
};

export const trackAddToCart = (value: number, currency: string = 'USD', contentIds?: string[]) => {
  trackEvent('AddToCart', { 
    value, 
    currency,
    content_ids: contentIds
  });
};

export const trackInitiateCheckout = (value: number, currency: string = 'USD') => {
  trackEvent('InitiateCheckout', { 
    value, 
    currency
  });
};
