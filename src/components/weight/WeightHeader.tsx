import React from "react";
import { HelpPopup } from "@/components/HelpPopup";

export const WeightHeader = () => {
  return (
    <div className="w-full flex items-center justify-between">
      <h2 className="text-lg font-semibold text-left">Update your weight</h2>
      <HelpPopup
        content={
          <div className="space-y-2">
            <p>Track your weight to monitor your progress over time.</p>
            <p>You can enter your weight in either kg or lbs.</p>
            <p>Your weight history will be displayed in the chart below.</p>
          </div>
        }
      />
    </div>
  );
};