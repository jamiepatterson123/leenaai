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

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        // First try to get from Supabase secrets
        const { data, error } = await supabase
          .from("secrets")
          .select("value")
          .eq("name", "OPENAI_API_KEY")
          .single();

        if (data?.value) {
          setApiKey(data.value);
          onApiKeySet(data.value);
          return;
        }

        // Fallback to localStorage if no secret found
        const savedKey = localStorage.getItem("openai_api_key");
        if (savedKey) {
          setApiKey(savedKey);
          onApiKeySet(savedKey);
        }
      } catch (error) {
        console.error("Error loading API key:", error);
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
      // Save to both Supabase and localStorage for redundancy
      const { error } = await supabase
        .from("secrets")
        .upsert({ name: "OPENAI_API_KEY", value: apiKey }, { onConflict: "name" });

      if (error) throw error;

      localStorage.setItem("openai_api_key", apiKey);
      onApiKeySet(apiKey);
      toast.success("API key saved successfully");
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    }
  };

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