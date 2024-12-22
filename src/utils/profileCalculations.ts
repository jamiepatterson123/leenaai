export interface ProfileFormData {
  height_cm: number;
  weight_kg: number;
  age: number;
  activity_level: string;
  dietary_restrictions: string[];
  fitness_goals: string;
  gender: string;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
}

export interface TargetCalculations {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const calculateBMR = (data: ProfileFormData): number => {
  const { weight_kg, height_cm, age, gender } = data;
  // Using Mifflin-St Jeor Equation
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
  
  // Adjust calories based on fitness goals
  switch (data.fitness_goals) {
    case 'weight_loss':
      targetCalories *= 0.8; // 20% deficit
      break;
    case 'muscle_gain':
      targetCalories *= 1.1; // 10% surplus
      break;
    case 'maintenance':
    default:
      // Keep TDEE as is
      break;
  }

  // Calculate macronutrient targets
  // Protein: 2g per kg of body weight
  const protein = data.weight_kg * 2;
  const proteinCalories = protein * 4;
  
  // Fat: 25% of total calories
  const fatCalories = targetCalories * 0.25;
  const fat = fatCalories / 9;
  
  // Remaining calories go to carbs
  const remainingCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = remainingCalories / 4;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
  };
};