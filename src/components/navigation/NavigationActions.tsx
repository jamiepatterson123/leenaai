import { useNavigate } from "react-router-dom";
import { LogOut, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../ThemeToggle";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const NavigationActions = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast.success("Successfully signed out");
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Error signing out. Please try again.");
    }
  };

  const handleShare = () => {
    try {
      const instagramUrl = `https://www.instagram.com/create/story?url=${encodeURIComponent(window.location.origin)}`;
      window.open(instagramUrl, '_blank');
      toast.success("Opening Instagram Stories...");
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("Couldn't open Instagram Stories. Please try again.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="text-gray-600"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      <ThemeToggle />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="text-gray-600"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};