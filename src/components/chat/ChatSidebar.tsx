
import React, { useState, useEffect } from "react";
import { Plus, MessageSquare, Trash2, Edit3, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
}

interface ChatSidebarProps {
  currentConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatSidebar = ({
  currentConversationId,
  onConversationSelect,
  onNewChat,
  isOpen,
  onToggle
}: ChatSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const { session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchConversations();
    }
  }, [session?.user?.id]);

  const fetchConversations = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id, title, updated_at, created_at')
        .eq('user_id', session.user.id)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const handleNewChat = () => {
    onNewChat();
    if (window.innerWidth < 768) {
      onToggle(); // Close sidebar on mobile after creating new chat
    }
  };

  const handleConversationClick = (conversationId: string) => {
    onConversationSelect(conversationId);
    if (window.innerWidth < 768) {
      onToggle(); // Close sidebar on mobile after selecting conversation
    }
  };

  const handleEditStart = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleEditSave = async () => {
    if (!editingId || !editTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ title: editTitle.trim() })
        .eq('id', editingId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(conv => 
          conv.id === editingId 
            ? { ...conv, title: editTitle.trim() }
            : conv
        )
      );
      setEditingId(null);
      setEditTitle("");
      toast.success('Conversation renamed');
    } catch (error) {
      console.error('Error updating conversation:', error);
      toast.error('Failed to rename conversation');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDeleteClick = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete) return;

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationToDelete);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));
      
      // If we're deleting the current conversation, start a new chat
      if (conversationToDelete === currentConversationId) {
        onNewChat();
      }
      
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onToggle} />
      <div className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 md:relative md:w-64">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <Button onClick={handleNewChat} className="w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new chat to begin</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`group relative flex items-center p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                        currentConversationId === conversation.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div 
                        className="flex-1 min-w-0 mr-2"
                        onClick={() => handleConversationClick(conversation.id)}
                      >
                        {editingId === conversation.id ? (
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={handleEditSave}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave();
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                            className="h-6 p-1 text-sm"
                            autoFocus
                          />
                        ) : (
                          <>
                            <div className="font-medium text-sm truncate">
                              {conversation.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(conversation.updated_at)}
                            </div>
                          </>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditStart(conversation)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(conversation.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
