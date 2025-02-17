
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { NotificationToggle } from "./NotificationToggle";
import { PhoneNumberInput } from "./PhoneNumberInput";
import { TimezoneSelector } from "./TimezoneSelector";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export const WhatsAppPreferences = () => {
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["whatsappPreferences"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("whatsapp_preferences")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching WhatsApp preferences:", error);
        throw error;
      }

      return data?.[0] || null;
    },
  });

  const updatePreferences = async (updates: Partial<typeof preferences>) => {
    // Don't update if the value hasn't changed
    if (preferences?.phone_number === updates.phone_number) {
      return;
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast.error("You must be logged in to update preferences");
      return;
    }

    const { error } = await supabase
      .from("whatsapp_preferences")
      .upsert({
        user_id: user.user.id,
        ...preferences,
        ...updates,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error updating WhatsApp preferences:", error);
      toast.error("Failed to update preferences");
      return;
    }

    toast.success("Preferences updated successfully");
  };

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <PhoneNumberInput
        value={preferences?.phone_number || ""}
        onChange={(phone_number) => updatePreferences({ phone_number })}
      />
      
      <NotificationToggle
        label="Daily Reminders"
        enabled={preferences?.reminders_enabled ?? true}
        onChange={(reminders_enabled) => updatePreferences({ reminders_enabled })}
      />
      
      <NotificationToggle
        label="Weekly Reports"
        enabled={preferences?.weekly_report_enabled ?? true}
        onChange={(weekly_report_enabled) => updatePreferences({ weekly_report_enabled })}
      />
      
      <TimezoneSelector
        value={preferences?.timezone || "UTC"}
        onChange={(timezone) => updatePreferences({ timezone })}
      />
    </div>
  );
};
