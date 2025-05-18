
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface NutritionTableProps {
  data: {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export const NutritionTable = ({ 
  data, 
  targetCalories, 
  targetProtein, 
  targetCarbs, 
  targetFat 
}: NutritionTableProps) => {
  const isMobile = useIsMobile();
  
  const getCaloriesStatus = (calories: number) => {
    if (calories === 0) return { emoji: "—", label: "No data", className: "text-gray-400" };
    const percentage = (calories / targetCalories) * 100;
    if (percentage < 80) return { emoji: "⚠️", label: "Low", className: "text-red-500" };
    if (percentage > 120) return { emoji: "⚠️", label: "High", className: "text-red-500" };
    if (percentage >= 80 && percentage < 90) return { emoji: "•", label: "Ok", className: "text-amber-500" };
    if (percentage > 110 && percentage <= 120) return { emoji: "•", label: "Ok", className: "text-amber-500" };
    return { emoji: "•", label: "Good", className: "text-emerald-500" };
  };

  const getMacroStatus = (value: number, target: number) => {
    if (value === 0) return { emoji: "—", label: "No data", className: "text-gray-400" };
    const percentage = (value / target) * 100;
    if (percentage < 80) return { emoji: "⚠️", label: "Low", className: "text-red-500" };
    if (percentage > 120) return { emoji: "⚠️", label: "High", className: "text-red-500" };
    if (percentage >= 80 && percentage < 90) return { emoji: "•", label: "Ok", className: "text-amber-500" };
    if (percentage > 110 && percentage <= 120) return { emoji: "•", label: "Ok", className: "text-amber-500" };
    return { emoji: "•", label: "Good", className: "text-emerald-500" };
  };

  const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Daily Nutrition Summary</h2>
      <ScrollArea className="w-full" type="always">
        <div className={`min-w-full ${isMobile ? 'w-[340px]' : ''}`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isMobile ? "w-[80px]" : "w-[120px]"}>Day</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Protein</TableHead>
                <TableHead>Carbs</TableHead>
                <TableHead>Fat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((day) => {
                const calStatus = getCaloriesStatus(day.calories);
                const proteinStatus = getMacroStatus(day.protein, targetProtein);
                const carbsStatus = getMacroStatus(day.carbs, targetCarbs);
                const fatStatus = getMacroStatus(day.fat, targetFat);
                
                const dayDate = parseISO(day.date);
                const formattedDay = format(dayDate, isMobile ? "dd MMM" : "EEE dd MMM");
                
                return (
                  <TableRow key={day.date}>
                    <TableCell className="font-medium text-xs md:text-sm whitespace-nowrap">{formattedDay}</TableCell>
                    <TableCell className="text-xs md:text-sm">
                      <div className="flex items-center gap-1">
                        <span>{calStatus.emoji}</span>
                        <span className={calStatus.className}>{day.calories} kcal</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm">
                      <div className="flex items-center gap-1">
                        <span>{proteinStatus.emoji}</span>
                        <span className={proteinStatus.className}>{day.protein}g</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm">
                      <div className="flex items-center gap-1">
                        <span>{carbsStatus.emoji}</span>
                        <span className={carbsStatus.className}>{day.carbs}g</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm">
                      <div className="flex items-center gap-1">
                        <span>{fatStatus.emoji}</span>
                        <span className={fatStatus.className}>{day.fat}g</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </Card>
  );
};
