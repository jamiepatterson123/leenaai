
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight, X, Timer, Loader2, Star, ShieldCheck } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { trackOneTimeOfferView } from "@/utils/metaPixel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GlowEffect } from "@/components/ui/glow-effect";

const OneTimeOffer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    checkSubscription
  } = useSubscription();
  const [isPreview, setIsPreview] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60); // 5 minutes in seconds
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [monthlySubscriptionId, setMonthlySubscriptionId] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  
  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setIsLoggedIn(!!session);

      // If logged in, check for any active subscriptions
      if (session) {
        checkSubscription(); // Update subscription status
        
        // Get subscription data from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const subscriptionId = urlParams.get('subscription_id');
        if (subscriptionId) {
          setMonthlySubscriptionId(subscriptionId);
        }
      }
    });

    // Track OTO page view
    trackOneTimeOfferView();

    // Check for preview mode first
    const url = new URLSearchParams(location.search);
    const previewMode = url.get("preview") === "true";
    setIsPreview(previewMode);

    // Only redirect if not in preview mode AND not from successful checkout
    const successParam = url.get("subscription_success");
    if (successParam !== "true" && !previewMode) {
      console.log("Not from successful checkout or preview mode, this is likely a direct navigation");
      // Don't redirect automatically - let the user see the OTO page
    }
  }, []);
  
  // Effect for countdown timer
  useEffect(() => {
    // Set up the countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Clean up the timer
    return () => clearInterval(timer);
  }, []);

  // Get customer's payment method for one-click checkout
  const getCustomerPaymentMethod = async (subscriptionId: string) => {
    if (!isLoggedIn) return;
    // Since we've removed the payment system, this is just a mock function
    console.log("Mock getCustomerPaymentMethod called");
  };

  // Format the time remaining as MM:SS
  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Handle upgrade to yearly plan
  const handleUpgradeToYearly = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in to upgrade your subscription");
      navigate("/auth");
      return;
    }
    setIsProcessing(true);
    try {
      // Mock subscription upgrade
      console.log("Mock subscription upgrade called");
      toast.success("This is a demo implementation. Real subscription features have been removed.");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error in mock upgrade:", error);
      toast.error("This is a demo implementation. Real subscription features have been removed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Direct link to profile page
  const handleSkip = () => {
    // If logged in, redirect to profile page, otherwise to homepage
    if (isLoggedIn) {
      navigate("/profile");
    } else {
      navigate("/");
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-green-100 text-green-800 rounded-full mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Leena.ai</h1>
          <p className="text-xl text-gray-600">Your monthly membership is now active</p>
        </div>
        
        <Card className="border-2 border-gradient-to-r from-[#D946EF] to-[#8B5CF6] shadow-lg">
          <CardHeader className="text-center bg-white border-b relative overflow-hidden">
            <div className="flex justify-center mb-2">
              <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                <Star className="h-4 w-4" />
                <span>Exclusive Offer</span>
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl">Get Two Months Free with Annual Billing - Today Only</CardTitle>
            <CardDescription className="text-base">This is a one-time offer only available on this page. Get two months free when you upgrade to an annual membership today.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 justify-center">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-4">Monthly Plan (Current)</h3>
                <div className="text-3xl font-bold mb-2">$120<span className="text-base font-normal text-muted-foreground">/year</span></div>
                <p className="text-muted-foreground mb-6">That's $10 per month</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" /> 
                    Unlimited nutrition tracking
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" /> 
                    AI food photo analysis
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" /> 
                    Monthly billing
                  </li>
                </ul>
              </div>
              
              <div className="w-full md:w-auto flex justify-center">
                <div className="h-full flex items-center">
                  <ArrowRight className="h-8 w-8 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 relative">
                <div className="absolute -top-4 right-0 left-0 mx-auto w-max">
                  <div className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] text-white text-xs font-bold px-3 py-1 rounded-full">
                    TWO MONTHS FREE
                  </div>
                </div>
                <div className="border-2 border-[#D946EF] border-r-[#8B5CF6] border-b-[#8B5CF6] rounded-lg p-6 bg-white">
                  <h3 className="font-semibold text-lg mb-4">Annual Plan (Best Value)</h3>
                  <div className="text-3xl font-bold mb-2">$99<span className="text-base font-normal text-muted-foreground">/year</span></div>
                  <p className="text-muted-foreground mb-6">Or just $0.27 per day equivalent</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" /> 
                      <span>Everything in monthly plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" /> 
                      <span className="font-medium">2 months free </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" /> 
                      <span>Hassle-free annual billing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" /> 
                      <span>One year nutrition tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" /> 
                      <span>Access all future AI features</span>
                    </li>
                  </ul>
                  
                  {/* Money-back guarantee section */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> 
                      <div>
                        <span className="font-medium text-sm">7-Day Money-Back Guarantee</span>
                        <p className="text-xs text-muted-foreground mt-1">Not satisfied? Get a full refund within 7 days, no questions asked.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between pt-6">
            <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto order-2 sm:order-1">
              <X className="mr-2 h-4 w-4" />
              No thanks, continue
            </Button>
            <Button size="lg" className="w-full sm:w-auto order-1 sm:order-2 h-full bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] hover:opacity-90 sm:h-[64px] h-[128px]" onClick={handleUpgradeToYearly} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">
                    {paymentMethodId ? "1-Click Upgrade" : "Get 2 months free today"}
                  </span>
                  <span className="text-xs font-medium">
                    {isProcessing ? "Please wait" : "Only $8.25/month billed annually"}
                  </span>
                </div>}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Your subscription can be canceled anytime through your account settings.</p>
        </div>
      </div>
    </div>
  );
};

export default OneTimeOffer;
