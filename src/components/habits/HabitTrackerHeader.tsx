
import React from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const InfoMessage = () => (
  <div className="text-sm space-y-3">
    <p className="text-center font-medium">For the best results with Leena.ai, you only need to do two simple things:</p>
    <ul className="list-disc pl-5 space-y-2">
      <li><span className="font-medium">Weight yourself daily</span> - Every morning before eating or drinking, update your weight in the profile section</li>
      <li><span className="font-medium">Take photos of everything you eat</span> - Including calorie-containing drinks like smoothies, protein shakes, and coffee with milk</li>
    </ul>
    <p className="text-center italic text-xs text-muted-foreground mt-2">
      The calendar shows your daily logging activity — aim to make it completely green!
    </p>
  </div>
);

export const HabitTrackerHeader = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      <h2 className="text-xl font-semibold">Consistency Is Key</h2>
      {isMobile ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <InfoMessage />
          </DialogContent>
        </Dialog>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side="bottom"
              align="center"
              className="max-w-[350px] p-4"
            >
              <InfoMessage />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
