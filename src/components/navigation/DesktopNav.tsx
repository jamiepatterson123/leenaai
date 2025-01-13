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

export const DesktopNav = ({ 
  handleShare, 
  theme,
  toggleTheme 
}: { 
  handleShare: () => void;
  theme: "light" | "dark";
  toggleTheme: (checked: boolean) => void;
}) => {
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

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out");
        return;
      }
      navigate("/welcome");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

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