import React from "react";
import { useNavigate } from "react-router-dom";
import { Send, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthButtonsProps {
  handleShare: () => void;
  session: any;
}

export const AuthButtons = ({ handleShare, session }: AuthButtonsProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        toast.error("Error signing out");
        return;
      }
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Error signing out");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleShare}
        className="text-muted-foreground"
      >
        <Send className="w-4 h-4" />
      </Button>
      {session && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-primary"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};