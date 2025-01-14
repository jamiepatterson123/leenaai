import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const tutorialSteps = [
  {
    title: "Welcome to Leena!",
    description: "Let's take a quick tour of your personal nutrition assistant.",
  },
  {
    title: "Track Your Food",
    description: "Use the camera button to snap photos of your meals. Our AI will analyze the nutritional content automatically.",
  },
  {
    title: "Monitor Progress",
    description: "View your daily macros and track your progress with detailed charts and insights.",
  },
  {
    title: "Set Goals",
    description: "Visit your profile to set personalized nutrition targets and track your journey.",
  },
  {
    title: "You're All Set!",
    description: "Start your journey to better nutrition with Leena. Remember, we're here to help you succeed!",
  },
];

export const TutorialGuide = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    const checkTutorialStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("has_seen_tutorial")
        .eq("user_id", user.id)
        .single();

      if (!profile?.has_seen_tutorial) {
        setOpen(true);
      } else {
        setHasSeenTutorial(true);
      }
    };

    checkTutorialStatus();
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ has_seen_tutorial: true })
      .eq("user_id", user.id);

    setOpen(false);
    setHasSeenTutorial(true);
  };

  if (hasSeenTutorial) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {tutorialSteps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {tutorialSteps[currentStep].description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            {Array.from({ length: tutorialSteps.length }).map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep ? "bg-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <Button onClick={handleNext}>
            {currentStep === tutorialSteps.length - 1 ? "Get Started" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};