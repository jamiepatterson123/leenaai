
import type { MessageIntent } from './types.ts';

export function analyzeMessageIntent(message: string): MessageIntent {
  const lowerMessage = message.toLowerCase();
  
  const todayKeywords = ['today', 'so far today', 'currently', 'this morning', 'right now'];
  const weekKeywords = ['this week', 'weekly', 'past week', 'last 7 days', 'week'];
  const monthKeywords = ['this month', 'monthly', 'past month', 'last 30 days', 'month'];
  const trendKeywords = ['trend', 'trending', 'pattern', 'over time', 'progress', 'improvement'];
  
  const weightKeywords = ['weight', 'weigh', 'scale', 'pounds', 'kg', 'body weight'];
  const calorieKeywords = ['calories', 'calorie', 'kcal', 'energy'];
  const macroKeywords = ['protein', 'carbs', 'carbohydrates', 'fat', 'macros', 'macronutrients'];
  const performanceKeywords = ['how did i do', 'performance', 'doing', 'progress', 'goals'];
  
  let timeScope: MessageIntent['timeScope'] = 'comprehensive';
  let dataFocus: MessageIntent['dataFocus'] = 'all';
  let questionType: MessageIntent['questionType'] = 'general';
  
  if (todayKeywords.some(keyword => lowerMessage.includes(keyword))) {
    timeScope = 'today';
  } else if (weekKeywords.some(keyword => lowerMessage.includes(keyword))) {
    timeScope = 'week';
  } else if (monthKeywords.some(keyword => lowerMessage.includes(keyword))) {
    timeScope = 'month';
  } else if (trendKeywords.some(keyword => lowerMessage.includes(keyword))) {
    timeScope = 'trends';
  }
  
  if (weightKeywords.some(keyword => lowerMessage.includes(keyword))) {
    dataFocus = 'weight';
  } else if (calorieKeywords.some(keyword => lowerMessage.includes(keyword))) {
    dataFocus = 'calories';
  } else if (macroKeywords.some(keyword => lowerMessage.includes(keyword))) {
    dataFocus = 'macros';
  } else if (performanceKeywords.some(keyword => lowerMessage.includes(keyword))) {
    dataFocus = 'performance';
  }
  
  if (performanceKeywords.some(keyword => lowerMessage.includes(keyword))) {
    questionType = 'performance_review';
  } else if (trendKeywords.some(keyword => lowerMessage.includes(keyword))) {
    questionType = 'trend_analysis';
  } else if (lowerMessage.includes('help') || lowerMessage.includes('advice') || lowerMessage.includes('should')) {
    questionType = 'advice';
  }
  
  return { timeScope, dataFocus, questionType };
}
