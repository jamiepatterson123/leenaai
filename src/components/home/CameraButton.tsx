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
    <div className="flex flex-col items-center gap-4">
      <Button 
        onClick={handleCameraClick}
        size="lg"
        className="w-full max-w-md flex items-center justify-center gap-2"
      >
        <Camera className="w-5 h-5" />
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
  );
};