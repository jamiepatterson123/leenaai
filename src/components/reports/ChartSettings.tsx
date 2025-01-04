import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface VisibleCharts {
  weightTrend: boolean;
  calorieTargets: boolean;
  calories: boolean;
  mealDistribution: boolean;
  calorieState: boolean;
  macros: boolean;
  macroTargets: boolean;
  proteinDaily: boolean;
  carbsDaily: boolean;
  fatDaily: boolean;
  waterConsumption: boolean;
}

interface ChartSettingsProps {
  visibleCharts: VisibleCharts;
  onToggleChart: (chart: keyof VisibleCharts) => void;
}

export const ChartSettings = ({ visibleCharts, onToggleChart }: ChartSettingsProps) => {
  const chartOptions = [
    { key: 'weightTrend', label: 'Weight Trend' },
    { key: 'calorieTargets', label: 'Calorie Targets' },
    { key: 'calories', label: 'Calories Over Time' },
    { key: 'mealDistribution', label: 'Meal Distribution' },
    { key: 'calorieState', label: 'Calorie State' },
    { key: 'macros', label: 'Macronutrients' },
    { key: 'macroTargets', label: 'Macro Targets' },
    { key: 'proteinDaily', label: 'Daily Protein' },
    { key: 'carbsDaily', label: 'Daily Carbs' },
    { key: 'fatDaily', label: 'Daily Fat' },
    { key: 'waterConsumption', label: 'Water Consumption' },
  ] as const;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="w-full md:w-auto">
          <Settings2 className="w-4 h-4 mr-2" />
          Customize Dashboard
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Dashboard Settings</SheetTitle>
          <SheetDescription>
            Choose which charts to display on your dashboard
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-4">
          {chartOptions.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="flex-1">{label}</Label>
              <Switch
                id={key}
                checked={visibleCharts[key]}
                onCheckedChange={() => onToggleChart(key)}
              />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};