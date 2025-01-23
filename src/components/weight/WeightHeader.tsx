import React from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";

export const WeightHeader = () => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h2 className="text-xl font-semibold">Update Your Weight</h2>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Weigh yourself every morning after using the bathroom, before drinking water or eating and with minimal clothing. Update your weight daily for best results.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};