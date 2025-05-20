import { startOfDay, eachDayOfInterval, format, parseISO } from "date-fns";

export const processWeightData = (data: any[], startDate: Date, endDate: Date) => {
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Create a map of dates to their corresponding entry
  const dateEntryMap = new Map();
  data.forEach(entry => {
    const dateKey = entry.date.split('T')[0];
    dateEntryMap.set(dateKey, entry);
  });
  
  return dateRange.map(date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const entry = dateEntryMap.get(formattedDate);
    
    return {
      date: formattedDate,
      weight: entry?.weight || null,
      id: entry?.id || undefined // Include ID if available
    };
  });
};

export const processCalorieData = (data: any[], startDate: Date, endDate: Date) => {
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  
  return dateRange.map(date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const entriesForDay = data.filter(d => d.date === formattedDate);
    const totalCalories = entriesForDay.reduce((sum, entry) => sum + entry.calories, 0);
    
    return {
      date: formattedDate,
      calories: totalCalories || 0
    };
  });
};

export const processMacroData = (data: any[], startDate: Date, endDate: Date) => {
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  
  return dateRange.map(date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const entriesForDay = data.filter(d => d.date === formattedDate);
    
    return {
      date: formattedDate,
      protein: entriesForDay.reduce((sum, entry) => sum + entry.protein, 0),
      carbs: entriesForDay.reduce((sum, entry) => sum + entry.carbs, 0),
      fat: entriesForDay.reduce((sum, entry) => sum + entry.fat, 0)
    };
  });
};

export const processWaterData = (data: any[], startDate: Date, endDate: Date) => {
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  
  return dateRange.map(date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const entriesForDay = data.filter(d => format(parseISO(d.timestamp), 'yyyy-MM-dd') === formattedDate);
    const totalAmount = entriesForDay.reduce((sum, entry) => sum + entry.amount_ml, 0);
    
    return {
      timestamp: formattedDate,
      amount_ml: totalAmount || 0
    };
  });
};

export const processMealData = (data: any[], startDate: Date, endDate: Date) => {
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  const allData = dateRange.flatMap(date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const entriesForDay = data.filter(d => d.date === formattedDate);
    return entriesForDay.length > 0 ? entriesForDay : [{
      date: formattedDate,
      calories: 0,
      category: 'No data',
      state: 'No data'
    }];
  });

  return allData;
};
