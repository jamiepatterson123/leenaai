import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ApiKeyInputProps {
  onApiKeySet: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        console.log("Loading API key...");
        setLoading(true);
        
        // First try to get from Supabase secrets
        const { data: secretData, error: secretError } = await supabase
          .from("secrets")
          .select("value")
          .eq("name", "OPENAI_API_KEY")
          .maybeSingle();

        if (secretError) {
          console.error("Error fetching from secrets:", secretError);
          toast.error("Error loading API key");
          return;
        }

        if (secretData?.value) {
          console.log("API key found in Supabase");
          setApiKey(secretData.value);
          onApiKeySet(secretData.value);
          return;
        } else {
          console.log("No API key found in Supabase");
          toast.error("Please set your OpenAI API key");
        }
      } catch (error) {
        console.error("Error loading API key:", error);
        toast.error("Error loading API key");
      } finally {
        setLoading(false);
      }
    };

    loadApiKey();
  }, [onApiKeySet]);

  const handleSave = async () => {
    if (!apiKey.startsWith("sk-")) {
      toast.error("Please enter a valid OpenAI API key");
      return;
    }

    try {
      console.log("Saving API key...");
      
      const { error } = await supabase
        .from("secrets")
        .upsert({ name: "OPENAI_API_KEY", value: apiKey }, { onConflict: "name" });

      if (error) {
        console.error("Error saving to Supabase:", error);
        toast.error("Failed to save API key");
        return;
      }

      onApiKeySet(apiKey);
      toast.success("API key saved successfully");
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    }
  };

  if (loading) {
    return <div>Loading API key...</div>;
  }

  return (
    <div className="flex gap-2 max-w-md mx-auto mb-8">
      <Input
        type="password"
        placeholder="Enter your OpenAI API key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <Button onClick={handleSave}>Save Key</Button>
    </div>
  );
};