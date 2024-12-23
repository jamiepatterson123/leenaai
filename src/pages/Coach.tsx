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
  suggestions?: string[];
}

const defaultSuggestions = [
  "What should I eat before a workout?",
  "How can I increase my protein intake?",
  "What are good post-workout snacks?",
  "How many calories should I eat?"
];

const Coach = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI nutrition coach. I can analyze your nutrition data and help you reach your goals. What would you like to know?",
      suggestions: defaultSuggestions
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      setInput(suggestion);
      handleSubmit(suggestion);
    }
  };

  const handleSubmit = async (messageText: string | React.FormEvent) => {
    if (typeof messageText !== 'string') {
      messageText = input;
      messageText.preventDefault();
    }
    
    if (!messageText.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to use the AI coach");
        return;
      }

      // Add user message
      const userMessage = { role: "user" as const, content: messageText.trim() };
      setMessages(prev => [...prev, userMessage]);
      setInput("");

      // Show thinking message
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm thinking..."
      }]);

      // Call AI coach function
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { 
          message: messageText.trim(), 
          userId: user.id,
          generateSuggestions: true // Add this flag to request suggestions
        }
      });

      if (error) throw error;

      // Remove thinking message and add AI response with new suggestions
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop(); // Remove thinking message
        return [...newMessages, {
          role: "assistant",
          content: data.response,
          suggestions: data.suggestions || defaultSuggestions // Use provided suggestions or fall back to defaults
        }];
      });

    } catch (error) {
      console.error('Error in AI coach:', error);
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

  // Get the latest suggestions from the last assistant message
  const currentSuggestions = messages
    .filter(m => m.role === "assistant" && m.suggestions)
    .slice(-1)[0]?.suggestions || defaultSuggestions;

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
      
      {/* Suggestions Section */}
      <div className="flex flex-wrap gap-2 mb-4">
        {currentSuggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="secondary"
            className="text-sm"
            onClick={() => handleSuggestionClick(suggestion)}
            disabled={isLoading}
          >
            {suggestion}
          </Button>
        ))}
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