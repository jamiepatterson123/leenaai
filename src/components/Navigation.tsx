import React from "react";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

export const Navigation = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState(null);
  const [session, setSession] = useState<Session | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const selectedDate = new Date();

  useEffect(() => {
    const initSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        toast.error("Session error");
        navigate("/auth");
        return;
      }
      setSession(session);
      
      if (!session) {
        navigate("/auth");
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleShare = () => {
    // Implement share functionality
  };

  const theme = "light" as const;
  const toggleTheme = (checked: boolean) => {
    // Implement theme toggle functionality
  };

  const handleFileSelect = async (file: File) => {
    if (!file) {
      toast.error("No file selected");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setAnalyzing(true);

    setTimeout(() => {
      const imageAnalysisSection = document.querySelector('[data-image-analysis]');
      if (imageAnalysisSection && 'handleImageSelect' in imageAnalysisSection) {
        (imageAnalysisSection as any).handleImageSelect(file);
      } else {
        console.error("Image analysis section not found");
        toast.error("Failed to analyze image");
        setAnalyzing(false);
      }
    }, 100);
  };

  // Only render navigation when there's a valid session
  if (!session) return null;

  return (
    <div className="border-b">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <h1 className="text-2xl font-bold text-primary">Leena.ai</h1>
        <DesktopNav 
          handleShare={handleShare}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <MobileNav 
          onAddClick={() => {}} 
          onFileSelect={handleFileSelect}
        />
      </div>
    </div>
  );
};