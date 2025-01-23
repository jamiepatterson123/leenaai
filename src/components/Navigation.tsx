import React from "react";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "@/hooks/useSession";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const { session, loading } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const selectedDate = new Date();

  // If there's no session or we're loading, don't render the navigation
  if (loading) return null;
  if (!session || window.location.pathname === '/welcome') return null;

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

    try {
      // Navigate to home if not already there
      if (window.location.pathname !== '/') {
        navigate('/');
      }

      // Find the image analysis section
      const imageAnalysisSection = document.querySelector('[data-image-analysis]');
      if (!imageAnalysisSection) {
        throw new Error('Image analysis section not found');
      }

      // Get the handleImageSelect function from the component
      const handleImageSelect = (imageAnalysisSection as any).handleImageSelect;
      if (!handleImageSelect) {
        throw new Error('Image analysis function not found');
      }

      // Call the image analysis function
      await handleImageSelect(file);
    } catch (error) {
      console.error("Error handling image:", error);
      toast.error("Failed to analyze image");
      setAnalyzing(false);
    }
  };

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
          analyzing={analyzing}
        />
      </div>
    </div>
  );
};