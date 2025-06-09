
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Check, Eye, RotateCw } from "lucide-react";
import { toast } from "sonner";

interface CapturedPhoto {
  file: File;
  preview: string;
  angle: string;
}

interface MultiPhotoCaptureProps {
  onPhotosCapture: (photos: File[]) => void;
  isAnalyzing?: boolean;
}

const PHOTO_ANGLES = [
  { key: 'top', label: 'Top-down view', icon: Eye, description: 'Take a photo directly from above' },
  { key: 'side', label: 'Side view', icon: RotateCw, description: 'Take a photo from the side to show height' },
  { key: 'angle', label: 'Angled view', icon: Camera, description: 'Take a photo from a 45-degree angle' }
];

export const MultiPhotoCapture = ({ onPhotosCapture, isAnalyzing = false }: MultiPhotoCaptureProps) => {
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [currentAngle, setCurrentAngle] = useState(0);
  
  const handlePhotoCapture = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhoto: CapturedPhoto = {
        file,
        preview: reader.result as string,
        angle: PHOTO_ANGLES[currentAngle].key
      };
      
      setCapturedPhotos(prev => [...prev, newPhoto]);
      
      if (currentAngle < PHOTO_ANGLES.length - 1) {
        setCurrentAngle(currentAngle + 1);
        toast.success(`${PHOTO_ANGLES[currentAngle].label} captured! Now take ${PHOTO_ANGLES[currentAngle + 1].label.toLowerCase()}`);
      } else {
        toast.success("All photos captured! Ready to analyze.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = () => {
    if (capturedPhotos.length === 0) {
      toast.error("Please capture at least one photo");
      return;
    }
    
    onPhotosCapture(capturedPhotos.map(photo => photo.file));
  };

  const handleReset = () => {
    setCapturedPhotos([]);
    setCurrentAngle(0);
  };

  const removePhoto = (index: number) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
    if (capturedPhotos.length <= currentAngle) {
      setCurrentAngle(Math.max(0, capturedPhotos.length - 2));
    }
  };

  const CurrentAngleIcon = PHOTO_ANGLES[currentAngle]?.icon || Camera;

  return (
    <div className="w-full mx-auto bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Multi-Angle Food Analysis</h3>
        <p className="text-sm text-gray-600 mb-4">
          Take photos from different angles for more accurate nutrition estimates (up to 90% accuracy)
        </p>
        
        {/* Angle Guide */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {PHOTO_ANGLES.map((angle, index) => {
            const Icon = angle.icon;
            const isCaptured = capturedPhotos.some(photo => photo.angle === angle.key);
            const isCurrent = index === currentAngle && !isCaptured;
            
            return (
              <div
                key={angle.key}
                className={`p-2 rounded-lg border text-center ${
                  isCaptured 
                    ? 'bg-green-50 border-green-200' 
                    : isCurrent 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-center mb-1">
                  {isCaptured ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`} />
                  )}
                </div>
                <p className={`text-xs font-medium ${
                  isCaptured ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'
                }`}>
                  {angle.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Current instruction */}
        {currentAngle < PHOTO_ANGLES.length && capturedPhotos.length < PHOTO_ANGLES.length && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <CurrentAngleIcon className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-700">
                Next: {PHOTO_ANGLES[currentAngle].label}
              </span>
            </div>
            <p className="text-sm text-blue-600">
              {PHOTO_ANGLES[currentAngle].description}
            </p>
          </div>
        )}
      </div>

      {/* Photo capture */}
      <div className="space-y-4">
        {capturedPhotos.length < PHOTO_ANGLES.length && (
          <label className="block">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handlePhotoCapture(file);
                  e.target.value = '';
                }
              }}
              disabled={isAnalyzing}
            />
            <Button 
              type="button"
              className="w-full"
              disabled={isAnalyzing}
              asChild
            >
              <span className="cursor-pointer">
                <Camera className="w-4 h-4 mr-2" />
                {capturedPhotos.length === 0 
                  ? 'Take First Photo' 
                  : `Take ${PHOTO_ANGLES[currentAngle]?.label || 'Next Photo'}`
                }
              </span>
            </Button>
          </label>
        )}

        {/* Captured photos preview */}
        {capturedPhotos.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Captured Photos ({capturedPhotos.length})</h4>
            <div className="grid grid-cols-3 gap-2">
              {capturedPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo.preview}
                    alt={`${photo.angle} view`}
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    disabled={isAnalyzing}
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-lg">
                    {PHOTO_ANGLES.find(a => a.key === photo.angle)?.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {capturedPhotos.length > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex-1"
              variant="gradient"
            >
              {isAnalyzing ? 'Analyzing...' : `Analyze ${capturedPhotos.length} Photo${capturedPhotos.length > 1 ? 's' : ''}`}
            </Button>
            <Button
              onClick={handleReset}
              disabled={isAnalyzing}
              variant="outline"
            >
              Reset
            </Button>
          </div>
        )}

        {/* Single photo option */}
        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 mb-2">Or take just one photo (70-80% accuracy)</p>
          <label className="block">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onPhotosCapture([file]);
                  e.target.value = '';
                }
              }}
              disabled={isAnalyzing}
            />
            <Button 
              type="button"
              variant="outline"
              className="w-full"
              disabled={isAnalyzing}
              asChild
            >
              <span className="cursor-pointer">
                <Camera className="w-4 h-4 mr-2" />
                Take Single Photo
              </span>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
};
