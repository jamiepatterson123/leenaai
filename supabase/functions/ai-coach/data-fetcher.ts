
import type { MessageIntent, ContextData } from './types.ts';

export async function fetchRelevantData(supabaseClient: any, userId: string, intent: MessageIntent): Promise<ContextData> {
  const now = new Date();
  let startDate: Date;
  let endDate = now;
  
  switch (intent.timeScope) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'trends':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  const startDateString = startDate.toISOString().split('T')[0];
  const todayString = now.toISOString().split('T')[0];
  
  console.log(`Fetching data from ${startDateString} to ${todayString} for intent:`, intent);
  
  let foodEntries = [];
  let weightHistory = [];
  
  if (intent.dataFocus !== 'weight') {
    const { data: foodData, error: foodError } = await supabaseClient
      .from('food_diary')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateString)
      .order('date', { ascending: false });
    
    if (foodError) {
      console.error('Error fetching food entries:', foodError);
    } else {
      foodEntries = foodData || [];
      console.log(`Found ${foodEntries.length} food entries`);
    }
  }
  
  if (intent.dataFocus === 'weight' || intent.dataFocus === 'performance' || intent.dataFocus === 'all') {
    const weightStartDate = intent.timeScope === 'trends' ? 
      new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) : startDate;
    
    const { data: weightData, error: weightError } = await supabaseClient
      .from('weight_history')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', weightStartDate.toISOString())
      .order('recorded_at', { ascending: false });
    
    if (weightError) {
      console.error('Error fetching weight history:', weightError);
    } else {
      weightHistory = weightData || [];
      console.log(`Found ${weightHistory.length} weight entries`);
    }
  }
  
  return {
    foodEntries,
    weightHistory,
    timeScope: intent.timeScope,
    startDate: startDateString,
    endDate: todayString
  };
}
