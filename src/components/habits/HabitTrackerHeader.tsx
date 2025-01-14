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
    Any day you log your food will be shaded in green. Try to make the entire calendar green by the end of the month!
  </p>
);

export const HabitTrackerHeader = () => {
  const isMobile = useIsMobile();

  return (
    <div className="mb-4"></div>
  );
};