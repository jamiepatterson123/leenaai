import React from "react";
import { Send, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AuthButtonsProps {
  handleShare: () => void;
  handleSignOut: () => void;
  session: any;
}

export const AuthButtons = ({ handleShare, handleSignOut, session }: AuthButtonsProps) => {
  const shareViaWhatsApp = () => {
    const message = encodeURIComponent("Check out this really cool app. It's called Leena.ai and it accurately logs your nutritional info from just photos of your food! The future is here 🤯 www.getleena.ai");
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast.success("Opening WhatsApp to share Leena!");
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={shareViaWhatsApp}
        className="text-muted-foreground hover:text-primary transition-colors"
        title="Share Leena"
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