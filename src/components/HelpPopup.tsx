import React from "react";
import { MessageSquare } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";

export const HelpPopup = () => {
  const getCurrentPageHelp = () => {
    const path = window.location.pathname;
    
    switch (path) {
      case "/":
        return "Welcome to your nutrition dashboard! Here you can:\n- Track your daily food intake\n- Upload food images for analysis\n- Monitor your weight progress";
      case "/food-diary":
        return "In your food diary, you can:\n- Log your meals\n- Upload food images\n- View your nutrition data by date";
      case "/profile":
        return "Update your profile with:\n- Personal information\n- Dietary preferences\n- Nutrition targets";
      case "/reports":
        return "View detailed reports of:\n- Calorie intake\n- Macro distributions\n- Weight progress";
      case "/coach":
        return "Get personalized guidance on:\n- Meal planning\n- Nutrition goals\n- Diet optimization";
      default:
        return "Need help? Hover over this icon for context-sensitive help about the current page.";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent 
          align="end" 
          side="top"
          className="w-80 p-4 mb-2"
          sideOffset={16}
        >
          <div className="space-y-2">
            <h4 className="font-medium">Help & Support</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {getCurrentPageHelp()}
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};