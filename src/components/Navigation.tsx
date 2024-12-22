import React, { useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { supabase } from "@/integrations/supabase/client";
import { NavigationLinks } from "./navigation/NavigationLinks";
import { NavigationActions } from "./navigation/NavigationActions";

export const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="border-b mb-6">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationLinks />
          </NavigationMenuList>
        </NavigationMenu>
        <NavigationActions />
      </div>
    </div>
  );
};