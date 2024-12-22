import { TargetsDisplay } from "@/components/profile/TargetsDisplay";
import { calculateTargets } from "@/utils/profileCalculations";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const TargetsSection = () => {
  const [targets, setTargets] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const calculatedTargets = calculateTargets(profile);
        setTargets(calculatedTargets);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  return targets ? <TargetsDisplay targets={targets} /> : null;
};