import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const Community = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

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

      if (error) throw error;
      return data;
    },
  });

  const createFeatureRequest = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("feature_requests").insert({
        title,
        description,
        user_id: userData.user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureRequests"] });
      setTitle("");
      setDescription("");
      toast.success("Feature request submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit feature request: " + error.message);
    },
  });

  const voteForFeature = useMutation({
    mutationFn: async (featureId: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("feature_votes").insert({
        feature_id: featureId,
        user_id: userData.user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureRequests"] });
      toast.success("Vote recorded!");
    },
    onError: (error) => {
      toast.error("Failed to vote: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Please fill in all fields");
      return;
    }
    createFeatureRequest.mutate();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Community Feature Requests</h1>
        <p className="text-muted-foreground">
          Your suggestions go directly to our CEO, who personally reviews every request.
          The most popular features will be prioritized for development.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Submit a Feature Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Feature title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-2"
              />
              <Textarea
                placeholder="Describe the feature you'd like to see..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <Button type="submit" className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              Submit Feature Request
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h2 className="text-2xl font-semibold mb-4">Feature Leaderboard</h2>
        {isLoading ? (
          <p>Loading feature requests...</p>
        ) : (
          featureRequests?.map((feature) => (
            <Card key={feature.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => voteForFeature.mutate(feature.id)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {feature.votes_count} votes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;