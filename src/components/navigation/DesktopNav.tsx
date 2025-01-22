import React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MoreDropdown } from "./MoreDropdown";
import { NavItems } from "./NavItems";
import { AuthButtons } from "./AuthButtons";

export const DesktopNav = ({ 
  handleShare, 
  theme,
  toggleTheme 
}: { 
  handleShare: () => void;
  theme: "light" | "dark";
  toggleTheme: (checked: boolean) => void;
}) => {
  return (
    <div className="hidden md:flex items-center gap-4">
      <NavigationMenu>
        <NavigationMenuList>
          <NavItems />
          <MoreDropdown />
        </NavigationMenuList>
      </NavigationMenu>
      <AuthButtons handleShare={handleShare} />
    </div>
  );
};