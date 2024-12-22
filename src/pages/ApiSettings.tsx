import { ApiKeyInput } from "@/components/ApiKeyInput";
import { toast } from "sonner";

const ApiSettings = () => {
  const handleApiKeySet = (key: string) => {
    toast.success("API key saved successfully");
  };

  return (
    <div className="max-w-4xl mx-auto px-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        API Settings
      </h1>
      <div className="space-y-8">
        <div className="max-w-md mx-auto">
          <p className="text-muted-foreground mb-4 text-center">
            Enter your OpenAI API key to enable food analysis features.
          </p>
          <ApiKeyInput onApiKeySet={handleApiKeySet} />
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;