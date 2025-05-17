import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, ArrowRight, X, Timer } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { trackOneTimeOfferView } from "@/utils/metaPixel";
import { supabase } from "@/integrations/supabase/client";
const OneTimeOffer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    redirectToYearlyCheckout
  } = useSubscription();
  const [isPreview, setIsPreview] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60); // 5 minutes in seconds
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setIsLoggedIn(!!session);
    });

    // Track OTO page view
    trackOneTimeOfferView();

    // Check for preview mode first
    const url = new URL(window.location.href);
    const previewMode = url.searchParams.get("preview") === "true";
    setIsPreview(previewMode);

    // Only redirect if not in preview mode and not from successful checkout
    const successParam = url.searchParams.get("subscription_success");
    if (successParam !== "true" && !previewMode) {
      console.log("Preview mode is disabled or not from successful checkout");
    }
  }, []);
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

  // Format the time remaining as MM:SS
  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Direct link to Stripe payment
  const handleSkip = () => {
    // If logged in, redirect to profile page, otherwise to homepage
    if (isLoggedIn) {
      navigate("/profile");
    } else {
      navigate("/");
    }
  };
  return <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-green-100 text-green-800 rounded-full mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎉 Welcome to Leena.ai Premium!</h1>
          <p className="text-xl text-gray-600">Your monthly subscription is now active</p>
          {isPreview && <div className="mt-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-md inline-block">
              Preview Mode
            </div>}
        </div>
        
        {/* FOMO Timer */}
        <div className="mb-6 text-center">
          
        </div>
        
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader className="text-center bg-primary/5 border-b">
            <div className="flex justify-center mb-2">
              <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                <Star className="h-4 w-4" />
                <span>Exclusive Offer</span>
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl">Get Two Months Free with Annual Billing</CardTitle>
            <CardDescription className="text-base">This Is A One-Time Offer – Only Available On This Page. Get two months free. This page disappears after you leave and you won't see it anywhere else.</CardDescription>
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
                  <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    TWO MONTHS FREE
                  </div>
                </div>
                <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
                  <h3 className="font-semibold text-lg mb-4">Annual Plan (Best Value)</h3>
                  <div className="text-3xl font-bold mb-2">$99<span className="text-base font-normal text-muted-foreground">/year</span></div>
                  <p className="text-muted-foreground mb-6">Or just $8.25 per month equivalent</p>
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
                      <span>Priority customer support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between pt-6">
            <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto order-2 sm:order-1">
              <X className="mr-2 h-4 w-4" />
              No thanks, continue
            </Button>
            <a href="https://buy.stripe.com/7sIbM0aekffE42AeUU" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto order-1 sm:order-2">
              <Button size="lg" className="w-full h-full bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] hover:opacity-90">
                <Star className="mr-2 h-4 w-4" />
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">Get 2 months free today</span>
                  <span className="text-xs font-medium">Only $8.25/month billed annually</span>
                </div>
              </Button>
            </a>
          </CardFooter>
        </Card>
        
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Your subscription can be canceled anytime through your account settings.</p>
        </div>
      </div>
    </div>;
};
export default OneTimeOffer;