import React, { useState } from "react";
import { Scale, Info, Heart } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

export const WeightHeader = () => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? (
        <Heart className="h-10 w-10 text-primary mb-3" strokeWidth={1.5} fill="none" />
      ) : (
        <Scale className="mx-auto h-10 w-10 text-primary mb-3" strokeWidth={1} />
      )}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold text-center">
          Update Your Weight Daily For Best Results
          <TooltipProvider>
            <Tooltip open={isMobile ? tooltipOpen : undefined} onOpenChange={setTooltipOpen}>
              <TooltipTrigger onClick={() => isMobile && setTooltipOpen(!tooltipOpen)}>
                <Info className="h-4 w-4 text-gray-500 inline-block ml-1 mb-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Weigh yourself every morning after using the bathroom, before drinking water and before eating for most accurate readings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>
      </div>
    </>
  );
};