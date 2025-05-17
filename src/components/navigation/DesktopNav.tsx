
import React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MoreDropdown } from "./MoreDropdown";
import { supabase } from "@/integrations/supabase/client";
import { NavItems } from "./NavItems";
import { AuthButtons } from "./AuthButtons";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Send, LogOut, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

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
  const { redirectToCheckout, isSubscribed } = useSubscription();

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
      navigate("/auth");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <div className="hidden md:flex items-center gap-4 justify-end">
      <NavigationMenu>
        <NavigationMenuList>
          <NavItems />
          <MoreDropdown />
        </NavigationMenuList>
      </NavigationMenu>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[250px] sm:w-[300px]">
          <div className="flex flex-col gap-4 mt-6">
            {!isSubscribed && (
              <Button 
                variant="gradient" 
                className="flex items-center justify-start gap-3" 
                onClick={redirectToCheckout}
              >
                <ArrowUp className="h-4 w-4" />
                Upgrade to Premium
              </Button>
            )}
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-3"
              onClick={handleShare}
            >
              <Send className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-3"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
