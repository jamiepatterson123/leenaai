import React, { useState } from "react";
import { Send, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const Coach = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI nutrition coach. I can analyze your nutrition data and help you reach your goals. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const playAudio = async (text: string) => {
    try {
      setIsPlaying(true);
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });

      if (response.error) throw response.error;

      // Create and play audio
      const audio = new Audio(`data:audio/mpeg;base64,${response.data.audio}`);
      setAudioElement(audio);
      
      audio.onended = () => {
        setIsPlaying(false);
        setAudioElement(null);
      };

      audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error("Couldn't play audio. Please try again.");
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      setAudioElement(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to use the AI coach");
        return;
      }

      // Add user message
      const userMessage = { role: "user" as const, content: input.trim() };
      setMessages(prev => [...prev, userMessage]);
      setInput("");

      // Show thinking message
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm thinking..."
      }]);

      // Call AI coach function
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { message: input.trim(), userId: user.id }
      });

      if (error) throw error;

      // Remove thinking message and add AI response
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop(); // Remove thinking message
        return [...newMessages, {
          role: "assistant",
          content: data.response
        }];
      });

    } catch (error) {
      console.error('Error in AI coach:', error);
      // Remove thinking message if there was an error
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop(); // Remove thinking message
        return newMessages;
      });
      toast.error("Sorry, I couldn't process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 h-[calc(100vh-120px)] flex flex-col text-white">
      <div className="flex-1 space-y-4 mb-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-full",
                  message.role === "assistant" ? "justify-start" : "justify-end"
                )}
              >
                <div className="flex flex-col gap-2">
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[80%] break-words text-white",
                      message.role === "assistant" 
                        ? "bg-muted" 
                        : "bg-primary",
                      message.content === "I'm thinking..." && "animate-pulse"
                    )}
                  >
                    {message.content}
                  </div>
                  {message.role === "assistant" && message.content !== "I'm thinking..." && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="self-start"
                          onClick={() => isPlaying ? stopAudio() : playAudio(message.content)}
                        >
                          {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isPlaying 
                            ? "Stop audio playback" 
                            : "Listen to this response"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2 pb-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Please wait..." : "Ask your nutrition coach..."}
          className="flex-1 text-white placeholder:text-white/70"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default Coach;