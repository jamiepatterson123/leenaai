import React, { useState } from "react";
import { Upload, Camera, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface ImageUploadProps {
  onImageSelect: (image: File) => void;
  resetPreview?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, resetPreview }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Reset preview when resetPreview prop changes
  React.useEffect(() => {
    if (resetPreview) {
      setPreview(null);
    }
  }, [resetPreview]);

  // Cleanup function for camera stream
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
    
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      toast.error("Unable to access camera");
      console.error(err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
        setPreview(canvas.toDataURL('image/jpeg'));
        onImageSelect(file);
        
        // Stop the camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsCapturing(false);
      }
    }, 'image/jpeg');
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {isCapturing ? (
        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button onClick={capturePhoto} variant="secondary">
              Take Photo
            </Button>
            <Button onClick={stopCamera} variant="destructive">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <label
            htmlFor="image-upload"
            className="relative block w-full h-64 border-2 border-dashed border-primary rounded-lg cursor-pointer hover:border-primary/80 transition-colors"
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              capture="environment"
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
          {!preview && (
            <Button 
              onClick={startCamera} 
              className="w-full"
              variant="outline"
            >
              <Camera className="w-4 h-4 mr-2" />
              Use Camera
            </Button>
          )}
        </div>
      )}
    </div>
  );
};