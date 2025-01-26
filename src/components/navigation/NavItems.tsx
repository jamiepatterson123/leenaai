import React from "react";
import { Link } from "react-router-dom";
import { Home, UtensilsCrossed, Target, ClipboardList, MessageSquare } from "lucide-react";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export const mainNavigationItems = [
  { icon: Home, text: "Home", to: "/" },
  { icon: UtensilsCrossed, text: "Nutrition", to: "/food-diary" },
  { icon: Target, text: "Targets", to: "/profile" },
  { icon: ClipboardList, text: "Dashboard", to: "/reports" },
  { icon: MessageSquare, text: "WhatsApp", to: "/whatsapp" },
];

export const NavItems = () => {
  return (
    <>
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
    </>
  );
};