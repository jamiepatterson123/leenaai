
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  imageAnalysis?: any;
}

interface ConversationContext {
  lastAiMessage: string;
  recentTopics: string[];
  hasFoodAnalysis: boolean;
  conversationLength: number;
}

const analyzeConversationContext = (messages: Message[]): ConversationContext => {
  const lastAiMessage = messages
    .filter(m => m.role === 'assistant')
    .slice(-1)[0]?.content || '';
  
  const recentMessages = messages.slice(-6); // Last 6 messages for context
  const recentTopics = extractTopics(recentMessages);
  const hasFoodAnalysis = messages.some(m => m.imageAnalysis);
  
  return {
    lastAiMessage,
    recentTopics,
    hasFoodAnalysis,
    conversationLength: messages.length
  };
};

const extractTopics = (messages: Message[]): string[] => {
  const topics: string[] = [];
  const content = messages.map(m => m.content.toLowerCase()).join(' ');
  
  // Food and nutrition topics
  if (content.includes('protein') || content.includes('amino')) topics.push('protein');
  if (content.includes('carb') || content.includes('sugar')) topics.push('carbs');
  if (content.includes('fat') || content.includes('oil')) topics.push('fats');
  if (content.includes('calorie') || content.includes('energy')) topics.push('calories');
  if (content.includes('meal') || content.includes('breakfast') || content.includes('lunch') || content.includes('dinner')) topics.push('meals');
  if (content.includes('snack')) topics.push('snacks');
  if (content.includes('weight') || content.includes('lose') || content.includes('gain')) topics.push('weight');
  if (content.includes('workout') || content.includes('exercise') || content.includes('training')) topics.push('fitness');
  if (content.includes('supplement') || content.includes('vitamin')) topics.push('supplements');
  if (content.includes('hydrat') || content.includes('water')) topics.push('hydration');
  if (content.includes('sleep') || content.includes('rest')) topics.push('recovery');
  if (content.includes('recipe') || content.includes('cook')) topics.push('cooking');
  if (content.includes('shop') || content.includes('buy') || content.includes('grocery')) topics.push('shopping');
  if (content.includes('plan') || content.includes('schedule')) topics.push('planning');
  
  return [...new Set(topics)];
};

const generateFollowUpPrompt = (lastAiMessage: string): string | null => {
  const message = lastAiMessage.toLowerCase();
  
  // Direct questions from AI
  if (message.includes('would you like') && message.includes('shopping list')) {
    return 'Create the shopping list';
  }
  if (message.includes('would you like') && message.includes('recipe')) {
    return 'Show me the recipe';
  }
  if (message.includes('would you like') && message.includes('plan')) {
    return 'Create the meal plan';
  }
  if (message.includes('would you like') && message.includes('track')) {
    return 'Help me track this';
  }
  if (message.includes('would you like') && message.includes('adjust')) {
    return 'Yes, adjust my targets';
  }
  
  // Content-based follow-ups
  if (message.includes('here are') && message.includes('options')) {
    return 'Tell me more about option 1';
  }
  if (message.includes('meal') && message.includes('suggestion')) {
    return 'How do I prepare this?';
  }
  if (message.includes('nutrition') && message.includes('analysis')) {
    return 'What should I eat next?';
  }
  if (message.includes('calorie') && message.includes('deficit')) {
    return 'Adjust my meal plan';
  }
  if (message.includes('protein') && message.includes('low')) {
    return 'High protein meal ideas';
  }
  if (message.includes('great job') || message.includes('well done')) {
    return 'What\'s next for today?';
  }
  if (message.includes('recommendation') || message.includes('suggest')) {
    return 'More details please';
  }
  
  return null;
};

const generateContextualPrompts = (context: ConversationContext, hasProfile: boolean): string[] => {
  const prompts: string[] = [];
  
  // Always try to add a follow-up prompt first
  const followUp = generateFollowUpPrompt(context.lastAiMessage);
  if (followUp) {
    prompts.push(followUp);
  }
  
  // Topic-based prompts
  if (context.recentTopics.includes('meals')) {
    prompts.push('Plan tomorrow\'s meals');
    prompts.push('Meal prep ideas?');
  }
  
  if (context.recentTopics.includes('protein')) {
    prompts.push('High protein snacks?');
    prompts.push('Best protein sources');
  }
  
  if (context.recentTopics.includes('weight')) {
    prompts.push('Track my progress');
    prompts.push('Adjust my goals');
  }
  
  if (context.recentTopics.includes('fitness')) {
    prompts.push('Pre-workout nutrition');
    prompts.push('Post-workout meal?');
  }
  
  if (context.recentTopics.includes('cooking')) {
    prompts.push('Quick healthy recipes');
    prompts.push('Meal prep strategies');
  }
  
  if (context.recentTopics.includes('shopping')) {
    prompts.push('Weekly grocery list');
    prompts.push('Budget-friendly options');
  }
  
  // Conversation length-based prompts
  if (context.conversationLength > 8) {
    prompts.push('Summarize our chat');
    prompts.push('Key takeaways?');
  }
  
  // Default helpful prompts if we don't have enough context
  if (prompts.length < 3) {
    const defaultPrompts = [
      'How did I do today?',
      'What should I eat next?',
      'Balance my macros better?',
      'Healthy snack ideas?',
      'Check my progress',
      'Plan my next meal'
    ];
    
    prompts.push(...defaultPrompts.filter(p => !prompts.includes(p)));
  }
  
  // Remove duplicates and limit to 6
  return [...new Set(prompts)].slice(0, 6);
};

export const useConversationalPrompts = (messages: Message[]) => {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      return data;
    },
  });

  const prompts = useMemo(() => {
    if (messages.length === 0) {
      // Initial prompts when no conversation has started
      return [
        'How can you help me?',
        'Analyze this food photo',
        'Plan my meals for today',
        'Check my macro targets',
        'Healthy breakfast ideas',
        'Track my progress'
      ];
    }
    
    const context = analyzeConversationContext(messages);
    return generateContextualPrompts(context, !!profile);
  }, [messages, profile]);

  return prompts;
};
