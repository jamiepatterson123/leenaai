import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TargetCalculations } from "@/utils/profileCalculations";
import { MacroCircle } from "@/components/nutrition/MacroCircle";

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center justify-items-center">
          <MacroCircle
            current={targets.calories}
            target={targets.calories}
            label="Calories"
            unit="kcal"
            color="bg-blue-500"
          />
          <MacroCircle
            current={targets.protein}
            target={targets.protein}
            label="Protein"
            color="bg-green-500"
          />
          <MacroCircle
            current={targets.carbs}
            target={targets.carbs}
            label="Carbs"
            color="bg-yellow-500"
          />
          <MacroCircle
            current={targets.fat}
            target={targets.fat}
            label="Fat"
            color="bg-red-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};