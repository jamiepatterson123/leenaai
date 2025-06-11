import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, MessageCircle, Plus, Trash2, Camera, Image as ImageIcon, FileText } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MessageContent from "@/components/MessageContent";
import { useConversationalPrompts } from "@/hooks/useConversationalPrompts";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  imageAnalysis?: any;
}

const CHAT_STORAGE_KEY = 'leena-chat-messages';
const THREAD_STORAGE_KEY = 'leena-chat-thread-id';

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [promptKey, setPromptKey] = useState(0); // Add key to force re-render of prompts
  const { session } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prompts = useConversationalPrompts(messages);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages and thread ID from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    const savedThreadId = localStorage.getItem(THREAD_STORAGE_KEY);
    
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

    if (savedThreadId) {
      setThreadId(savedThreadId);
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Save thread ID to localStorage whenever it changes
  useEffect(() => {
    if (threadId) {
      localStorage.setItem(THREAD_STORAGE_KEY, threadId);
    }
  }, [threadId]);

  // Auto-focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const clearChat = () => {
    setMessages([]);
    setThreadId(null);
    setPromptKey(prev => prev + 1); // Reset prompts when clearing chat
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(THREAD_STORAGE_KEY);
    toast.success("Chat cleared successfully");
  };

  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Image file is too large. Please select an image under 10MB.');
      return;
    }

    setSelectedImage(file);
    setIsAttachmentOpen(false);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
    setIsAttachmentOpen(false);
  };

  const handlePhotoSelect = () => {
    fileInputRef.current?.click();
    setIsAttachmentOpen(false);
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzingImage(true);
    
    try {
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { image: base64Image }
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze image');
      }

      if (!data || !data.foods || !Array.isArray(data.foods)) {
        throw new Error('No food items detected in the image');
      }

      return data;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const sendMessage = async (messageContent?: string, imageData?: any) => {
    const content = messageContent || input.trim();
    
    if (!content && !selectedImage) return;
    if (isLoading || isAnalyzingImage) return;

    let analysisData = imageData;
    
    // If there's an image but no analysis data, analyze it first
    if (selectedImage && !analysisData) {
      try {
        analysisData = await analyzeImage(selectedImage);
      } catch (error) {
        toast.error('Failed to analyze image. Please try again.');
        return;
      }
    }

    // Create user message with image context
    let messageText = content;
    if (analysisData && analysisData.foods) {
      const foodList = analysisData.foods.map((food: any) => 
        `${food.name} (${food.weight_g}g): ${food.nutrition.calories} kcal, ${food.nutrition.protein}g protein, ${food.nutrition.carbs}g carbs, ${food.nutrition.fat}g fat`
      ).join('\n');
      
      messageText = content ? 
        `${content}\n\nI'm looking at this food: \n${foodList}` :
        `I'm looking at this food and would like advice: \n${foodList}`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      role: 'user',
      timestamp: new Date(),
      imageAnalysis: analysisData
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
    setImagePreview(null);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: messageText,
          userId: session?.user?.id,
          threadId: threadId
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
      
      // Reset prompts to first option after AI responds
      setPromptKey(prev => prev + 1);
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
    // Reset prompts immediately when user clicks a prompt
    setPromptKey(prev => prev + 1);
  };

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
              <p className="text-muted-foreground">Ask me about your nutrition, meals, or health goals. You can also upload photos of food for personalized advice!</p>
            </div>
          </div>
        ) : (
          /* Chat messages - scrollable area with left padding */
          <div className="flex-1 pl-8 pr-4 overflow-hidden">
            <div className="max-w-4xl mx-auto h-full flex flex-col py-4">
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {messages.map(message => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.role === 'user' ? (
                        // User message bubble on the right - compact padding
                        <div className="max-w-[80%] bg-muted text-foreground px-4 py-2 rounded-2xl rounded-br-sm">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      ) : (
                        // AI message on the left with full width and minimal right padding
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
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{
                            animationDelay: '0ms'
                          }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{
                            animationDelay: '150ms'
                          }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{
                            animationDelay: '300ms'
                          }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Invisible div to scroll to */}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>

      {/* Image preview section */}
      {imagePreview && (
        <div className="flex-shrink-0 px-4 py-2 border-t border-border/40">
          <div className="max-w-3xl mx-auto">
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Selected food" 
                className="h-20 w-20 object-cover rounded-lg border"
              />
              {isAnalyzingImage && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggested questions - now with key to force re-render */}
      <div className="flex-shrink-0 px-4 py-2">
        <div className="max-w-3xl mx-auto">
          <div key={promptKey} className="flex gap-2 overflow-x-auto scrollbar-hide">
            {prompts.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                disabled={isLoading || isAnalyzingImage}
                className="flex-shrink-0 px-4 py-2 text-sm border border-border/40 rounded-full hover:bg-accent/50 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input area - restructured layout */}
      <div className="flex-shrink-0 border-t border-border/40 p-4 bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Input field taking full width */}
          <div className="relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedImage ? "Ask about this food..." : "Ask anything or upload a photo..."}
              disabled={isLoading || isAnalyzingImage}
              className="w-full min-h-[48px] pr-12"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || isAnalyzingImage || (!input.trim() && !selectedImage)}
              variant="gradient"
              size="icon"
              className="absolute right-1 top-1 h-10 w-10"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Plus button centered below input */}
          <div className="flex justify-center">
            <Popover open={isAttachmentOpen} onOpenChange={setIsAttachmentOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isLoading || isAnalyzingImage}
                  className="h-10 w-10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-72 p-2">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handlePhotoSelect}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Photos</span>
                  </button>
                  <button
                    onClick={handleCameraCapture}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Camera</span>
                  </button>
                  <button
                    disabled
                    className="flex flex-col items-center gap-2 p-4 rounded-lg opacity-50 cursor-not-allowed"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">Files</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageSelect(file);
          }
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageSelect(file);
          }
        }}
      />
    </div>
  );
};

export default Chat;
