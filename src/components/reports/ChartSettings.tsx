import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChartSettingsType } from "@/integrations/supabase/types/profiles";
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

// Set default values to the current toggle states
export const defaultVisibleCharts: VisibleCharts = {
  weightTrend: true,
  calorieTargets: true,
  calories: true,
  mealDistribution: true,
  calorieState: true,
  macros: true,
  macroTargets: true,
  proteinDaily: true,
  carbsDaily: true,
  fatDaily: true,
  waterConsumption: true,
  nutritionTable: false
};
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
  // Function to save current chart settings to user profile
  const saveChartSettingsAsDefault = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to save settings");
        return;
      }

      // Convert to a JSON-compatible format
      const chartSettingsData: ChartSettingsType = {
        visibleCharts: {
          ...visibleCharts
        },
        viewMode
      };
      const {
        error
      } = await supabase.from("profiles").update({
        chart_settings: chartSettingsData
      }).eq("user_id", user.id);
      if (error) {
        console.error("Error saving chart settings:", error);
        toast.error("Failed to save chart settings");
      } else {
        toast.success("Chart settings saved as default");
      }
    } catch (err) {
      console.error("Error in saveChartSettingsAsDefault:", err);
      toast.error("An unexpected error occurred");
    }
  };
  return <div className="rounded-lg border shadow-sm p-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">View Mode</h3>
          
        </div>
        <Tabs defaultValue={viewMode} className="w-full" onValueChange={value => onViewModeChange(value as "charts" | "table")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
        </Tabs>

        {viewMode === "charts" && <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="visible-charts" className="border-none">
              <AccordionTrigger className="py-0">
                <h3 className="text-lg font-semibold">Visible Charts</h3>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="weight-trend" checked={visibleCharts.weightTrend} onCheckedChange={() => onToggleChart("weightTrend")} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] data-[state=unchecked]:bg-white data-[state=unchecked]:border-gray-200" />
                    <Label htmlFor="weight-trend">Weight Trend</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="calorie-targets" checked={visibleCharts.calorieTargets} onCheckedChange={() => onToggleChart("calorieTargets")} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] data-[state=unchecked]:bg-white data-[state=unchecked]:border-gray-200" />
                    <Label htmlFor="calorie-targets">Calorie Targets</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="calories" checked={visibleCharts.calories} onCheckedChange={() => onToggleChart("calories")} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] data-[state=unchecked]:bg-white data-[state=unchecked]:border-gray-200" />
                    <Label htmlFor="calories">Daily Calories</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="meal-distribution" checked={visibleCharts.mealDistribution} onCheckedChange={() => onToggleChart("mealDistribution")} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] data-[state=unchecked]:bg-white data-[state=unchecked]:border-gray-200" />
                    <Label htmlFor="meal-distribution">Meal Distribution</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="calorie-state" checked={visibleCharts.calorieState} onCheckedChange={() => onToggleChart("calorieState")} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] data-[state=unchecked]:bg-white data-[state=unchecked]:border-gray-200" />
                    <Label htmlFor="calorie-state">Liquid/Solid Calories</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="macros" checked={visibleCharts.macros} onCheckedChange={() => onToggleChart("macros")} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] data-[state=unchecked]:bg-white data-[state=unchecked]:border-gray-200" />
                    <Label htmlFor="macros">Macronutrient Averages</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="macro-targets" checked={visibleCharts.macroTargets} onCheckedChange={() => onToggleChart("macroTargets")} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] data-[state=unchecked]:bg-white data-[state=unchecked]:border-gray-200" />
                    <Label htmlFor="macro-targets">Macro Targets</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="protein-daily" checked={visibleCharts.proteinDaily} onCheckedChange={() => onToggleChart("proteinDaily")} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] data-[state=unchecked]:bg-white data-[state=unchecked]:border-gray-200" />
                    <Label htmlFor="protein-daily">Daily Protein</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="carbs-daily" checked={visibleCharts.carbsDaily} onCheckedChange={() => onToggleChart("carbsDaily")} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] data-[state=unchecked]:bg-white data-[state=unchecked]:border-gray-200" />
                    <Label htmlFor="carbs-daily">Daily Carbs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="fat-daily" checked={visibleCharts.fatDaily} onCheckedChange={() => onToggleChart("fatDaily")} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] data-[state=unchecked]:bg-white data-[state=unchecked]:border-gray-200" />
                    <Label htmlFor="fat-daily">Daily Fat</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="water-consumption" checked={visibleCharts.waterConsumption} onCheckedChange={() => onToggleChart("waterConsumption")} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] data-[state=unchecked]:bg-white data-[state=unchecked]:border-gray-200" />
                    <Label htmlFor="water-consumption">Water Consumption</Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>}

        {viewMode === "table" && <div>
            
            
          </div>}
        
        {/* Add Save Settings button */}
        <Button onClick={saveChartSettingsAsDefault} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] text-white">
          Save as Default Settings
        </Button>
      </div>
    </div>;
};