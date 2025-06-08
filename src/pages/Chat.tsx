
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, MessageCircle, Plus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChatSidebar } from "@/components/chat/ChatSidebar";

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
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { session } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Load conversation messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadConversationMessages(currentConversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadConversationMessages = async (conversationId: string) => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.created_at)
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      toast.error('Failed to load conversation');
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading || !session?.user?.id) return;
    
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
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: content,
          userId: session.user.id,
          conversationId: currentConversationId
        }
      });
      
      if (error) throw error;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update current conversation ID if this was a new chat
      if (!currentConversationId && data.conversationId) {
        setCurrentConversationId(data.conversationId);
      }
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
    <div className="h-[calc(100vh-8rem)] flex bg-background overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        currentConversationId={currentConversationId}
        onConversationSelect={handleConversationSelect}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with mobile menu button */}
        <div className="flex items-center justify-between p-4 border-b border-border md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          <h1 className="font-semibold">Leena.ai Chat</h1>
          <div></div>
        </div>

        {/* Chat content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            /* Welcome screen - centered content */
            <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
              <div className="w-full max-w-2xl text-center">
                <h1 className="text-3xl font-bold mb-2">What can I help with?</h1>
                <p className="text-muted-foreground">Ask me about your nutrition, meals, or health goals</p>
                <div className="mt-8 text-sm text-muted-foreground">
                  <p><kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">O</kbd> for new chat</p>
                </div>
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
                            <p className="whitespace-pre-wrap">{message.content}</p>
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
    </div>
  );
};

export default Chat;
