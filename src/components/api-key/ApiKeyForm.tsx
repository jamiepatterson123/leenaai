import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ApiKeyFormProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  onSave: () => void;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ apiKey, setApiKey, onSave }) => {
  return (
    <div className="flex gap-2 max-w-md mx-auto mb-8">
      <Input
        type="password"
        placeholder="Enter your OpenAI API key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <Button onClick={onSave}>Save Key</Button>
    </div>
  );
};