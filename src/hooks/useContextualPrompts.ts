
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNutritionTargets } from '@/components/nutrition/useNutritionTargets';

interface ContextualPrompt {
  text: string;
  priority: number;
  category: 'meal' | 'progress' | 'goal' | 'reminder' | 'health' | 'follow-up';
}

export const useContextualPrompts = (lastAIMessage?: string) => {
  const [prompts, setPrompts] = useState<ContextualPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const { targets } = useNutritionTargets();

  const generateFollowUpPrompt = (message: string): ContextualPrompt | null => {
    const lowerMessage = message.toLowerCase();
    
    // Shopping list related
    if (lowerMessage.includes('shopping list') || lowerMessage.includes('grocery')) {
      return {
        text: "Create the shopping list",
        priority: 100,
        category: 'follow-up'
      };
    }
    
    // Meal planning related
    if (lowerMessage.includes('meal plan') || lowerMessage.includes('plan your meals')) {
      return {
        text: "Plan my meals",
        priority: 100,
        category: 'follow-up'
      };
    }
    
    // Recipe related
    if (lowerMessage.includes('recipe') || lowerMessage.includes('how to make')) {
      return {
        text: "Show me the recipe",
        priority: 100,
        category: 'follow-up'
      };
    }
    
    // Progress related
    if (lowerMessage.includes('track progress') || lowerMessage.includes('check progress')) {
      return {
        text: "Show my progress",
        priority: 100,
        category: 'follow-up'
      };
    }
    
    // Calorie adjustment related
    if (lowerMessage.includes('adjust calories') || lowerMessage.includes('change target')) {
      return {
        text: "Adjust my targets",
        priority: 100,
        category: 'follow-up'
      };
    }
    
    // Exercise related
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      return {
        text: "Plan my workout",
        priority: 100,
        category: 'follow-up'
      };
    }
    
    // Alternative suggestions
    if (lowerMessage.includes('alternative') || lowerMessage.includes('substitute')) {
      return {
        text: "Show alternatives",
        priority: 100,
        category: 'follow-up'
      };
    }
    
    // Weight tracking
    if (lowerMessage.includes('weigh') || lowerMessage.includes('weight')) {
      return {
        text: "Log my weight",
        priority: 100,
        category: 'follow-up'
      };
    }
    
    // Macro breakdown
    if (lowerMessage.includes('macro') || lowerMessage.includes('protein') || lowerMessage.includes('carbs')) {
      return {
        text: "Analyze my macros",
        priority: 100,
        category: 'follow-up'
      };
    }
    
    // Water tracking
    if (lowerMessage.includes('water') || lowerMessage.includes('hydration')) {
      return {
        text: "Track my water",
        priority: 100,
        category: 'follow-up'
      };
    }
    
    // General follow-up questions
    if (lowerMessage.includes('would you like') || lowerMessage.includes('shall i') || lowerMessage.includes('do you want')) {
      return {
        text: "Yes, please",
        priority: 100,
        category: 'follow-up'
      };
    }
    
    return null;
  };

  const generatePrompts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const currentHour = now.getHours();

      // Fetch today's data
      const [foodResponse, profileResponse, weightResponse] = await Promise.all([
        supabase
          .from('food_diary')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today),
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('weight_history')
          .select('*')
          .eq('user_id', user.id)
          .gte('recorded_at', today)
          .limit(1)
      ]);

      const todaysFoods = foodResponse.data || [];
      const profile = profileResponse.data;
      const todaysWeight = weightResponse.data?.[0];

      // Calculate today's totals
      const todaysTotals = todaysFoods.reduce(
        (acc, food) => ({
          calories: acc.calories + Number(food.calories || 0),
          protein: acc.protein + Number(food.protein || 0),
          carbs: acc.carbs + Number(food.carbs || 0),
          fat: acc.fat + Number(food.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const contextualPrompts: ContextualPrompt[] = [];

      // Generate follow-up prompt if there's a last AI message
      if (lastAIMessage) {
        const followUpPrompt = generateFollowUpPrompt(lastAIMessage);
        if (followUpPrompt) {
          contextualPrompts.push(followUpPrompt);
        }
      }

      // Time-based prompts
      if (currentHour >= 6 && currentHour < 11) {
        // Morning prompts
        if (todaysFoods.length === 0) {
          contextualPrompts.push({
            text: "Plan my healthy breakfast",
            priority: 10,
            category: 'meal'
          });
        }
        contextualPrompts.push({
          text: "Good morning energy foods?",
          priority: 8,
          category: 'meal'
        });
      } else if (currentHour >= 11 && currentHour < 15) {
        // Lunch time
        const hasLunch = todaysFoods.some(food => 
          food.meal_name?.toLowerCase().includes('lunch') || 
          new Date(food.created_at).getHours() >= 11
        );
        if (!hasLunch) {
          contextualPrompts.push({
            text: "What should I eat for lunch?",
            priority: 10,
            category: 'meal'
          });
        }
      } else if (currentHour >= 17 && currentHour < 22) {
        // Dinner time
        const hasdinner = todaysFoods.some(food => 
          food.meal_name?.toLowerCase().includes('dinner') || 
          new Date(food.created_at).getHours() >= 17
        );
        if (!hasdinner) {
          contextualPrompts.push({
            text: "Healthy dinner suggestions?",
            priority: 10,
            category: 'meal'
          });
        }
      }

      // Progress-based prompts
      if (todaysFoods.length > 0) {
        contextualPrompts.push({
          text: "How did I do today?",
          priority: 9,
          category: 'progress'
        });

        // Macro-specific prompts
        const proteinProgress = (todaysTotals.protein / targets.protein) * 100;
        if (proteinProgress < 50) {
          contextualPrompts.push({
            text: "High protein snack ideas?",
            priority: 8,
            category: 'goal'
          });
        }

        const calorieProgress = (todaysTotals.calories / targets.calories) * 100;
        if (calorieProgress > 90) {
          contextualPrompts.push({
            text: "Light meal options for tonight?",
            priority: 7,
            category: 'meal'
          });
        }
      } else {
        // No food logged yet
        contextualPrompts.push({
          text: "Let's log your first meal today",
          priority: 10,
          category: 'reminder'
        });
      }

      // Goal-based prompts
      if (profile?.fitness_goals) {
        switch (profile.fitness_goals) {
          case 'weight_loss':
            contextualPrompts.push({
              text: "Low-calorie meal ideas?",
              priority: 6,
              category: 'goal'
            });
            break;
          case 'muscle_gain':
            contextualPrompts.push({
              text: "Post-workout protein meals?",
              priority: 6,
              category: 'goal'
            });
            break;
          case 'maintain':
            contextualPrompts.push({
              text: "Balanced nutrition tips?",
              priority: 5,
              category: 'goal'
            });
            break;
        }
      }

      // Health reminders
      if (!todaysWeight && currentHour >= 6 && currentHour < 10) {
        contextualPrompts.push({
          text: "Morning weigh-in reminder?",
          priority: 4,
          category: 'health'
        });
      }

      // Weekly check-ins
      const dayOfWeek = now.getDay();
      if (dayOfWeek === 0) { // Sunday
        contextualPrompts.push({
          text: "Show my weekly progress",
          priority: 7,
          category: 'progress'
        });
      }

      // General helpful prompts
      contextualPrompts.push(
        {
          text: "Meal prep ideas for this week?",
          priority: 3,
          category: 'meal'
        },
        {
          text: "Healthy snack suggestions?",
          priority: 3,
          category: 'meal'
        },
        {
          text: "Balance my macros better?",
          priority: 4,
          category: 'goal'
        }
      );

      // Sort by priority and take top 6
      const sortedPrompts = contextualPrompts
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 6);

      setPrompts(sortedPrompts);
    } catch (error) {
      console.error('Error generating contextual prompts:', error);
      // Fallback to basic prompts
      setPrompts([
        { text: "How did I do today?", priority: 5, category: 'progress' },
        { text: "What should I eat next?", priority: 5, category: 'meal' },
        { text: "Healthy meal ideas?", priority: 4, category: 'meal' },
        { text: "Balance my nutrition?", priority: 4, category: 'goal' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePrompts();
  }, [targets, lastAIMessage]);

  return {
    prompts: prompts.map(p => p.text),
    loading,
    refreshPrompts: generatePrompts
  };
};
