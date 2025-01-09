import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileHeader } from "@/components/home/ProfileHeader";
import { HomeDataSection } from "@/components/home/HomeDataSection";

const Index = () => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        toast.error("Error fetching profile");
        throw error;
      }

      return data;
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 md:pb-8">
      <h1 className="text-4xl font-bold text-primary mb-8">Leena.ai</h1>
      <ProfileHeader profile={profile} />
      <HomeDataSection />
    </div>
  );
};

export default Index;