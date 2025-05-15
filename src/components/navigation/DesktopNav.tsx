
import React, { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MoreDropdown } from "./MoreDropdown";
import { supabase } from "@/integrations/supabase/client";
import { NavItems } from "./NavItems";
import { AuthButtons } from "./AuthButtons";
import { motion } from "framer-motion";

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
  const [scrolled, setScrolled] = useState(false);
    
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

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
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`hidden md:flex items-center gap-4 transition-all duration-200 ${
        scrolled ? "py-2" : "py-3"
      }`}
    >
      <NavigationMenu>
        <NavigationMenuList>
          <NavItems />
          <MoreDropdown />
        </NavigationMenuList>
      </NavigationMenu>
      <AuthButtons handleShare={handleShare} session={session} />
    </motion.div>
  );
};
