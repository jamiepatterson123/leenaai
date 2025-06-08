import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}
const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    session
  } = useSession();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: userMessage.content,
          userId: session?.user?.id
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
    setInput(question);
  };
  const quickQuestions = [{
    title: "Daily nutrition",
    subtitle: "How did I do today?",
    question: "How did I do today with my nutrition goals?"
  }, {
    title: "Meal suggestions",
    subtitle: "What should I eat next?",
    question: "What should I eat for my next meal based on my goals?"
  }, {
    title: "Weekly progress",
    subtitle: "Show my weekly progress",
    question: "Show me my nutrition progress for this week"
  }, {
    title: "Macro balance",
    subtitle: "Optimize my macros",
    question: "How can I better balance my macronutrients?"
  }];
  return <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (/* Welcome screen */
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">What can I help with?</h1>
                <p className="text-muted-foreground">Ask me about your nutrition, meals, or health goals</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {quickQuestions.map((item, index) => <button key={index} onClick={() => handleQuickQuestion(item.question)} className="p-4 text-left border border-border/40 rounded-xl hover:bg-accent/50 transition-colors">
                    <div className="font-medium text-sm mb-1">{item.title}</div>
                    <div className="text-muted-foreground text-sm">{item.subtitle}</div>
                  </button>)}
              </div>
            </div>
          </div>) : (/* Chat messages */
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
            <div className="max-w-3xl mx-auto py-4">
              <div className="space-y-6">
                {messages.map(message => <div key={message.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent">
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="font-medium text-sm">
                        {message.role === 'user' ? 'You' : 'Leena.ai'}
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>)}
                
                {isLoading && <div className="flex gap-4">
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
                  </div>}
              </div>
            </div>
          </ScrollArea>)}

        {/* Input area */}
        <div className="border-t border-border/40 p-4 bg-background/95 backdrop-blur">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask anything..." disabled={isLoading} className="pr-12 min-h-[48px] resize-none" />
                <Button onClick={sendMessage} disabled={isLoading || !input.trim()} variant="gradient" size="icon" className="absolute right-1 top-1 h-10 w-10">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Chat;