import * as z from "zod";

export const formSchema = z.object({
  // Personal Information
  age: z.string().min(1, "Age is required"),
  gender: z.enum(["male", "female", "other"]),
  weight: z.string().min(1, "Weight is required"),
  height: z.string().min(1, "Height is required"),
  
  // Activity Level
  activityLevel: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extremely_active"
  ]),
  
  // Goals
  primaryGoal: z.enum([
    "weight_loss",
    "weight_maintenance",
    "muscle_gain",
    "athletic_performance"
  ]),
  targetWeight: z.string().optional(),
  
  // Dietary Preferences
  diet: z.enum([
    "none",
    "vegan",
    "vegetarian",
    "paleo",
    "keto",
    "low_carb",
    "high_protein",
    "other"
  ]),
  
  // Exercise
  exerciseFrequency: z.string(),
  exerciseType: z.array(z.string()),
  
  // Lifestyle
  sleepHours: z.string(),
  stressLevel: z.enum(["low", "moderate", "high"]),
});

export type FormSchema = z.infer<typeof formSchema>;