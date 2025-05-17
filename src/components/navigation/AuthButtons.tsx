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
export const AuthButtons = ({
  handleShare,
  session
}: AuthButtonsProps) => {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      const {
        error
      } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out");
        return;
      }
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };
  const shareViaWhatsApp = () => {
    const shareMessage = "This is an AI nutrition app which allows you to track your nutrition with photos of your food. It's free to use, check it out";
    const encodedMessage = encodeURIComponent(shareMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };
  return <div className="flex items-center gap-4">
      
      {session}
    </div>;
};