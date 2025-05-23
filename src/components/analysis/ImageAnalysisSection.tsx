import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "@/components/ui/use-toast";
import { analyzeImage } from "./ImageAnalyzer";
import { saveFoodEntries } from "./FoodEntrySaver";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FoodVerificationDialog } from "./FoodVerificationDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";
import { triggerSuccessConfetti } from "@/utils/confetti";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { useAnalyzing } from "@/context/AnalyzingContext";

interface ImageAnalysisSectionProps {
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  nutritionData: any;
  setNutritionData: (data: any) => void;
  selectedDate: Date;
  onSuccess?: () => void;
}

export const ImageAnalysisSection = forwardRef<any, ImageAnalysisSectionProps>(({
  analyzing: localAnalyzing,
  setAnalyzing: setLocalAnalyzing,
  nutritionData,
  setNutritionData,
  selectedDate,
  onSuccess
}, ref) => {
  const [resetUpload, setResetUpload] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [analyzedFoods, setAnalyzedFoods] = useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const componentRef = React.useRef<HTMLDivElement>(null);
  const { analyzing: globalAnalyzing, setAnalyzing: setGlobalAnalyzing } = useAnalyzing();
  const {
    incrementUsage,
    isSubscribed,
    dailyLimitReached,
    usageCount,
    isWithinFirst24Hours,
    hoursUntilNextUse,
    redirectToCheckout,
    usageRemaining,
    FREE_USAGE_LIMIT
  } = useSubscription();

  // Update global analyzing state whenever local state changes
  useEffect(() => {
    setGlobalAnalyzing(localAnalyzing);
  }, [localAnalyzing, setGlobalAnalyzing]);

  const handleImageSelect = async (image: File) => {
    if (!image) {
      toast.error("No image selected");
      return;
    }
    console.log("handleImageSelect called with image:", image);
    if (localAnalyzing) {
      toast.error("Please wait for the current analysis to complete");
      return;
    }

    // Check if user has free uses remaining or is subscribed
    if (dailyLimitReached && !isSubscribed) {
      toast({
        title: "Usage limit reached",
        description: `You've used all ${FREE_USAGE_LIMIT} free uploads. Upgrade to premium for unlimited uploads.`,
        variant: "destructive"
      });
      setShowSubscriptionModal(true);
      return;
    }
    
    // Always set analyzing to true before starting the process
    setLocalAnalyzing(true);
    setResetUpload(false);
    
    try {
      console.log("Starting image analysis...");
      const result = await analyzeImage(image, {
        setNutritionData,
        saveFoodEntries: async () => {} // Don't save immediately
      });
      console.log("Analysis result:", result);
      if (result?.foods) {
        // Check if user has free uses remaining or is subscribed after analysis
        const canProceed = await incrementUsage();
        if (!canProceed && !isSubscribed) {
          toast({
            title: "Usage limit reached",
            description: `You've used all ${FREE_USAGE_LIMIT} free uploads. Upgrade to premium for unlimited uploads.`,
            variant: "destructive"
          });
          setShowSubscriptionModal(true);
          setLocalAnalyzing(false);
          return;
        }
        setAnalyzedFoods(result.foods);
        setShowVerification(true);
      } else {
        throw new Error("Invalid analysis result");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      const errorMessage = error instanceof Error ? error.message : "Error analyzing image";
      toast.error(errorMessage);
    } finally {
      // Only set analyzing to false if verification dialog isn't showing
      if (!showVerification) {
        setLocalAnalyzing(false);
      }
    }
  };
  
  const handleConfirmFoods = async (foods: any[]) => {
    try {
      await saveFoodEntries(foods, selectedDate);
      await queryClient.invalidateQueries({
        queryKey: ["foodDiary", format(selectedDate, "yyyy-MM-dd")]
      });
      setResetUpload(true);
      setShowVerification(false);
      setLocalAnalyzing(false);
      setNutritionData(null);
      
      // Trigger confetti animation when food is successfully logged
      triggerSuccessConfetti();
      
      toast.success("Food added to diary!");
      if (isMobile) {
        navigate("/food-diary");
      } else {
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error saving food entries:", error);
      toast.error("Failed to save food entries");
    }
  };
  
  useImperativeHandle(ref, () => ({
    handleImageSelect
  }));
  
  React.useEffect(() => {
    if (componentRef.current) {
      (componentRef.current as any).handleImageSelect = handleImageSelect;
    }
  }, []);

  // Image analysis-specific loading messages with corrected type values
  const imageAnalysisMessages = [
    { text: "Identifying food items in your photo...", type: "processing" as const },
    { text: "Calculating nutrition information...", type: "nutrition" as const },
    { text: "Measuring portion sizes...", type: "processing" as const },
    { text: "Counting calories in your meal...", type: "nutrition" as const },
    { text: "Estimating macros: protein, carbs, and fats...", type: "nutrition" as const }
  ];

  return (
    <div className={`space-y-4 ${localAnalyzing && !showVerification && isMobile ? 'hidden' : ''}`} ref={componentRef} data-image-analysis>
      <ImageUpload 
        onImageSelect={handleImageSelect} 
        resetPreview={resetUpload}
        isAnalyzing={localAnalyzing && !showVerification} 
      />

      <LoadingOverlay 
        isVisible={localAnalyzing && !showVerification && isMobile}
        type="image"
        title="Analyzing Your Food"
        messages={imageAnalysisMessages}
        fullScreen={isMobile}
      />

      <FoodVerificationDialog isOpen={showVerification} onClose={() => setShowVerification(false)} foods={analyzedFoods} onConfirm={handleConfirmFoods} />
      <SubscriptionModal open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal} />
    </div>
  );
});

ImageAnalysisSection.displayName = "ImageAnalysisSection";
