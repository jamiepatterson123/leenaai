import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, UtensilsCrossed, LogOut, Key, UserRound, Send, ClipboardList, Menu, UserCheck, Plug, GraduationCap, MessageSquare, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Navigation = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleShare = () => {
    try {
      const instagramUrl = `https://www.instagram.com/create/story?url=${encodeURIComponent(window.location.origin)}`;
      window.open(instagramUrl, '_blank');
      toast.success("Opening Instagram Stories...");
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("Couldn't open Instagram Stories. Please try again.");
    }
  };

  const toggleTheme = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", checked);
  };

  if (!isAuthenticated) {
    return null;
  }

  const mainNavigationItems = [
    { icon: Home, text: "Home", to: "/" },
    { icon: UtensilsCrossed, text: "Nutrition", to: "/food-diary" },
    { icon: UserRound, text: "Biometrics", to: "/profile" },
    { icon: ClipboardList, text: "Reports", to: "/reports" },
    { icon: UserCheck, text: "Coach", to: "/coach" },
  ];

  const dropdownItems = [
    { icon: Plug, text: "Integrations", to: "/integrations" },
    { icon: GraduationCap, text: "Learn", to: "/learn" },
    { icon: MessageSquare, text: "Community", to: "/community" },
  ];

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4">
          {mainNavigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 p-2 hover:bg-accent rounded-md"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.text}</span>
            </Link>
          ))}
          {dropdownItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 p-2 hover:bg-accent rounded-md"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.text}</span>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="border-b mb-6">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <MobileMenu />
          <NavigationMenu className="hidden md:block">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      More
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {dropdownItems.map((item) => (
                      <DropdownMenuItem key={item.to} asChild>
                        <Link to={item.to} className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          {item.text}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
            <Link to="/api-settings">
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
              >
                <Key className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Light</span>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-sm text-muted-foreground">Dark</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-gray-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};