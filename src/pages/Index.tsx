import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HomeDataSection } from "@/components/home/HomeDataSection";
import { useSession } from "@/hooks/useSession";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { session, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/welcome");
    }
  }, [session, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Error fetching profile");
          return null;
        }

        return data;
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error("Error fetching profile");
        return null;
      }
    },
    enabled: !!session,
  });

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <main className="container mx-auto px-4 pb-24 md:pb-8 pt-8">
      <HomeDataSection />
    </main>
  );
};

export default Index;