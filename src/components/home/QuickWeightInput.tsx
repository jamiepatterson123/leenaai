import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Weight } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
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
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get the current date in YYYY-MM-DD format
      const today = format(new Date(), 'yyyy-MM-dd');

      // Check if there's already an entry for today
      const {
        data: existingEntries
      } = await supabase.from("weight_history").select("id").eq("user_id", user.id).gte("recorded_at", `${today}T00:00:00`).lte("recorded_at", `${today}T23:59:59`);
      if (existingEntries && existingEntries.length > 0) {
        // Update the existing entry for today
        const {
          error: updateError
        } = await supabase.from("weight_history").update({
          weight_kg: weightValue
        }).eq("id", existingEntries[0].id);
        if (updateError) throw updateError;
        toast.success("Weight updated");
      } else {
        // Create a new entry
        const {
          error: historyError
        } = await supabase.from("weight_history").insert({
          user_id: user.id,
          weight_kg: weightValue
        });
        if (historyError) throw historyError;
        toast.success("Weight added");
      }

      // Update the profile record with the latest weight
      const {
        error: profileError
      } = await supabase.from("profiles").update({
        weight_kg: weightValue
      }).eq("user_id", user.id);
      if (profileError) throw profileError;

      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({
        queryKey: ["weightHistory"]
      });
      await queryClient.invalidateQueries({
        queryKey: ["profile"]
      });
      setWeight("");
    } catch (error) {
      console.error("Error updating weight:", error);
      toast.error("Failed to update weight");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="bg-white rounded-lg border border-gray-200 p-4">
      
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input type="number" step="0.1" min="0" placeholder="kg" value={weight} onChange={e => setWeight(e.target.value)} className="flex-1 text-sm" />
        <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting || !weight}>
          {isSubmitting ? "..." : "Save"}
        </Button>
      </form>
    </div>;
};