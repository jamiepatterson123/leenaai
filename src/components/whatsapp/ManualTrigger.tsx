
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play, RefreshCw } from "lucide-react";

export const ManualTrigger = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleManualTrigger = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.rpc('trigger_whatsapp_processing');
      
      if (error) {
        console.error('Error triggering WhatsApp processing:', error);
        toast.error('Failed to trigger message processing');
        return;
      }

      toast.success('WhatsApp message processing triggered successfully!');
    } catch (error) {
      console.error('Error triggering WhatsApp processing:', error);
      toast.error('Failed to trigger message processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPendingMessages = async () => {
    setIsChecking(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error("You must be logged in to check messages");
        return;
      }

      const { data: messages, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('user_id', user.user.id)
        .order('sent_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to fetch messages');
        return;
      }

      const pending = messages?.filter(m => m.status === 'pending').length || 0;
      const sent = messages?.filter(m => m.status === 'sent').length || 0;
      const failed = messages?.filter(m => m.status === 'failed').length || 0;

      toast.success(`Status: ${pending} pending, ${sent} sent, ${failed} failed messages`);
    } catch (error) {
      console.error('Error checking messages:', error);
      toast.error('Failed to check message status');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Processing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleManualTrigger} 
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Process Pending Messages
            </Button>
            
            <Button 
              onClick={checkPendingMessages} 
              disabled={isChecking}
              variant="outline"
              className="flex-1"
            >
              {isChecking ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Check Status
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>• Messages are automatically processed every 2 minutes</p>
            <p>• Use "Process Pending Messages" to trigger immediate processing</p>
            <p>• Use "Check Status" to see your recent message status</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
