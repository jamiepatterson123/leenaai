import React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MoreDropdown } from "./MoreDropdown";
import { supabase } from "@/integrations/supabase/client";
import { NavItems } from "./NavItems";
import { AuthButtons } from "./AuthButtons";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DesktopNavProps {
  handleShare: () => void;
  theme: "light" | "dark";
  toggleTheme: (checked: boolean) => void;
  handleSignOut: () => Promise<void>;
}

export const DesktopNav = ({ 
  handleShare, 
  theme,
  toggleTheme,
  handleSignOut
}: DesktopNavProps) => {
  const [session, setSession] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="hidden md:flex items-center gap-4">
      <NavigationMenu>
        <NavigationMenuList>
          <NavItems />
          <MoreDropdown />
        </NavigationMenuList>
      </NavigationMenu>
      <AuthButtons handleShare={handleShare} session={session} handleSignOut={handleSignOut} />
    </div>
  );
};