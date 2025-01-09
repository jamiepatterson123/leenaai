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
  <p className="text-sm text-center">
    Any day you log your food will be shaded in gold. Try to make the entire calendar gold by the end of the month!
  </p>
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
              className="max-w-[250px] text-center"
            >
              <InfoMessage />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};