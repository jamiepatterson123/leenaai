import React from "react";
import { CustomTargets } from "@/components/profile/CustomTargets";
import { TargetsDisplay } from "@/components/profile/TargetsDisplay";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { calculateTargets } from "@/utils/profileCalculations";

const Targets = () => {
  const [targets, setTargets] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile(data);
        const calculatedTargets = calculateTargets(data);
        setTargets(calculatedTargets);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Macro Targets</h1>
      {targets && <TargetsDisplay targets={targets} />}
      <CustomTargets 
        initialData={{
          target_protein: profile?.target_protein,
          target_carbs: profile?.target_carbs,
          target_fat: profile?.target_fat,
        }}
      />
    </div>
  );
};

export default Targets;