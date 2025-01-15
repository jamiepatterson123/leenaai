import React from "react";
import { Scale } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const WeightHeader = () => {
  return (
    <div className="text-center space-y-4">
      <Scale className="h-10 w-10 mx-auto text-primary" strokeWidth={1} />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          Update Your Weight Daily For Best Results
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="ml-2">
                <span className="text-gray-400 hover:text-gray-500">ⓘ</span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Regular weight tracking helps monitor your progress and adjust your goals accordingly.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h2>
      </div>
    </div>
  );
};