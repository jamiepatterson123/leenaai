import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HomeDataSection } from "@/components/home/HomeDataSection";

const Index = () => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error fetching profile");
        return null;
      }

      return data;
    },
  });

  return (
    <main className="container mx-auto px-4 pb-24 md:pb-8 pt-8">
      <HomeDataSection />
    </main>
  );
};

export default Index;