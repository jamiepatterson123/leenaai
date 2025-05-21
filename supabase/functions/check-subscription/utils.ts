
// Helper logging function for better debugging
export const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// CORS headers for cross-origin requests
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to calculate if a date is within 24 hours of another date
export const isWithin24Hours = (firstTime: Date | null, currentTime: Date): boolean => {
  if (!firstTime) return false;
  return (currentTime.getTime() - firstTime.getTime() < 24 * 60 * 60 * 1000);
};

// Calculate hours until next available use
export const calculateHoursUntilNextUse = (lastUsageTime: string | null): number => {
  if (!lastUsageTime) return 0;
  
  const lastTime = new Date(lastUsageTime);
  return Math.max(0, 24 - (new Date().getTime() - lastTime.getTime()) / (60 * 60 * 1000));
};
