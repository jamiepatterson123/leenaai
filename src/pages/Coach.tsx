import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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