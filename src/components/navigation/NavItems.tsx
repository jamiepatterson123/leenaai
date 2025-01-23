import React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export const NavItems = () => {
  const items = [
    { href: "/", label: "Home" },
    { href: "/food-diary", label: "Food Diary" },
    { href: "/reports", label: "Reports" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <NavigationMenuList>
      {items.map(({ href, label }) => (
        <NavigationMenuItem key={href}>
          <NavigationMenuLink asChild>
            <Link
              to={href}
              className={cn(
                "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
              )}
            >
              {label}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      ))}
    </NavigationMenuList>
  );
};