
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, MessageCircle, Plus, Trash2 } from "lucide-react";
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

const CHAT_STORAGE_KEY = 'leena-chat-messages';
const MAX_CONTEXT_MESSAGES = 12; // Last 6 exchanges (12 messages total)

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    session
  } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to load saved messages:', error);
        localStorage.removeItem(CHAT_STORAGE_KEY);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    toast.success("Chat cleared successfully");
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Get recent conversation history for context
      const currentMessages = [...messages, userMessage];
      const recentMessages = currentMessages.slice(-MAX_CONTEXT_MESSAGES).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const {
        data,
        error
      } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: content,
          userId: session?.user?.id,
          conversationHistory: recentMessages.slice(0, -1) // Exclude the current message from history
        }
      });
      if (error) {
        throw error;
      }
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
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

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const quickQuestions = [
    "How did I do today?",
    "What should I eat next?", 
    "Show my weekly progress",
    "Balance my macros better?",
    "Healthy snack ideas?",
    "Plan tomorrow's meals"
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-background overflow-hidden">
      {/* Header with Clear Chat button - only show when there are messages */}
      {messages.length > 0 && (
        <div className="flex-shrink-0 border-b border-border/40 px-4 py-3 bg-background/95 backdrop-blur">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Nutrition Coach</span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Chat
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all messages in this conversation. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearChat} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] text-white hover:opacity-90">
                    Clear Chat
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Main content area - takes remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {messages.length === 0 ? (
          /* Welcome screen - centered content */
          <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
            <div className="w-full max-w-2xl text-center">
              <h1 className="text-3xl font-bold mb-2">What can I help with?</h1>
              <p className="text-muted-foreground">Ask me about your nutrition, meals, or health goals</p>
            </div>
          </div>
        ) : (
          /* Chat messages - scrollable area */
          <div className="flex-1 px-4 overflow-hidden">
            <div className="max-w-3xl mx-auto h-full flex flex-col py-4">
              <ScrollArea className="flex-1">
                <div className="space-y-6 pr-4">
                  {messages.map(message => (
                    <div key={message.id} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent">
                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="font-medium text-sm">
                          {message.role === 'user' ? 'You' : 'Leena.ai'}
                        </div>
                        <div className="prose prose-sm max-w-none">
                          {message.role === 'user' ? (
                            <p className="whitespace-pre-wrap text-foreground">{message.content}</p>
                          ) : (
                            <MessageContent content={message.content} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="font-medium text-sm">Leena.ai</div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{
                            animationDelay: '0ms'
                          }}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{
                            animationDelay: '150ms'
                          }}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{
                            animationDelay: '300ms'
                          }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>

      {/* Suggested questions - fixed height */}
      <div className="flex-shrink-0 px-4 py-2">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                disabled={isLoading}
                className="flex-shrink-0 px-4 py-2 text-sm border border-border/40 rounded-full hover:bg-accent/50 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input area - fixed above mobile nav */}
      <div className="flex-shrink-0 border-t border-border/40 p-4 bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                disabled={isLoading}
                className="pr-12 min-h-[48px] resize-none"
              />
              <Button
                onClick={() => sendMessage()}
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
    </div>
  );
};

export default Chat;
