import React from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const WeightHeader = () => {
  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-left">Update your weight</h2>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full">
                <Info className="h-4 w-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="max-w-[300px] touch-none"
            >
              <p>
                For best results, update your weight daily. Weight should be taken
                first thing in the morning after using the bathroom, before
                drinking water and without clothing for greatest accuracy.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};