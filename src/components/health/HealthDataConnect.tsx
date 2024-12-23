import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Apple, Activity } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const HealthDataConnect = () => {
  const { data: { user } } = await supabase.auth.getUser();

  const handleAppleHealthConnect = async () => {
    try {
      // Request HealthKit authorization
      const healthData = await window.webkit?.messageHandlers.healthKit?.postMessage({
        request: 'authorize',
        dataTypes: ['steps', 'weight', 'activeEnergy', 'heartRate']
      });

      if (healthData) {
        const { error } = await supabase.functions.invoke('sync-apple-health', {
          body: { healthData, userId: user?.id }
        });

        if (error) throw error;
        toast.success('Apple Health data synced successfully');
      }
    } catch (error) {
      console.error('Error connecting to Apple Health:', error);
      toast.error('Failed to connect to Apple Health');
    }
  };

  const handleWhoopConnect = async () => {
    try {
      // Open Whoop OAuth flow
      window.open('https://api.whoop.com/oauth/authorize', '_blank');
      // Handle OAuth callback and data sync in a separate component
      toast.success('Connected to Whoop successfully');
    } catch (error) {
      console.error('Error connecting to Whoop:', error);
      toast.error('Failed to connect to Whoop');
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Apple className="h-8 w-8" />
          <div>
            <h3 className="text-lg font-semibold">Apple Health</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Apple Health data for personalized insights
            </p>
          </div>
        </div>
        <Button 
          onClick={handleAppleHealthConnect}
          className="mt-4 w-full"
        >
          Connect Apple Health
        </Button>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Activity className="h-8 w-8" />
          <div>
            <h3 className="text-lg font-semibold">Whoop</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Whoop data for recovery insights
            </p>
          </div>
        </div>
        <Button 
          onClick={handleWhoopConnect}
          className="mt-4 w-full"
        >
          Connect Whoop
        </Button>
      </Card>
    </div>
  );
};