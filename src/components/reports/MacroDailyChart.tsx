import { Card } from "@/components/ui/card";
import { NutritionBarChart } from "@/components/NutritionBarChart";

interface MacroDailyChartProps {
  data: {
    date: string;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  type: "protein" | "carbs" | "fat";
}

export const MacroDailyChart = ({ data, targetProtein, targetCarbs, targetFat, type }: MacroDailyChartProps) => {
  const getTitle = () => {
    switch (type) {
      case "protein":
        return "Daily Protein Intake";
      case "carbs":
        return "Daily Carbohydrate Intake";
      case "fat":
        return "Daily Fat Intake";
    }
  };

  const getTarget = () => {
    switch (type) {
      case "protein":
        return targetProtein;
      case "carbs":
        return targetCarbs;
      case "fat":
        return targetFat;
    }
  };

  const getColor = () => {
    switch (type) {
      case "protein":
        return "#0ea5e9"; // sky-500
      case "carbs":
        return "#22c55e"; // green-500
      case "fat":
        return "#f97316"; // orange-500
    }
  };

  const chartData = data.map((entry) => ({
    name: entry.date,
    value: entry[type],
    target: getTarget(),
    color: getColor(),
  }));

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">{getTitle()}</h2>
      <NutritionBarChart data={chartData} />
    </Card>
  );
};