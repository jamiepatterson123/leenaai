
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileFormData } from "@/utils/profileCalculations";

export const useProfileCompletion = (profile: ProfileFormData | null) => {
  // Query to check WhatsApp preferences
  const { data: whatsappPrefs } = useQuery({
    queryKey: ['whatsapp-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('whatsapp_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) return null;
      return data;
    }
  });

  // Query to check if user has set password
  const { data: userMetadata } = useQuery({
    queryKey: ['user-metadata'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.user_metadata;
    }
  });

  const isProfileIncomplete = () => {
    if (!profile) return true;

    // Check if essential profile fields are filled
    const hasBasicInfo = profile.height_cm && 
                        profile.weight_kg && 
                        profile.age && 
                        profile.gender && 
                        profile.activity_level && 
                        profile.fitness_goals;

    // Check if WhatsApp preferences are set
    const hasWhatsAppSetup = whatsappPrefs?.phone_number;

    // Check if password has been set (for email signup users)
    const hasSetPassword = userMetadata?.has_set_password;

    return !(hasBasicInfo && hasWhatsAppSetup && hasSetPassword);
  };

  return { isProfileIncomplete, whatsappPrefs, userMetadata };
};
