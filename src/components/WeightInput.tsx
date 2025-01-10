import React from "react";
import { WeightHeader } from "@/components/weight/WeightHeader";
import { WeightForm } from "@/components/weight/WeightForm";

interface WeightInputProps {
  onSuccess?: () => void;
}

export const WeightInput = ({ onSuccess }: WeightInputProps) => {
  return (
    <div className="w-full mx-auto border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="flex flex-col items-center justify-center h-48 p-4">
        <WeightHeader />
        <WeightForm onSuccess={onSuccess} />
      </div>
    </div>
  );
};