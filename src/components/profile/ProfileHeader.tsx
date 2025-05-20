
import React from "react";
import { Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export const ProfileHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-2 mb-8">
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      <HoverCard>
        <HoverCardTrigger asChild>
          <button className="inline-flex items-center justify-center rounded-full w-6 h-6 hover:bg-gray-100 transition-colors">
            <Info className="h-4 w-4 text-gray-500" />
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium">Why do we need this information?</h4>
            <p className="text-sm text-muted-foreground">
              Your biometric data helps us calculate your personalized nutrition targets. We use scientifically-backed formulas to determine your:
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-4">
              <li>Basal Metabolic Rate (BMR)</li>
              <li>Daily calorie needs</li>
              <li>Optimal macro-nutrient ratios</li>
            </ul>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
