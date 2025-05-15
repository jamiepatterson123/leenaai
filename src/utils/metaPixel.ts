
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

// Track free trial usage
export const trackFreeTrialUsage = (usageCount: number) => {
  trackEvent('FreeTrial', { 
    usage_count: usageCount,
    remaining: 10 - usageCount
  });
};

// Track free trial exhausted (when user hits the limit)
export const trackFreeTrialExhausted = () => {
  trackEvent('FreeTrialExhausted');
};

// E-commerce specific events
export const trackPurchase = (value: number, currency: string = 'USD', transactionId?: string) => {
  trackEvent('Purchase', { 
    value, 
    currency,
    transaction_id: transactionId
  });
};

export const trackSubscriptionStart = (value: number, currency: string = 'USD', subscriptionId?: string, plan: string = 'monthly') => {
  trackEvent('Subscribe', { 
    value, 
    currency,
    subscription_id: subscriptionId,
    subscription_plan: plan
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

export const trackOneTimeOfferView = () => {
  trackEvent('ViewContent', {
    content_name: 'yearly_offer',
    content_type: 'product'
  });
};

export const trackOneTimeOfferPurchase = (value: number, currency: string = 'USD') => {
  trackEvent('Purchase', { 
    value, 
    currency,
    content_name: 'yearly_offer'
  });
};

export const trackSubscriptionCancelled = () => {
  trackEvent('SubscriptionCancelled');
};
