
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useRef } from "react";

interface CameraButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const CameraButton = ({ onFileSelect, disabled = false }: CameraButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = '';  // Reset the input to allow selecting the same file again
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Button 
        onClick={handleCameraClick}
        size="lg"
        className="w-full flex items-center justify-center gap-2"
        disabled={disabled}
      >
        <Camera className="w-5 h-5" />
        Take Food Photo
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
};
