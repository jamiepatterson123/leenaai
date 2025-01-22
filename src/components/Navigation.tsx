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

    // If we're not on the home page, navigate there first
    if (window.location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setAnalyzing(true);

    try {
      // Find the image analysis section in the DOM
      const maxAttempts = 5;
      let attempts = 0;
      let imageAnalysisSection;

      while (attempts < maxAttempts) {
        imageAnalysisSection = document.querySelector('[data-image-analysis]');
        if (imageAnalysisSection && 'handleImageSelect' in imageAnalysisSection) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (imageAnalysisSection && 'handleImageSelect' in imageAnalysisSection) {
        await (imageAnalysisSection as any).handleImageSelect(file);
      } else {
        console.error("Image analysis section not found after multiple attempts");
        toast.error("Failed to analyze image. Please try again.");
        setAnalyzing(false);
      }
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
        />
      </div>
    </div>
  );
};