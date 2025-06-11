import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
  const [hasStarted, setHasStarted] = useState(false);
  const [consultationCompleted, setConsultationCompleted] = useState(false);
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [dataSaved, setDataSaved] = useState(false);
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

  useEffect(() => {
    checkConsultationCompletion();
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
        setHasStarted(messagesWithDates.length > 0);
      } catch (error) {
        console.error('Failed to load saved consultation messages:', error);
        localStorage.removeItem(CONSULTATION_STORAGE_KEY);
      }
    }
    if (savedThreadId) {
      setThreadId(savedThreadId);
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

  // Auto-focus input when consultation starts
  useEffect(() => {
    if (hasStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasStarted]);

  const checkConsultationCompletion = () => {
    if (messages.length < 6) return; // Need at least a few exchanges

    const lastFewMessages = messages.slice(-3);
    const hasCompletionIndicators = lastFewMessages.some(msg => 
      msg.role === 'assistant' && (
        msg.content.toLowerCase().includes('consultation complete') ||
        msg.content.toLowerCase().includes('thank you for sharing') ||
        msg.content.toLowerCase().includes('personalized plan') ||
        msg.content.toLowerCase().includes('summary of our consultation') ||
        msg.content.toLowerCase().includes('based on everything you')
      )
    );

    if (hasCompletionIndicators && !consultationCompleted) {
      setConsultationCompleted(true);
      setShowCompleteButton(true);
      if (!dataSaved) {
        extractAndSaveInsights();
      }
    }
  };

  const extractAndSaveInsights = async () => {
    if (!session?.user?.id || dataSaved) return;

    setDataSaved(true); // Prevent multiple saves

    try {
      // Use OpenAI to extract structured insights from the conversation
      const conversationText = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
      
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: `Please analyze this nutrition consultation conversation and extract key insights in the following JSON format:
          {
            "primaryGoals": ["goal1", "goal2"],
            "challenges": ["challenge1", "challenge2"],
            "preferences": ["preference1", "preference2"],
            "currentHabits": ["habit1", "habit2"],
            "recommendations": ["rec1", "rec2"],
            "timeConstraints": "description",
            "experience_level": "beginner/intermediate/advanced",
            "motivation_factors": ["factor1", "factor2"],
            "barriers": ["barrier1", "barrier2"],
            "summary": "brief summary of consultation"
          }
          
          Conversation:
          ${conversationText}`,
          userId: session.user.id,
          threadId: null,
          consultationMode: false,
          extractInsights: true
        }
      });

      if (error) throw error;

      let insights;
      try {
        insights = JSON.parse(data.response);
      } catch {
        // If parsing fails, create a basic structure
        insights = {
          summary: data.response,
          consultation_date: new Date().toISOString()
        };
      }

      // Save insights to user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          consultation_completed: true,
          consultation_insights: insights,
          consultation_completed_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id);

      if (updateError) {
        console.error('Error saving consultation insights:', updateError);
        setDataSaved(false); // Allow retry
      } else {
        toast.success("Consultation insights saved! Your AI coach will now provide more personalized guidance.");
      }

    } catch (error) {
      console.error('Error extracting consultation insights:', error);
      setDataSaved(false); // Allow retry
    }
  };

  const completeConsultation = () => {
    setMessages([]);
    setThreadId(null);
    setHasStarted(false);
    setConsultationCompleted(false);
    setShowCompleteButton(false);
    setDataSaved(false);
    localStorage.removeItem(CONSULTATION_STORAGE_KEY);
    localStorage.removeItem(CONSULTATION_THREAD_KEY);
    toast.success("Consultation completed! You can start a new one anytime.");
  };

  const clearConsultation = () => {
    setMessages([]);
    setThreadId(null);
    setHasStarted(false);
    setConsultationCompleted(false);
    setShowCompleteButton(false);
    setDataSaved(false);
    localStorage.removeItem(CONSULTATION_STORAGE_KEY);
    localStorage.removeItem(CONSULTATION_THREAD_KEY);
    toast.success("Consultation cleared successfully");
  };

  const startConsultation = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setHasStarted(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: "Start nutrition consultation",
          userId: session?.user?.id,
          threadId: null,
          consultationMode: true
        }
      });
      if (error) {
        throw error;
      }

      if (data.threadId) {
        setThreadId(data.threadId);
      }
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([assistantMessage]);
    } catch (error) {
      console.error('Error starting consultation:', error);
      toast.error("Failed to start consultation. Please try again.");
      setHasStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content) return;
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content,
      role: 'user',
      timestamp: new Date()
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
          consultationMode: true
        }
      });
      if (error) {
        throw error;
      }

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
      {/* Header with Clear Consultation button - only show when consultation has started */}
      {hasStarted && (
        <div className="flex-shrink-0 border-b border-border/40 px-4 py-3 bg-background/95 backdrop-blur">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Nutrition Consultation</span>
              {consultationCompleted && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Completed
                </span>
              )}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Consultation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Consultation History</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all messages in this consultation and start over. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearConsultation} className="bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] text-white hover:opacity-90">
                    Clear & Restart
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!hasStarted ? (
          /* Welcome screen - centered content like chat page */
          <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
            <div className="w-full max-w-2xl text-center">
              <h1 className="text-3xl font-bold mb-2">Nutrition Consultation</h1>
              <p className="text-muted-foreground mb-6">Let's have a personalized consultation to understand your goals, challenges, and create a plan that works for you. Takes ~3 minutes.</p>
              <div className="flex justify-center">
                <button 
                  onClick={startConsultation} 
                  disabled={isLoading} 
                  className="px-6 py-3 text-sm border border-border/40 rounded-full hover:bg-accent/50 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Starting..." : "Let's get started"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Chat messages - scrollable area with left padding like chat page */
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
                  
                  {/* Complete Consultation Button */}
                  {showCompleteButton && (
                    <div className="flex justify-center py-4">
                      <Button 
                        onClick={completeConsultation}
                        variant="gradient"
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete Consultation
                      </Button>
                    </div>
                  )}
                  
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
        )}
      </div>

      {/* Input area - only show when consultation has started and not completed */}
      {hasStarted && !showCompleteButton && (
        <div className="flex-shrink-0 border-t border-border/40 p-4 bg-background/95 backdrop-blur">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Input 
                ref={inputRef} 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyPress={handleKeyPress} 
                placeholder="Type your answer..." 
                disabled={isLoading} 
                className="w-full min-h-[48px] pr-12" 
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
      )}
    </div>
  );
};

export default NutritionConsultation;
