
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  nutritionTable: boolean;
}

interface ChartSettingsProps {
  visibleCharts: VisibleCharts;
  onToggleChart: (chart: keyof VisibleCharts) => void;
  viewMode: "charts" | "table";
  onViewModeChange: (mode: "charts" | "table") => void;
}

export const ChartSettings = ({ 
  visibleCharts, 
  onToggleChart,
  viewMode,
  onViewModeChange
}: ChartSettingsProps) => {
  return (
    <div className="rounded-lg border shadow-sm p-4">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-4">View Mode</h3>
          <Tabs 
            defaultValue={viewMode}
            className="w-full"
            onValueChange={(value) => onViewModeChange(value as "charts" | "table")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {viewMode === "charts" && (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-4">Visible Charts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="weight-trend"
                    checked={visibleCharts.weightTrend}
                    onCheckedChange={() => onToggleChart("weightTrend")}
                  />
                  <Label htmlFor="weight-trend">Weight Trend</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="calorie-targets"
                    checked={visibleCharts.calorieTargets}
                    onCheckedChange={() => onToggleChart("calorieTargets")}
                  />
                  <Label htmlFor="calorie-targets">Calorie Targets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="calories"
                    checked={visibleCharts.calories}
                    onCheckedChange={() => onToggleChart("calories")}
                  />
                  <Label htmlFor="calories">Daily Calories</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="meal-distribution"
                    checked={visibleCharts.mealDistribution}
                    onCheckedChange={() => onToggleChart("mealDistribution")}
                  />
                  <Label htmlFor="meal-distribution">Meal Distribution</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="calorie-state"
                    checked={visibleCharts.calorieState}
                    onCheckedChange={() => onToggleChart("calorieState")}
                  />
                  <Label htmlFor="calorie-state">Liquid/Solid Calories</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="macros"
                    checked={visibleCharts.macros}
                    onCheckedChange={() => onToggleChart("macros")}
                  />
                  <Label htmlFor="macros">Macronutrient Averages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="macro-targets"
                    checked={visibleCharts.macroTargets}
                    onCheckedChange={() => onToggleChart("macroTargets")}
                  />
                  <Label htmlFor="macro-targets">Macro Targets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="protein-daily"
                    checked={visibleCharts.proteinDaily}
                    onCheckedChange={() => onToggleChart("proteinDaily")}
                  />
                  <Label htmlFor="protein-daily">Daily Protein</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="carbs-daily"
                    checked={visibleCharts.carbsDaily}
                    onCheckedChange={() => onToggleChart("carbsDaily")}
                  />
                  <Label htmlFor="carbs-daily">Daily Carbs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="fat-daily"
                    checked={visibleCharts.fatDaily}
                    onCheckedChange={() => onToggleChart("fatDaily")}
                  />
                  <Label htmlFor="fat-daily">Daily Fat</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="water-consumption"
                    checked={visibleCharts.waterConsumption}
                    onCheckedChange={() => onToggleChart("waterConsumption")}
                  />
                  <Label htmlFor="water-consumption">Water Consumption</Label>
                </div>
              </div>
            </div>
          </>
        )}

        {viewMode === "table" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Table Options</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="nutrition-table"
                checked={visibleCharts.nutritionTable}
                onCheckedChange={() => onToggleChart("nutritionTable")}
              />
              <Label htmlFor="nutrition-table">Nutrition Summary</Label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
