export interface MacroDataPoint {
  date: string;
  value: number;
}

export interface MacroData {
  protein: MacroDataPoint[];
  carbs: MacroDataPoint[];
  fat: MacroDataPoint[];
}

export interface DailyMacroData {
  date: string;
  protein: number;
  carbs: number;
  fat: number;
}