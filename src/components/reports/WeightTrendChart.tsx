import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { WeightChartConfig } from "./WeightChartConfig";

interface WeightTrendChartProps {
  data: {
    weight: number | null;
    date: string;
  }[];
}

export const WeightTrendChart = ({ data }: WeightTrendChartProps) => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("preferred_units")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (date: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to delete weight entries");
        return;
      }

      const { error } = await supabase
        .from("weight_history")
        .delete()
        .eq("user_id", user.id)
        .eq("recorded_at", date);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["weightHistory"] });
      toast.success("Weight entry deleted successfully");
    } catch (error) {
      console.error("Error deleting weight entry:", error);
      toast.error("Failed to delete weight entry");
    }
  };

  const preferredUnits = profile?.preferred_units || 'metric';
  
  const convertedData = data.map(entry => ({
    ...entry,
    weight: entry.weight !== null 
      ? preferredUnits === 'imperial' 
        ? Math.round(entry.weight * 2.20462 * 10) / 10
        : entry.weight
      : null
  })).filter((entry): entry is { weight: number; date: string } => 
    entry.weight !== null
  );

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">Weight Trend</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0"
            >
              <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <p>Track your weight changes over time to monitor progress toward your goals.</p>
          </DialogContent>
        </Dialog>
      </div>
      <div className="h-[400px] w-full">
        <WeightChartConfig
          data={convertedData}
          preferredUnits={preferredUnits}
          isMobile={isMobile}
          onDelete={handleDelete}
        />
      </div>
    </Card>
  );
};