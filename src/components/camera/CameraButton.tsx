import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface CameraButtonProps {
  onClick: () => void;
}

export const CameraButton: React.FC<CameraButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick} className="w-full" variant="outline">
      <Camera className="w-4 h-4 mr-2" />
      Use Camera
    </Button>
  );
};