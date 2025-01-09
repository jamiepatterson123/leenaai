import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useNutritionTargets } from "@/components/nutrition/useNutritionTargets";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface MacroTargetsChartProps {
  data: {
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

export const MacroTargetsChart = ({ data }: MacroTargetsChartProps) => {
  const { targets } = useNutritionTargets();
  const isMobile = useIsMobile();
  
  // Calculate averages for the week
  const averages = data.reduce((acc, day) => ({
    protein: acc.protein + day.protein,
    carbs: acc.carbs + day.carbs,
    fat: acc.fat + day.fat,
  }), { protein: 0, carbs: 0, fat: 0 });

  const weeklyData = [
    {
      name: "Protein",
      value: averages.protein / data.length,
      target: targets.protein,
      color: "#ea384c",
    },
    {
      name: "Carbs",
      value: averages.carbs / data.length,
      target: targets.carbs,
      color: "#FFD700",
    },
    {
      name: "Fat",
      value: averages.fat / data.length,
      target: targets.fat,
      color: "#06b6d4",
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">Weekly Macro Averages vs Targets</h2>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Compare your weekly macronutrient intake against your targets. This helps ensure you're maintaining the right balance for your goals.</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            margin={{ top: 20, right: 30, left: isMobile ? 30 : 60, bottom: isMobile ? 60 : 5 }}
            layout={isMobile ? "vertical" : "horizontal"}
          >
            {isMobile ? (
              <>
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
              </>
            ) : (
              <>
                <XAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  height={50}
                />
                <YAxis 
                  type="number"
                  tick={{ fontSize: 12 }}
                />
              </>
            )}
            <Legend 
              verticalAlign="top"
              height={36}
              wrapperStyle={{
                paddingBottom: "20px",
                fontSize: "12px"
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const percentage = (data.value / data.target) * 100;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <p className="font-medium">{data.name}</p>
                        <p>Average: {data.value.toFixed(1)}g</p>
                        <p>Target: {data.target}g</p>
                        <p>{percentage.toFixed(0)}% of target</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="target"
              fill="#8E9196"
              name="Target"
              barSize={20}
            />
            <Bar
              dataKey="value"
              name="Average"
              barSize={20}
            >
              {weeklyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};