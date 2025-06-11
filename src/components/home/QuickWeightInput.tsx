
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Weight, Info } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

export const QuickWeightInput = () => {
  const [weight, setWeight] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    setIsSubmitting(true);

    try {
      const weightValue = parseFloat(weight);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      // Get the current date in YYYY-MM-DD format
      const today = format(new Date(), "yyyy-MM-dd");

      // Check if there's already an entry for today
      const { data: existingEntries } = await supabase
        .from("weight_history")
        .select("id")
        .eq("user_id", user.id)
        .gte("recorded_at", `${today}T00:00:00`)
        .lte("recorded_at", `${today}T23:59:59`);

      if (existingEntries && existingEntries.length > 0) {
        // Update the existing entry for today
        const { error: updateError } = await supabase
          .from("weight_history")
          .update({
            weight_kg: weightValue,
          })
          .eq("id", existingEntries[0].id);

        if (updateError) throw updateError;
        toast.success("Weight updated");
      } else {
        // Create a new entry
        const { error: historyError } = await supabase
          .from("weight_history")
          .insert({
            user_id: user.id,
            weight_kg: weightValue,
          });

        if (historyError) throw historyError;
        toast.success("Weight added");
      }

      // Update the profile record with the latest weight
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          weight_kg: weightValue,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({
        queryKey: ["weightHistory"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["profile"],
      });

      setWeight("");
    } catch (error) {
      console.error("Error updating weight:", error);
      toast.error("Failed to update weight");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-medium text-gray-700">Daily Weight</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Info className="h-4 w-4 text-gray-500" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogTitle>Daily Weighing Leads to Greater Weight Loss</DialogTitle>
            <div className="space-y-3 pt-2">
              <p className="text-sm text-gray-700">
                A 2015 randomized controlled trial published in Obesity found that individuals who weighed themselves daily lost significantly more weight over a year than those who did not.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Source:</strong> Steinberg et al., Obesity (Silver Spring), 2015.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Finding:</strong> Daily weighers lost ~6 kg more than those who didn't weigh themselves daily.
              </p>
              <div className="border-t pt-3 space-y-2">
                <p className="text-sm text-gray-700">
                  For most accurate readings, weigh yourself in the morning before eating or drinking and after using the bathroom.
                </p>
                <p className="text-sm text-gray-700">
                  Over time, Leena will identify trends in your weight based on your nutrition patterns and lifestyle.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="number"
          step="0.1"
          min="0"
          placeholder="Update daily for best results"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="flex-1 text-sm h-10"
        />
        <Button
          type="submit"
          size="sm"
          variant="gradient"
          className="h-10"
          disabled={isSubmitting || !weight}
        >
          {isSubmitting ? "..." : "Save"}
        </Button>
      </form>
    </div>
  );
};
