
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NotificationToggle } from "./NotificationToggle";
import { PhoneNumberInput } from "./PhoneNumberInput";
import { TimezoneSelector } from "./TimezoneSelector";
import { ManualTrigger } from "./ManualTrigger";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Beaker, Key, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const WhatsAppPreferences = () => {
  const [newApiKey, setNewApiKey] = useState("");
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);

  const {
    data: preferences,
    isLoading
  } = useQuery({
    queryKey: ["whatsappPreferences"],
    queryFn: async () => {
      const {
        data: user
      } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");
      const {
        data,
        error
      } = await supabase.from("whatsapp_preferences").select("*").eq("user_id", user.user.id).order("created_at", {
        ascending: false
      }).limit(1);
      if (error) {
        console.error("Error fetching WhatsApp preferences:", error);
        throw error;
      }
      return data?.[0] || null;
    }
  });
  const {
    data: isAdmin
  } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const {
        data: user
      } = await supabase.auth.getUser();
      if (!user.user) return false;
      const {
        data,
        error
      } = await supabase.rpc('has_role', {
        _user_id: user.user.id,
        _role: 'admin'
      });
      if (error) {
        console.error("Error checking admin role:", error);
        return false;
      }
      return data || false;
    }
  });
  const updatePreferences = async (updates: Partial<typeof preferences>) => {
    const {
      data: user
    } = await supabase.auth.getUser();
    if (!user.user) {
      toast.error("You must be logged in to update preferences");
      return;
    }

    // Only proceed with update if there are actual changes
    if (preferences?.phone_number === updates.phone_number) {
      return;
    }

    // First, insert or update the preferences
    const {
      error: preferencesError
    } = await supabase.from("whatsapp_preferences").upsert({
      user_id: user.user.id,
      ...preferences,
      ...updates,
      updated_at: new Date().toISOString()
    });
    if (preferencesError) {
      console.error("Error updating WhatsApp preferences:", preferencesError);
      toast.error("Failed to update preferences");
      return;
    }

    // If we're updating the phone number, manually create a welcome message
    if (updates.phone_number && updates.phone_number !== preferences?.phone_number) {
      const {
        error: messageError
      } = await supabase.from("whatsapp_messages").insert({
        user_id: user.user.id,
        content: "👋 Welcome to Leena.ai! Your WhatsApp integration is now active. You will receive daily reminders and weekly reports here.",
        message_type: "welcome",
        status: "pending"
      });
      if (messageError) {
        console.error("Error creating welcome message:", messageError);
        toast.error("Failed to send welcome message");
        return;
      }
    }
    toast.success("Preferences updated successfully");
  };
  const handleTestMessage = async () => {
    try {
      console.log('Starting test message process...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error("Authentication error. Please try logging out and back in.");
        return;
      }
      
      if (!session) {
        console.error('No session found');
        toast.error("You must be logged in to send test messages");
        return;
      }

      console.log('Session found, invoking function...');

      const { data, error } = await supabase.functions.invoke('send-test-whatsapp', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      if (data?.success) {
        toast.success("Test message sent successfully! Check your WhatsApp.");
      } else {
        throw new Error(data?.error || "Failed to send test message");
      }
    } catch (error) {
      console.error("Error sending test message:", error);
      
      // Provide more specific error messages
      if (error.message?.includes('Not authenticated')) {
        toast.error("Authentication failed. Please log out and log back in.");
      } else if (error.message?.includes('Admin access required')) {
        toast.error("Admin access required to send test messages.");
      } else if (error.message?.includes('phone number not configured')) {
        toast.error("Please configure your WhatsApp phone number first.");
      } else if (error.message?.includes('session is invalid')) {
        toast.error("Your WhatsApp access token has expired. Please update it with a fresh token.");
      } else {
        toast.error(error.message || "Failed to send test message");
      }
    }
  };

  const handleUpdateApiKey = async () => {
    if (!newApiKey.trim() && !isUpdatingKey) {
      // First click without API key - use default
      setIsUpdatingKey(true);
    }

    try {
      console.log('Updating WhatsApp API key...');
      
      const { data, error } = await supabase.functions.invoke('update-whatsapp-key', {
        body: newApiKey.trim() ? { apiKey: newApiKey.trim() } : {}
      });

      console.log('Update API key response:', { data, error });

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      if (data?.success) {
        toast.success("WhatsApp API key updated successfully!");
        setNewApiKey("");
        setIsUpdatingKey(false);
      } else {
        throw new Error(data?.error || "Failed to update API key");
      }
    } catch (error) {
      console.error("Error updating API key:", error);
      toast.error(error.message || "Failed to update API key");
      setIsUpdatingKey(false);
    }
  };

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <PhoneNumberInput 
              value={preferences?.phone_number || ""} 
              onChange={(phone_number) => updatePreferences({ phone_number })} 
            />
            
            <NotificationToggle 
              label="Daily Reminders" 
              enabled={preferences?.reminders_enabled ?? true} 
              onChange={(reminders_enabled) => updatePreferences({ reminders_enabled })} 
            />
            
            <NotificationToggle 
              label="Weekly Reports" 
              enabled={preferences?.weekly_report_enabled ?? true} 
              onChange={(weekly_report_enabled) => updatePreferences({ weekly_report_enabled })} 
            />
            
            <TimezoneSelector 
              value={preferences?.timezone || "UTC"} 
              onChange={(timezone) => updatePreferences({ timezone })} 
            />

            {isAdmin && (
              <div className="pt-4 border-t space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="api-key">WhatsApp Access Token</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter new WhatsApp access token..."
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleUpdateApiKey} 
                      variant="outline"
                      disabled={isUpdatingKey}
                    >
                      {isUpdatingKey ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4 mr-2" />
                      )}
                      Update
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get a fresh access token from your Facebook Developer Console → WhatsApp → API Setup
                  </p>
                </div>
                
                <Button onClick={handleTestMessage} variant="outline" className="w-full">
                  <Beaker className="w-4 h-4 mr-2" />
                  Send Test Message
                </Button>
                <p className="text-sm text-muted-foreground">
                  Phone Number ID: <code>15551753639</code> (from your WhatsApp Business Manager)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isAdmin && <ManualTrigger />}
    </div>
  );
};
