import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useRef } from "react";

interface CameraButtonProps {
  onFileSelect: (file: File) => void;
}

export const CameraButton = ({ onFileSelect }: CameraButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <Camera className="h-12 w-12 text-primary mb-4" strokeWidth={1} />
        <h3 className="text-lg font-semibold mb-4">Upload Food Photo</h3>
        <div className="w-full max-w-xs">
          <Button 
            onClick={handleCameraClick}
            className="w-full text-white bg-green-600 hover:bg-green-700 transition-all duration-200"
          >
            Take Photo
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};