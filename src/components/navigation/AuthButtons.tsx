import React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthButtonsProps {
  handleShare: () => void;
}

export const AuthButtons = ({ handleShare }: AuthButtonsProps) => {
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
    </div>
  );
};