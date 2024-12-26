import React, { useState } from "react";
import { toast } from "sonner";
import { CameraView } from "./camera/CameraView";
import { ImagePreview } from "./camera/ImagePreview";
import { CameraButton } from "./camera/CameraButton";

interface ImageUploadProps {
  onImageSelect: (image: File) => void;
  resetPreview?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  resetPreview,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  React.useEffect(() => {
    if (resetPreview) {
      setPreview(null);
    }
  }, [resetPreview]);

  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
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
    e.target.value = "";
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        setIsCapturing(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          toast.error("Please allow camera access in your browser settings");
        } else if (err.name === "NotFoundError") {
          toast.error("No camera found on your device");
        } else {
          toast.error("Error accessing camera: " + err.message);
        }
      } else {
        toast.error("Unable to access camera");
      }
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      toast.error("Unable to capture photo");
      return;
    }

    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
        setPreview(canvas.toDataURL("image/jpeg"));
        onImageSelect(file);
        stopCamera();
      }
    }, "image/jpeg", 0.8);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsCapturing(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {isCapturing ? (
        <CameraView
          videoRef={videoRef}
          onCapture={capturePhoto}
          onClose={stopCamera}
        />
      ) : (
        <div className="space-y-4">
          <ImagePreview preview={preview} onImageUpload={handleImageChange} />
          {!preview && <CameraButton onClick={startCamera} />}
        </div>
      )}
    </div>
  );
};