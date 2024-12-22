// Base types
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Food diary related types
interface FoodDiaryRow {
  calories: number
  carbs: number
  category: string | null
  created_at: string
  date: string
  fat: number
  food_name: string
  id: string
  protein: number
  user_id: string | null
  weight_g: number
}

interface FoodDiaryInsert {
  calories: number
  carbs: number
  category?: string | null
  created_at?: string
  date?: string
  fat: number
  food_name: string
  id?: string
  protein: number
  user_id?: string | null
  weight_g: number
}

interface FoodDiaryUpdate {
  calories?: number
  carbs?: number
  category?: string | null
  created_at?: string
  date?: string
  fat?: number
  food_name?: string
  id?: string
  protein?: number
  user_id?: string | null
  weight_g?: number
}

// Profile related types
interface ProfileRow {
  activity_level: string | null
  age: number | null
  created_at: string
  dietary_restrictions: string[] | null
  fitness_goals: string | null
  gender: string | null
  height_cm: number | null
  id: string
  target_calories: number | null
  target_carbs: number | null
  target_fat: number | null
  target_protein: number | null
  updated_at: string
  user_id: string | null
  weight_kg: number | null
}

interface ProfileInsert {
  activity_level?: string | null
  age?: number | null
  created_at?: string
  dietary_restrictions?: string[] | null
  fitness_goals?: string | null
  gender?: string | null
  height_cm?: number | null
  id?: string
  target_calories?: number | null
  target_carbs?: number | null
  target_fat?: number | null
  target_protein?: number | null
  updated_at?: string
  user_id?: string | null
  weight_kg?: number | null
}

interface ProfileUpdate {
  activity_level?: string | null
  age?: number | null
  created_at?: string
  dietary_restrictions?: string[] | null
  fitness_goals?: string | null
  gender?: string | null
  height_cm?: number | null
  id?: string
  target_calories?: number | null
  target_carbs?: number | null
  target_fat?: number | null
  target_protein?: number | null
  updated_at?: string
  user_id?: string | null
  weight_kg?: number | null
}

// Secrets related types
interface SecretRow {
  created_at: string
  id: string
  name: string
  value: string
}

interface SecretInsert {
  created_at?: string
  id?: string
  name: string
  value: string
}

interface SecretUpdate {
  created_at?: string
  id?: string
  name?: string
  value?: string
}

// Database interface
export interface Database {
  public: {
    Tables: {
      food_diary: {
        Row: FoodDiaryRow
        Insert: FoodDiaryInsert
        Update: FoodDiaryUpdate
      }
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      secrets: {
        Row: SecretRow
        Insert: SecretInsert
        Update: SecretUpdate
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}