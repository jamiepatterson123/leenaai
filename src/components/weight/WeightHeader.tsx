import React from "react";
import { Scale, Info } from "lucide-react";

export const WeightHeader = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2">
        <Scale className="h-10 w-10 text-primary" strokeWidth={1} />
        <Info className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
      </div>
    </div>
  );
};