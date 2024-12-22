import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TargetCalculations } from "@/utils/profileCalculations";
import { MacroRing } from "@/components/nutrition/MacroRing";
import { cn } from "@/lib/utils";

interface TargetsDisplayProps {
  targets: TargetCalculations;
  className?: string;
}

export const TargetsDisplay = ({ targets, className }: TargetsDisplayProps) => {
  return (
    <Card className={cn("bg-background", className)}>
      <CardHeader>
        <CardTitle>Daily Targets</CardTitle>
      </CardHeader>
      <CardContent>
        <MacroRing
          calories={targets.calories}
          protein={targets.protein}
          carbs={targets.carbs}
          fat={targets.fat}
          targetCalories={targets.calories}
        />
      </CardContent>
    </Card>
  );
};