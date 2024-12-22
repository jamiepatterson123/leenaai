export interface ProfileFormData {
  height_cm: number;
  weight_kg: number;
  age: number;
  activity_level: string;
  dietary_restrictions: string[];
  fitness_goals: string;
  gender: string;
}

export interface TargetCalculations {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const calculateBMR = (data: ProfileFormData): number => {
  const { weight_kg, height_cm, age, gender } = data;
  const baseBMR = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
};

export const getActivityMultiplier = (activityLevel: string): number => {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  return multipliers[activityLevel as keyof typeof multipliers] || 1.2;
};

export const calculateTargets = (data: ProfileFormData): TargetCalculations => {
  const bmr = calculateBMR(data);
  const tdee = bmr * getActivityMultiplier(data.activity_level);
  
  let targetCalories = tdee;
  
  switch (data.fitness_goals) {
    case 'weight_loss':
      targetCalories *= 0.8;
      break;
    case 'muscle_gain':
      targetCalories *= 1.1;
      break;
  }

  const protein = data.weight_kg * 2;
  const proteinCalories = protein * 4;
  
  const fatCalories = targetCalories * 0.3;
  const fat = fatCalories / 9;
  
  const remainingCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = remainingCalories / 4;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
  };
};