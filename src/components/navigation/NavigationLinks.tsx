import { Link } from "react-router-dom";
import { Home, UtensilsCrossed, Settings, UserRound } from "lucide-react";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export const NavigationLinks = () => {
  return (
    <>
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
      <NavigationMenuItem>
        <Link to="/api-settings">
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <Settings className="w-4 h-4 mr-2" />
            API Settings
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Link to="/profile">
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <UserRound className="w-4 h-4 mr-2" />
            Profile
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
    </>
  );
};