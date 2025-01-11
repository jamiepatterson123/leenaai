import React, { useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageSelect: (image: File) => void;
  resetPreview?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, resetPreview }) => {
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
    <div className="w-full mx-auto border border-gray-200 dark:border-gray-800 rounded-lg">
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
              <Upload className="mx-auto h-10 w-10 text-primary" strokeWidth={1} />
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