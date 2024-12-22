import React, { useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageSelect: (image: File) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);

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
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <label
        htmlFor="image-upload"
        className="relative block w-full h-64 border-2 border-dashed border-primary rounded-lg cursor-pointer hover:border-primary/80 transition-colors"
      >
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg animate-fade-in"
            />
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-primary" />
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