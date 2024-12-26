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
      // First check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Your browser doesn't support camera access");
        return;
      }

      // Try to get both rear and front cameras
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          toast.error("Camera access was denied. Please allow camera access and try again.");
        } else if (err.name === 'NotFoundError') {
          toast.error("No camera found on your device");
        } else {
          toast.error("Unable to access camera: " + err.message);
        }
      } else {
        toast.error("Unable to access camera");
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) {
      toast.error("Camera not initialized");
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error("Unable to capture photo");
        return;
      }

      // Flip horizontally if using front camera
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
        } else {
          toast.error("Failed to create image file");
        }
      }, 'image/jpeg', 0.8);
    } catch (err) {
      console.error('Capture error:', err);
      toast.error("Failed to capture photo");
    }
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