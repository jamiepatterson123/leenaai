import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NutritionBarChart } from "@/components/NutritionBarChart";
import { TargetCalculations } from "@/utils/profileCalculations";

interface TargetsDisplayProps {
  targets: TargetCalculations;
}

export const TargetsDisplay = ({ targets }: TargetsDisplayProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Targets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-lg">
            Target Calories: {targets.calories} kcal/day
          </div>
          <NutritionBarChart
            data={[
              { name: 'Protein', value: targets.protein, fill: '#22c55e' },
              { name: 'Fat', value: targets.fat, fill: '#eab308' },
              { name: 'Carbs', value: targets.carbs, fill: '#3b82f6' },
            ]}
          />
          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>Protein: {targets.protein}g</div>
            <div>Fat: {targets.fat}g</div>
            <div>Carbs: {targets.carbs}g</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};