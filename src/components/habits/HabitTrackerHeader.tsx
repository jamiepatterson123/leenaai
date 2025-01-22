import React from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

const InfoMessage = () => (
  <p className="text-sm text-center">
    Any day you log your food will be shaded in green. Try to make the entire calendar green by the end of the month!
  </p>
);

export const HabitTrackerHeader = () => {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      <h2 className="text-xl font-semibold">Consistency Is Key</h2>
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
    </div>
  );
};