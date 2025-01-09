import React from "react";
import { Link } from "react-router-dom";
import { Home, UtensilsCrossed, Target, ClipboardList, UserCheck, Send } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { MoreDropdown } from "./MoreDropdown";

export const DesktopNav = ({ 
  handleShare, 
  handleSignOut,
  theme,
  toggleTheme 
}: { 
  handleShare: () => void;
  handleSignOut: () => void;
  theme: "light" | "dark";
  toggleTheme: (checked: boolean) => void;
}) => {
  const mainNavigationItems = [
    { icon: Home, text: "Home", to: "/" },
    { icon: UtensilsCrossed, text: "Nutrition", to: "/food-diary" },
    { icon: Target, text: "Targets", to: "/profile" },
    { icon: ClipboardList, text: "Dashboard", to: "/reports" },
    { icon: UserCheck, text: "Coach", to: "/coach" },
  ];

  return (
    <div className="hidden md:flex items-center gap-4">
      <NavigationMenu>
        <NavigationMenuList>
          {mainNavigationItems.map((item) => (
            <NavigationMenuItem key={item.to}>
              <Link to={item.to}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.text}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem>
            <MoreDropdown />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

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
    </div>
  );
};