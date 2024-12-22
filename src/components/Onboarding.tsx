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
import { ImageIcon, KeyIcon, ScanIcon } from "lucide-react";

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

const Onboarding = ({ isOpen, onClose }: OnboardingProps) => {
  const [step, setStep] = React.useState(1);

  const steps = [
    {
      title: "Welcome to Nutrition Tracker",
      description: "Let's get started with tracking your food intake using AI! The onboarding process usually takes around 5 minutes to complete.",
      icon: <ScanIcon className="w-12 h-12 text-primary" />,
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
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
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
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Onboarding;