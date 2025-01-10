export const calculateMacrosFromCalories = (
  calories: number,
  proteinPercentage: number,
  carbsPercentage: number,
  fatPercentage: number
) => {
  const proteinCalories = (calories * proteinPercentage) / 100;
  const carbsCalories = (calories * carbsPercentage) / 100;
  const fatCalories = (calories * fatPercentage) / 100;

  return {
    protein: Math.round(proteinCalories / 4),
    carbs: Math.round(carbsCalories / 4),
    fat: Math.round(fatCalories / 9),
  };
};

export const calculateCaloriesFromMacros = (
  protein: number,
  carbs: number,
  fat: number
) => {
  return protein * 4 + carbs * 4 + fat * 9;
};

export const validateMacroPercentages = (
  proteinPercentage: number,
  carbsPercentage: number,
  fatPercentage: number
) => {
  const total = proteinPercentage + carbsPercentage + fatPercentage;
  return Math.abs(total - 100) < 0.1; // Allow for small rounding errors
};