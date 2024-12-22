import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ApiKeyInputProps {
  onApiKeySet: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      onApiKeySet(savedKey);
    }
  }, [onApiKeySet]);

  const handleSave = () => {
    if (!apiKey.startsWith("sk-")) {
      toast.error("Please enter a valid OpenAI API key");
      return;
    }
    localStorage.setItem("openai_api_key", apiKey);
    onApiKeySet(apiKey);
    toast.success("API key saved successfully");
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