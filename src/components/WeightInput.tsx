import React from "react";
import { WeightHeader } from "@/components/weight/WeightHeader";
import { WeightForm } from "@/components/weight/WeightForm";

interface WeightInputProps {
  onSuccess?: () => void;
}

export const WeightInput = ({ onSuccess }: WeightInputProps) => {
  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200">
      <div className="flex flex-col items-center justify-center p-6 space-y-6">
        <WeightHeader />
        <WeightForm onSuccess={onSuccess} />
      </div>
    </div>
  );
};