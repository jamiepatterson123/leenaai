
import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MessageContent from "@/components/MessageContent";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const CONSULTATION_STORAGE_KEY = 'leena-consultation-messages';
const CONSULTATION_THREAD_KEY = 'leena-consultation-thread-id';

const NutritionConsultation = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const { session } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages and thread ID from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(CONSULTATION_STORAGE_KEY);
    const savedThreadId = localStorage.getItem(CONSULTATION_THREAD_KEY);
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to load saved consultation messages:', error);
        localStorage.removeItem(CONSULTATION_STORAGE_KEY);
      }
    }

    if (savedThreadId) {
      setThreadId(savedThreadId);
    }

    // If no saved messages, start with the first consultation question
    if (!savedMessages || JSON.parse(savedMessages).length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: "Hello! I'm here to help you with a personalized nutrition consultation. Let's start with understanding your goals.\n\n**What is your number 1 nutrition or health goal right now?**",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CONSULTATION_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Save thread ID to localStorage whenever it changes
  useEffect(() => {
    if (threadId) {
      localStorage.setItem(CONSULTATION_THREAD_KEY, threadId);
    }
  }, [threadId]);

  // Auto-focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const clearConsultation = () => {
    setMessages([]);
    setThreadId(null);
    localStorage.removeItem(CONSULTATION_STORAGE_KEY);
    localStorage.removeItem(CONSULTATION_THREAD_KEY);
    
    // Restart with the initial question
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: "Hello! I'm here to help you with a personalized nutrition consultation. Let's start with understanding your goals.\n\n**What is your number 1 nutrition or health goal right now?**",
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    toast.success("Consultation cleared successfully");
  };

  const sendMessage = async () => {
    const content = input.trim();
    
    if (!content) return;
    if (isLoading) return;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: content,
          userId: session?.user?.id,
          threadId: threadId,
          consultationMode: true // Special flag for consultation
        }
      });

      if (error) {
        throw error;
      }

      // Update thread ID if we got a new one
      if (data.threadId && data.threadId !== threadId) {
        setThreadId(data.threadId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending consultation message:', error);
      toast.error("Failed to send message. Please try again.");
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble responding right now. Please try again later.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-background overflow-hidden">
      {/* Header with Clear Consultation button */}
      {messages.length > 1 && (
        <div className="flex-shrink-0 border-b border-border/40 px-4 py-3 bg-background/95 backdrop-blur">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Nutrition Consultation</span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Consultation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Consultation History</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all messages in this consultation. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearConsultation} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] text-white hover:opacity-90">
                    Clear Consultation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 pl-8 pr-4 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col py-4">
          <ScrollArea className="flex-1">
            <div className="space-y-4 pr-4">
              {messages.map(message => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'user' ? (
                    <div className="max-w-[80%] bg-muted text-foreground px-4 py-2 rounded-2xl rounded-br-sm">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ) : (
                    <div className="w-full pr-2">
                      <MessageContent content={message.content} />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-full pr-2">
                    <div className="flex space-x-1 py-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-border/40 p-4 bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer here..."
              disabled={isLoading}
              className="w-full min-h-[48px] pr-12"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              variant="gradient"
              size="icon"
              className="absolute right-1 top-1 h-10 w-10"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionConsultation;
