import React from "react";
import { ApiKeyForm } from "./api-key/ApiKeyForm";
import { useApiKey } from "./api-key/useApiKey";

interface ApiKeyInputProps {
  onApiKeySet: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const { apiKey, setApiKey, loading, saveApiKey } = useApiKey(onApiKeySet);

  if (loading) {
    return <div>Loading API key...</div>;
  }

  return (
    <ApiKeyForm 
      apiKey={apiKey}
      setApiKey={setApiKey}
      onSave={saveApiKey}
    />
  );
};