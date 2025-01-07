import React from "react";
import { Link } from "react-router-dom";
import { Home, UtensilsCrossed, Target, Search, HelpCircle, LogOut } from "lucide-react";
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
    { icon: UtensilsCrossed, text: "Foods", to: "/food-diary" },
    { icon: Target, text: "Targets", to: "/profile" },
    { icon: Search, text: "Search", to: "/reports" },
    { icon: HelpCircle, text: "Support", to: "/coach" },
  ];

  return (
    <div className="flex flex-col h-full">
      <nav className="space-y-1 p-4">
        {mainNavigationItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.text}</span>
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto p-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          <span>Sign out</span>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};