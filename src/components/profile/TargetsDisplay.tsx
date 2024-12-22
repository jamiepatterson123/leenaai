import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TargetCalculations } from "@/utils/profileCalculations";
import { MacroRing } from "@/components/nutrition/MacroRing";

interface TargetsDisplayProps {
  targets: TargetCalculations;
}

export const TargetsDisplay = ({ targets }: TargetsDisplayProps) => {
  return (
    <Card className="bg-background">
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