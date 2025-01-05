import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useApiKey = (onApiKeySet: (key: string) => void) => {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApiKey();
  }, [onApiKeySet]);

  const loadApiKey = async () => {
    try {
      console.log("Loading API key...");
      setLoading(true);
      
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

  const saveApiKey = async () => {
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

  return {
    apiKey,
    setApiKey,
    loading,
    saveApiKey
  };
};