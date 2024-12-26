import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FeatureRequestForm } from "@/components/community/FeatureRequestForm";
import { FeatureRequestCard } from "@/components/community/FeatureRequestCard";
import { useEffect, useState } from "react";

const Community = () => {
  const [currentUserId, setCurrentUserId] = useState<string>();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id);
    };
    getCurrentUser();
  }, []);

  const { data: featureRequests, isLoading } = useQuery({
    queryKey: ["featureRequests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_requests")
        .select(`
          *,
          feature_votes (
            user_id
          )
        `)
        .order("votes_count", { ascending: false });

      if (error) {
        toast.error("Error fetching feature requests");
        throw error;
      }

      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Community Feature Requests</h1>
      <FeatureRequestForm />
      <div className="grid gap-4">
        {featureRequests?.map((feature) => (
          <FeatureRequestCard 
            key={feature.id} 
            feature={feature}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
};

export default Community;