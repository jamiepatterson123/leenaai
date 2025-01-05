import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ApiSettings() {
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'OPENAI_API_KEY')
        .maybeSingle();  // Using maybeSingle instead of single

      if (error) throw error;
      
      if (data) {
        setApiKey(data.value);
        toast.success("API key loaded successfully");
      }
    } catch (error) {
      console.error('Error loading API key:', error);
      toast.error("Failed to load API key");
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async () => {
    try {
      // First check if a key already exists
      const { data: existingKey } = await supabase
        .from('secrets')
        .select('id')
        .eq('name', 'OPENAI_API_KEY')
        .maybeSingle();

      if (existingKey) {
        // Update existing key
        const { error: updateError } = await supabase
          .from('secrets')
          .update({ value: apiKey })
          .eq('name', 'OPENAI_API_KEY');

        if (updateError) throw updateError;
      } else {
        // Insert new key
        const { error: insertError } = await supabase
          .from('secrets')
          .insert({ name: 'OPENAI_API_KEY', value: apiKey });

        if (insertError) throw insertError;
      }

      toast.success("API key saved successfully");
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error("Failed to save API key");
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">API Settings</h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
            OpenAI API Key
          </label>
          <div className="flex gap-2">
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="flex-1"
            />
            <Button onClick={saveApiKey}>Save</Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Your API key is stored securely and used for image analysis.
          </p>
        </div>
      </div>
    </div>
  );
}