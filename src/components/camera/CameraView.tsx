import React from "react";
import { Button } from "@/components/ui/button";
import { X, Circle } from "lucide-react";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCapture: () => void;
  onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  onCapture,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera Preview */}
      <div className="relative flex-1">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Camera Controls */}
      <div className="bg-black/90 p-8">
        <div className="flex justify-center items-center">
          <Button
            size="lg"
            variant="ghost"
            className="rounded-full p-8 hover:bg-white/20"
            onClick={onCapture}
          >
            <Circle className="h-16 w-16 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};