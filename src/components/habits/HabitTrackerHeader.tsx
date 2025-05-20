
import React from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const InfoMessage = () => (
  <div className="space-y-3 p-2">
    <h3 className="font-bold text-lg">Daily Consistency Habits</h3>
    <div className="space-y-3">
      <p className="text-center">For the best results with Leena.ai, you only need to do two simple things:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <span className="font-medium">Weigh yourself daily</span> - Every morning before eating or drinking, update your weight in the profile section
        </li>
        <li>
          <span className="font-medium">Take photos of everything you eat</span> - Including calorie-containing drinks like smoothies, protein shakes, and coffee with milk
        </li>
      </ul>
    </div>
    <div className="space-y-2 mt-2">
      <h4 className="font-semibold">Why It Matters:</h4>
      <p className="text-sm text-muted-foreground">
        Consistency in tracking leads to better awareness and results. The calendar shows your daily logging activity — aim to make it completely green!
      </p>
      <p className="text-sm text-muted-foreground">
        Research shows that consistent daily tracking increases the likelihood of reaching your health and fitness goals by up to 3 times compared to sporadic tracking.
      </p>
    </div>
  </div>
);

export const HabitTrackerHeader = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      <h2 className="text-xl font-semibold">Consistency Is Key</h2>
      {isMobile ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="text-center">Consistency Tracking</DialogTitle>
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
              className="w-80"
            >
              <InfoMessage />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
