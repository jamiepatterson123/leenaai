
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AnalyzeImageOptions {
  setNutritionData: (data: any) => void;
  saveFoodEntries: (foods: any[]) => Promise<void>;
}

// Helper function to convert image to supported format
const convertImageToJPEG = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const base64Data = result.split(',')[1];
              resolve(base64Data);
            };
            reader.onerror = () => reject(new Error('Failed to convert image'));
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('Failed to convert image to blob'));
          }
        }, 'image/jpeg', 0.8);
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Single image analysis (legacy support)
export const analyzeImage = async (
  image: File,
  { setNutritionData }: AnalyzeImageOptions
) => {
  return analyzeImages([image], { setNutritionData, saveFoodEntries: async () => {} });
};

// Multi-image analysis
export const analyzeImages = async (
  images: File[],
  { setNutritionData }: AnalyzeImageOptions
) => {
  try {
    console.log(`Starting analysis of ${images.length} image(s)...`);
    
    // Validate images
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!image.type.startsWith('image/')) {
        throw new Error(`File ${i + 1} is not a valid image file`);
      }
      
      if (image.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error(`Image ${i + 1} is too large. Please select images under 10MB.`);
      }
    }
    
    // Convert images to base64 (with format conversion if needed)
    const base64Images = await Promise.all(
      images.map(async (image, index) => {
        try {
          // Check if image format is supported by OpenAI
          const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
          
          if (supportedFormats.includes(image.type.toLowerCase())) {
            // Direct conversion for supported formats
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                const base64Data = result.split(',')[1];
                resolve(base64Data);
              };
              reader.onerror = () => reject(new Error(`Failed to read image ${index + 1}`));
              reader.readAsDataURL(image);
            });
          } else {
            // Convert unsupported formats (AVIF, HEIC, etc.) to JPEG
            console.log(`Converting image ${index + 1} from ${image.type} to JPEG`);
            return await convertImageToJPEG(image);
          }
        } catch (error) {
          console.error(`Error processing image ${index + 1}:`, error);
          throw new Error(`Failed to process image ${index + 1}: ${error.message}`);
        }
      })
    );

    console.log(`Images converted to base64, calling analyze-food function...`);

    const { data, error } = await supabase.functions.invoke('analyze-food', {
      body: { 
        images: base64Images.length > 1 ? base64Images : undefined,
        image: base64Images.length === 1 ? base64Images[0] : undefined
      }
    });

    if (error) {
      console.error("Error calling analyze-food function:", error);
      // Check if it's a deployment/configuration issue
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        throw new Error('Image analysis service is not available. Please try again later.');
      }
      throw new Error(error.message || 'Failed to analyze images');
    }

    console.log("Analysis result:", data);
    
    if (!data) {
      throw new Error('No response from analysis service');
    }
    
    if (!data.foods || !Array.isArray(data.foods)) {
      throw new Error('Invalid response format: missing foods array');
    }
    
    if (data.foods.length === 0) {
      throw new Error('No food items detected in the images. Please try clearer photos with visible food items.');
    }

    // Add metadata about the analysis
    const enrichedData = {
      ...data,
      analysis_type: images.length > 1 ? 'multi_angle' : 'single_image',
      image_count: images.length,
      confidence_boost: images.length > 1 ? 0.15 : 0 // 15% confidence boost for multi-angle
    };

    setNutritionData(enrichedData);
    return enrichedData;
  } catch (error) {
    console.error("Error in analyzeImages:", error);
    throw error;
  }
};
