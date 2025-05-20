
import React, { useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface ImageUploadProps {
  onImageSelect: (image: File) => void;
  resetPreview?: boolean;
  isAnalyzing?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, resetPreview, isAnalyzing = false }) => {
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (resetPreview) {
      setPreview(null);
    }
  }, [resetPreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onImageSelect(file);
    
    e.target.value = '';
  };

  return (
    <div className="w-full mx-auto bg-white rounded-lg border border-gray-200">
      <label
        htmlFor="image-upload"
        className="relative block w-full h-48 cursor-pointer"
      >
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          disabled={isAnalyzing}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          {preview ? (
            <div className="relative w-full h-full">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg animate-fade-in"
              />
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center rounded-lg">
                  <p className="text-white font-medium mb-2">Analysing</p>
                  <div className="w-3/4 max-w-64">
                    <Progress 
                      value={100} 
                      className="h-2 w-full overflow-hidden rounded-full bg-white/20"
                    >
                      <div className="h-full w-full flex-1 bg-gradient-to-r from-[#D946EF] to-[#9b87f5]" />
                    </Progress>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-10 w-10 text-[#D946EF]" strokeWidth={1} />
              <p className="mt-2 text-sm text-gray-600">
                Click or drag image to upload
              </p>
            </div>
          )}
        </div>
      </label>
    </div>
  );
};
