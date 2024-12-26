import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ThumbsUp } from "lucide-react";

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

      if (error) {
        toast.error("Error fetching feature requests");
        throw error;
      }

      return data;
    },
  });

  const createFeatureRequest = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to create a feature request");
      }

      const { error } = await supabase.from("feature_requests").insert({
        title,
        description,
        user_id: session.user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureRequests"] });
      setTitle("");
      setDescription("");
      toast.success("Feature request created successfully!");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error creating feature request"
      );
    },
  });

  const voteForFeature = useMutation({
    mutationFn: async (featureId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to vote");
      }

      const { data: existingVote } = await supabase
        .from("feature_votes")
        .select("*")
        .eq("feature_id", featureId)
        .eq("user_id", session.user.id)
        .single();

      if (existingVote) {
        // Remove vote if it exists
        const { error } = await supabase
          .from("feature_votes")
          .delete()
          .eq("feature_id", featureId)
          .eq("user_id", session.user.id);

        if (error) throw error;
        return "removed";
      } else {
        // Add vote if it doesn't exist
        const { error } = await supabase
          .from("feature_votes")
          .insert({
            feature_id: featureId,
            user_id: session.user.id,
          });

        if (error) throw error;
        return "added";
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["featureRequests"] });
      toast.success(
        result === "added"
          ? "Vote added successfully!"
          : "Vote removed successfully!"
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Error processing vote"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFeatureRequest.mutate();
  };

  const hasVoted = async (feature: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    return feature.feature_votes?.some(
      (vote: any) => vote.user_id === session?.user?.id
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Community Feature Requests</h1>

      <Card className="mb-8">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Submit a Feature Request</CardTitle>
            <CardDescription>
              Share your ideas for improving the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Submit Request</Button>
          </CardFooter>
        </form>
      </Card>

      <div className="grid gap-4">
        {featureRequests?.map((feature: any) => (
          <Card key={feature.id}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Button
                  variant={feature.feature_votes?.some((vote: any) => vote.user_id === supabase.auth.getSession()?.data?.session?.user?.id) ? "default" : "outline"}
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => voteForFeature.mutate(feature.id)}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <div>
                  <p className="font-medium">{feature.votes_count} votes</p>
                  <p className="text-sm text-gray-500">
                    Submitted on{" "}
                    {new Date(feature.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Community;