import React, { useState } from "react";
import { Home, BookOpen, Plus, MessageSquare, User, Camera, Scale } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { WeightInput } from "@/components/WeightInput";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CameraButton } from "@/components/home/CameraButton";

export const MobileNav = () => {
  const location = useLocation();
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"food" | "weight">("food");
  
  const isActive = (path: string) => {
    return location.pathname === path ? "text-primary" : "text-muted-foreground";
  };

  const handleHelpClick = () => {
    if (typeof window !== 'undefined' && window.Tawk_API) {
      window.Tawk_API.toggle();
    }
  };

  const { data: apiKey } = useQuery({
    queryKey: ["openai-api-key"],
    queryFn: async () => {
      const savedKey = localStorage.getItem("openai_api_key");
      if (savedKey) {
        return savedKey;
      }

      const { data, error } = await supabase
        .from("secrets")
        .select("value")
        .eq("name", "OPENAI_API_KEY")
        .maybeSingle();

      if (error) {
        toast.error("Error fetching API key");
        throw error;
      }

      if (!data) {
        toast.error("Please set your OpenAI API key in API Settings first");
        return null;
      }

      return data.value;
    },
  });

  const handleFileSelect = (file: File) => {
    const event = new CustomEvent('imageSelected', { detail: file });
    window.dispatchEvent(event);
    setSelectedTab("food");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-50">
      <nav className="flex items-center justify-between px-6 h-16">
        <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link to="/food-diary" className={`flex flex-col items-center ${isActive('/food-diary')}`}>
          <BookOpen className="h-6 w-6" />
          <span className="text-xs mt-1">Diary</span>
        </Link>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="flex flex-col items-center -mt-8 relative">
            <div className="bg-primary rounded-full p-4">
              <Plus className="h-6 w-6 text-primary-foreground" />
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] h-[100dvh] p-0 gap-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Add Entry</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col h-full p-6 pt-2 gap-4">
              {selectedTab === "food" ? (
                <>
                  <CameraButton onFileSelect={handleFileSelect} />
                  {nutritionData && (
                    <ImageAnalysisSection
                      apiKey={apiKey}
                      analyzing={analyzing}
                      setAnalyzing={setAnalyzing}
                      nutritionData={nutritionData}
                      setNutritionData={setNutritionData}
                      selectedDate={new Date()}
                      onSuccess={() => setDialogOpen(false)}
                    />
                  )}
                </>
              ) : (
                <WeightInput onSuccess={() => setDialogOpen(false)} />
              )}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <button
                  onClick={() => setSelectedTab("food")}
                  className={`flex flex-col items-center justify-center p-8 rounded-lg border-2 ${
                    selectedTab === "food" ? "border-primary" : "border-muted"
                  }`}
                >
                  <Camera className="h-8 w-8 mb-2" />
                  <span className="font-medium">Add Food</span>
                </button>
                <button
                  onClick={() => setSelectedTab("weight")}
                  className={`flex flex-col items-center justify-center p-8 rounded-lg border-2 ${
                    selectedTab === "weight" ? "border-primary" : "border-muted"
                  }`}
                >
                  <Scale className="h-8 w-8 mb-2" />
                  <span className="font-medium">Weigh In</span>
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <button 
          onClick={handleHelpClick}
          className="flex flex-col items-center text-muted-foreground"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs mt-1">Help</span>
        </button>
        
        <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile')}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
};
