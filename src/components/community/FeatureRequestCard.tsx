import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThumbsUp } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeatureRequestCardProps {
  feature: {
    id: string;
    title: string;
    description: string;
    votes_count: number;
    created_at: string;
    feature_votes: Array<{ user_id: string }>;
  };
  currentUserId: string | undefined;
}

export const FeatureRequestCard = ({ feature, currentUserId }: FeatureRequestCardProps) => {
  const queryClient = useQueryClient();

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
        const { error } = await supabase
          .from("feature_votes")
          .delete()
          .eq("feature_id", featureId)
          .eq("user_id", session.user.id);

        if (error) throw error;
        return "removed";
      } else {
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

  const hasVoted = feature.feature_votes?.some(
    (vote) => vote.user_id === currentUserId
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{feature.title}</CardTitle>
        <CardDescription>{feature.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Button
            variant={hasVoted ? "default" : "outline"}
            size="icon"
            className="flex-shrink-0"
            onClick={() => voteForFeature.mutate(feature.id)}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <div>
            <p className="font-medium">{feature.votes_count} votes</p>
            <p className="text-sm text-gray-500">
              Submitted on {new Date(feature.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};