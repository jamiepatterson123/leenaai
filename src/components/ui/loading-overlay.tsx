
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { GlowEffect } from "@/components/ui/glow-effect";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingMessage = {
  text: string;
  type: 'nutrition' | 'processing' | 'tips';
};

interface LoadingOverlayProps {
  isVisible: boolean;
  onClose?: () => void;
  title?: string;
  messages?: LoadingMessage[];
  type?: 'image' | 'voice' | 'default';
  fullScreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  onClose,
  title = "Processing...",
  messages = defaultMessages,
  type = "default",
  fullScreen = false,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  useEffect(() => {
    if (!isVisible) return;
    
    // Rotate through messages every 2 seconds
    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % messages.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isVisible, messages.length]);
  
  if (!isVisible) return null;
  
  return (
    <div 
      className={cn(
        "fixed z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm transition-all duration-300",
        fullScreen ? "inset-0" : "inset-x-0 bottom-0 top-16 rounded-t-3xl"
      )}
    >
      <div className="relative w-full max-w-md p-8 text-center">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary-foreground/5 p-8">
          <GlowEffect
            colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
            mode="flowHorizontal"
            blur="soft"
            duration={3}
          />
          
          {/* Loading Icon */}
          <div className="relative z-10 mb-8">
            {type === "image" ? (
              <div className="mx-auto h-24 w-24 overflow-hidden rounded-lg">
                <Skeleton className="h-full w-full animate-pulse bg-primary/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              </div>
            ) : (
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
            )}
          </div>
          
          {/* Title */}
          <h2 className="relative z-10 mb-2 text-2xl font-bold text-gray-800">{title}</h2>
          
          {/* Rotating Messages */}
          <div className="relative z-10 h-16">
            <p className="animate-fade-in text-lg text-gray-600">
              {messages[currentMessageIndex].text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Default messages that rotate during loading
const defaultMessages: LoadingMessage[] = [
  { text: "Analyzing nutrition content...", type: "nutrition" },
  { text: "Counting calories...", type: "nutrition" },
  { text: "Calculating macros...", type: "nutrition" },
  { text: "Identifying food items...", type: "processing" },
  { text: "Processing your request...", type: "processing" },
  { text: "Almost there...", type: "processing" },
  { text: "Protein helps build muscle and repair tissue.", type: "tips" },
  { text: "Staying hydrated improves performance.", type: "tips" },
  { text: "Carbs are your body's main source of energy.", type: "tips" },
];
