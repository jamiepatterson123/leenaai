
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneNumberInput } from "./PhoneNumberInput";
import { NotificationToggle } from "./NotificationToggle";
import { TimezoneSelector } from "./TimezoneSelector";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const WhatsAppPreferences = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const queryClient = useQueryClient();

  // Fetch existing preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['whatsapp-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from('whatsapp_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (preferences?.phone_number) {
      setPhoneNumber(preferences.phone_number);
    }
  }, [preferences]);

  const handlePhoneNumberChange = async (newPhoneNumber: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to update preferences");
        return;
      }

      setPhoneNumber(newPhoneNumber);

      const { error } = await supabase
        .from('whatsapp_preferences')
        .upsert({
          user_id: user.id,
          phone_number: newPhoneNumber,
        });

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['whatsapp-preferences'] });
      toast.success("Phone number updated successfully");
    } catch (error) {
      console.error('Error updating phone number:', error);
      toast.error("Failed to update phone number");
    }
  };

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <PhoneNumberInput
          value={phoneNumber}
          onChange={handlePhoneNumber => handlePhoneNumberChange(handlePhoneNumber)}
        />
        <NotificationToggle />
        <TimezoneSelector />
      </CardContent>
    </Card>
  );
};
