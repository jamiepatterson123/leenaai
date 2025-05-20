import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { saveFoodEntries } from '../analysis/FoodEntrySaver';
import { triggerSuccessConfetti } from '@/utils/confetti';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useIsMobile } from '@/hooks/use-mobile';

interface NaturalLanguageInputProps {
  onSuccess?: () => void;
  selectedDate?: Date;
}

export const NaturalLanguageInput = ({ onSuccess, selectedDate = new Date() }: NaturalLanguageInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isMobile = useIsMobile();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudioToText(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudioToText = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const buffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });

      if (error) throw error;
      if (data?.text) {
        setInputText(data.text);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };

  // Voice-specific loading messages with corrected type values
  const voiceMessages = [
    { text: "Converting your speech to text...", type: "processing" as const },
    { text: "Listening to your food description...", type: "processing" as const },
    { text: "Processing audio input...", type: "processing" as const },
    { text: "Identifying food items from your description...", type: "nutrition" as const }
  ];

  const textAnalysisMessages = [
    { text: "Analyzing your food description...", type: "processing" as const },
    { text: "Identifying food items...", type: "processing" as const },
    { text: "Calculating nutritional information...", type: "nutrition" as const },
    { text: "Preparing your food log entry...", type: "processing" as const }
  ];

  const processNaturalLanguageInput = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter what you ate');
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to save food entries');
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { 
          text: inputText,
          date: format(selectedDate, 'yyyy-MM-dd')
        }
      });

      if (error) throw error;

      if (data?.foods) {
        // Process and save the analyzed foods to the food diary
        const foodEntries = data.foods.map((food: any) => ({
          ...food,
          state: 'logged',
          category: 'uncategorized'
        }));

        await saveFoodEntries(foodEntries, selectedDate);
        
        // Trigger confetti animation when food is successfully logged
        triggerSuccessConfetti();
        
        toast.success('Food logged successfully');
        setInputText('');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error processing input:', error);
      toast.error('Failed to process food input');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-[95%] mx-auto md:max-w-full relative">
      <div className="flex gap-2 items-center">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Describe what you ate..."
          className="flex-1"
        />
        <Button
          size="icon"
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className="shrink-0"
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          onClick={processNaturalLanguageInput}
          disabled={isProcessing || !inputText.trim()}
          className="shrink-0"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <LoadingOverlay 
        isVisible={isRecording}
        title="Listening..."
        messages={voiceMessages}
        type="voice"
        fullScreen={isMobile}
      />
      
      <LoadingOverlay 
        isVisible={isProcessing && !isRecording}
        title="Processing Food"
        messages={textAnalysisMessages}
        fullScreen={isMobile}
      />
    </div>
  );
};
