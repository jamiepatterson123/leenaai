import React from "react";
import { useNavigate } from "react-router-dom";
import { Send, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        toast.error("Error signing out");
        return;
      }
      navigate("/welcome");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent("Check out Leena, the AI nutrition coach! www.getleena.ai");
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast.success("Opening WhatsApp to share Leena!");
  };

  const shareViaInstagram = () => {
    // Instagram doesn't support direct sharing via URL, so we'll copy the message to clipboard
    navigator.clipboard.writeText("Check out Leena, the AI nutrition coach! www.getleena.ai");
    window.open('https://instagram.com/direct/inbox', '_blank');
    toast.success("Message copied! Opening Instagram Direct Messages");
  };

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Share Leena"
          >
            <Send className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={shareViaWhatsApp}>
            Share via WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareViaInstagram}>
            Share via Instagram
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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