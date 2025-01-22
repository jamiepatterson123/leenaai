import React from "react";
import { WeightHeader } from "@/components/weight/WeightHeader";
import { WeightForm } from "@/components/weight/WeightForm";

interface WeightInputProps {
  onSuccess?: () => void;
}

export const WeightInput = ({ onSuccess }: WeightInputProps) => {
  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col items-center justify-center p-6">
        <WeightHeader />
        <WeightForm onSuccess={onSuccess} />
      </div>
    </div>
  );
};