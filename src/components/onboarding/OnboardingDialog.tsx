"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export function OnboardingDialog() {
  const [step, setStep] = useState(1);
  const { session } = useSession();

  const stepContent = [
    {
      title: "Welcome to Leena.ai",
      description:
        "Your AI-powered nutrition companion for effortless food tracking and better health.",
    },
    {
      title: "Snap & Track",
      description:
        "Simply take a photo of your meal and our AI will analyze its nutritional content instantly.",
    },
    {
      title: "Smart Goals",
      description: "We'll help you set and track personalized nutrition goals based on your needs.",
    },
    {
      title: "Ready to Start?",
      description: "Let's begin your journey to better nutrition with Leena.ai!",
    },
  ];

  const totalSteps = stepContent.length;

  const handleContinue = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Mark tutorial as seen when completed
      if (session?.user.id) {
        await supabase
          .from('profiles')
          .update({ has_seen_tutorial: true })
          .eq('user_id', session.user.id);
      }
    }
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setStep(1);
      }}
    >
      <DialogContent className="gap-0 p-0">
        <div className="p-2">
          <img
            className="w-full rounded-lg"
            src="/placeholder.svg"
            width={382}
            height={216}
            alt="Leena.ai tutorial"
          />
        </div>
        <div className="space-y-6 px-6 pb-6 pt-3">
          <DialogHeader>
            <DialogTitle>{stepContent[step - 1].title}</DialogTitle>
            <DialogDescription>{stepContent[step - 1].description}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex justify-center space-x-1.5 max-sm:order-1">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full bg-primary",
                    index + 1 === step ? "bg-primary" : "opacity-20",
                  )}
                />
              ))}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Skip
                </Button>
              </DialogClose>
              {step < totalSteps ? (
                <Button className="group" type="button" onClick={handleContinue}>
                  Next
                  <ArrowRight
                    className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Button>
              ) : (
                <DialogClose asChild>
                  <Button type="button" onClick={handleContinue}>Get Started</Button>
                </DialogClose>
              )}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}