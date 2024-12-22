import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ImageIcon, KeyIcon, ScanIcon, UserIcon } from "lucide-react";
import OnboardingQuestionnaire from "./OnboardingQuestionnaire";

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

const Onboarding = ({ isOpen, onClose }: OnboardingProps) => {
  const [step, setStep] = React.useState(1);
  const [showQuestionnaire, setShowQuestionnaire] = React.useState(false);

  const steps = [
    {
      title: "Welcome to Nutrition Tracker",
      description: "Let's get started with tracking your food intake using AI! The onboarding process usually takes around 5 minutes to complete.",
      icon: <ScanIcon className="w-12 h-12 text-primary" />,
    },
    {
      title: "Tell Us About Yourself",
      description: "To provide you with accurate nutritional recommendations, we need to know a bit about you.",
      icon: <UserIcon className="w-12 h-12 text-primary" />,
    },
    {
      title: "Set Your API Key",
      description: "First, you'll need to add your OpenAI API key to analyze food images.",
      icon: <KeyIcon className="w-12 h-12 text-primary" />,
    },
    {
      title: "Upload Food Images",
      description: "Simply upload photos of your meals, and we'll analyze their nutritional content.",
      icon: <ImageIcon className="w-12 h-12 text-primary" />,
    },
  ];

  const currentStep = steps[step - 1];

  const handleNext = () => {
    if (step === 2) {
      setShowQuestionnaire(true);
    } else if (step < steps.length) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handleQuestionnaireComplete = (data: any) => {
    console.log("Questionnaire data:", data);
    setShowQuestionnaire(false);
    setStep(step + 1);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          {showQuestionnaire ? (
            <div className="p-6">
              <DrawerTitle className="text-xl mb-6">Tell Us About Yourself</DrawerTitle>
              <OnboardingQuestionnaire
                onComplete={handleQuestionnaireComplete}
                currentStep={0}
                onNextStep={() => {}}
                onPreviousStep={() => setShowQuestionnaire(false)}
              />
            </div>
          ) : (
            <>
              <DrawerHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {currentStep.icon}
                </div>
                <DrawerTitle className="text-xl">{currentStep.title}</DrawerTitle>
                <DrawerDescription className="text-base">
                  {currentStep.description}
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex justify-center gap-2 p-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-16 rounded-full ${
                      index + 1 === step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <DrawerFooter>
                <Button onClick={handleNext} className="w-full">
                  {step === steps.length ? "Get Started" : "Next"}
                </Button>
              </DrawerFooter>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Onboarding;