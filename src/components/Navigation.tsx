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
  const imageAnalysisSectionRef = React.useRef<any>(null);

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

      // Wait for navigation and component mount
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get the image analysis section ref from the Index page
      const indexPage = document.querySelector('[data-image-analysis]');
      if (!indexPage) {
        throw new Error('Image analysis section not found');
      }

      // Call the handleImageSelect function
      await imageAnalysisSectionRef.current?.handleImageSelect(file);
    } catch (error) {
      console.error("Error handling image:", error);
      toast.error("Failed to analyze image");
    } finally {
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