
import React from "react";

interface UsageStatusProps {
  isWithinFirst24Hours: boolean;
  usageCount: number;
  dailyLimitReached: boolean;
  hoursUntilNextUse: number;
}

export const UsageStatus: React.FC<UsageStatusProps> = ({ 
  isWithinFirst24Hours, 
  usageCount, 
  dailyLimitReached, 
  hoursUntilNextUse 
}) => {
  let statusText = '';
  
  if (isWithinFirst24Hours) {
    statusText = `${5 - usageCount} of 5 free image analyses left`;
  } else if (dailyLimitReached) {
    const hours = Math.ceil(hoursUntilNextUse);
    statusText = `Next image analysis in ${hours}h`;
  } else {
    statusText = "1 free image analysis available";
  }

  return (
    <div className="text-xs text-muted-foreground text-left w-full">
      {statusText}
    </div>
  );
};
