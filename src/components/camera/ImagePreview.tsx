import React from "react";
import { Upload } from "lucide-react";

interface ImagePreviewProps {
  preview: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  preview,
  onImageUpload,
}) => {
  return (
    <label
      htmlFor="image-upload"
      className="relative block w-full h-64 border-2 border-dashed border-primary rounded-lg cursor-pointer hover:border-primary/80 transition-colors"
    >
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageUpload}
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
  );
};