import React from "react";
import { Link } from "react-router-dom";
import { Home, UtensilsCrossed } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export const Navigation = () => {
  return (
    <div className="border-b mb-6">
      <div className="max-w-4xl mx-auto p-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/food-diary">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Food Diary
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};