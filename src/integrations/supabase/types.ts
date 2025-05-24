export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      apple_health_data: {
        Row: {
          created_at: string
          data_type: string
          id: string
          source: string | null
          timestamp: string
          unit: string
          user_id: string | null
          value: number
        }
        Insert: {
          created_at?: string
          data_type: string
          id?: string
          source?: string | null
          timestamp: string
          unit: string
          user_id?: string | null
          value: number
        }
        Update: {
          created_at?: string
          data_type?: string
          id?: string
          source?: string | null
          timestamp?: string
          unit?: string
          user_id?: string | null
          value?: number
        }
        Relationships: []
      }
      feature_requests: {
        Row: {
          created_at: string
          description: string
          id: string
          status: string | null
          title: string
          user_id: string | null
          votes_count: number | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          status?: string | null
          title: string
          user_id?: string | null
          votes_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          status?: string | null
          title?: string
          user_id?: string | null
          votes_count?: number | null
        }
        Relationships: []
      }
      feature_votes: {
        Row: {
          created_at: string
          feature_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feature_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feature_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_votes_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      food_diary: {
        Row: {
          calories: number
          carbs: number
          category: string | null
          created_at: string
          date: string
          fat: number
          food_name: string
          id: string
          meal_id: string | null
          meal_name: string | null
          protein: number
          state: string | null
          user_id: string | null
          weight_g: number
        }
        Insert: {
          calories: number
          carbs: number
          category?: string | null
          created_at?: string
          date?: string
          fat: number
          food_name: string
          id?: string
          meal_id?: string | null
          meal_name?: string | null
          protein: number
          state?: string | null
          user_id?: string | null
          weight_g: number
        }
        Update: {
          calories?: number
          carbs?: number
          category?: string | null
          created_at?: string
          date?: string
          fat?: number
          food_name?: string
          id?: string
          meal_id?: string | null
          meal_name?: string | null
          protein?: number
          state?: string | null
          user_id?: string | null
          weight_g?: number
        }
        Relationships: []
      }
      oura_data: {
        Row: {
          created_at: string
          data_type: string
          id: string
          source: string | null
          timestamp: string
          unit: string
          user_id: string | null
          value: number
        }
        Insert: {
          created_at?: string
          data_type: string
          id?: string
          source?: string | null
          timestamp: string
          unit: string
          user_id?: string | null
          value: number
        }
        Update: {
          created_at?: string
          data_type?: string
          id?: string
          source?: string | null
          timestamp?: string
          unit?: string
          user_id?: string | null
          value?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          api_version: string | null
          chart_settings: Json | null
          created_at: string
          dietary_restrictions: string[] | null
          first_name: string | null
          fitness_goals: string | null
          gender: string | null
          has_seen_tutorial: boolean | null
          height_cm: number | null
          id: string
          onboarding_completed: boolean | null
          preferred_units: string | null
          target_calories: number | null
          target_carbs: number | null
          target_fat: number | null
          target_protein: number | null
          updated_at: string
          user_id: string | null
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          api_version?: string | null
          chart_settings?: Json | null
          created_at?: string
          dietary_restrictions?: string[] | null
          first_name?: string | null
          fitness_goals?: string | null
          gender?: string | null
          has_seen_tutorial?: boolean | null
          height_cm?: number | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_units?: string | null
          target_calories?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          target_protein?: number | null
          updated_at?: string
          user_id?: string | null
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          api_version?: string | null
          chart_settings?: Json | null
          created_at?: string
          dietary_restrictions?: string[] | null
          first_name?: string | null
          fitness_goals?: string | null
          gender?: string | null
          has_seen_tutorial?: boolean | null
          height_cm?: number | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_units?: string | null
          target_calories?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          target_protein?: number | null
          updated_at?: string
          user_id?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      secrets: {
        Row: {
          created_at: string
          id: string
          name: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          value?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          credits: number | null
          email: string
          first_usage_time: string | null
          id: string
          last_usage_time: string | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          usage_count: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          credits?: number | null
          email: string
          first_usage_time?: string | null
          id?: string
          last_usage_time?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          credits?: number | null
          email?: string
          first_usage_time?: string | null
          id?: string
          last_usage_time?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      water_consumption: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          amount_ml: number
          created_at?: string
          id?: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      weight_history: {
        Row: {
          created_at: string
          id: string
          recorded_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          recorded_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          id?: string
          recorded_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          content: string
          id: string
          message_type: string
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          content: string
          id?: string
          message_type: string
          sent_at?: string
          status: string
          user_id: string
        }
        Update: {
          content?: string
          id?: string
          message_type?: string
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_preferences: {
        Row: {
          created_at: string
          daily_reminder_time: string | null
          id: string
          phone_number: string
          reminders_enabled: boolean | null
          timezone: string | null
          updated_at: string
          user_id: string
          weekly_report_day: number | null
          weekly_report_enabled: boolean | null
        }
        Insert: {
          created_at?: string
          daily_reminder_time?: string | null
          id?: string
          phone_number: string
          reminders_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          weekly_report_day?: number | null
          weekly_report_enabled?: boolean | null
        }
        Update: {
          created_at?: string
          daily_reminder_time?: string | null
          id?: string
          phone_number?: string
          reminders_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          weekly_report_day?: number | null
          weekly_report_enabled?: boolean | null
        }
        Relationships: []
      }
      whoop_data: {
        Row: {
          created_at: string
          data_type: string
          id: string
          source: string | null
          timestamp: string
          unit: string
          user_id: string | null
          value: number
        }
        Insert: {
          created_at?: string
          data_type: string
          id?: string
          source?: string | null
          timestamp: string
          unit: string
          user_id?: string | null
          value: number
        }
        Update: {
          created_at?: string
          data_type?: string
          id?: string
          source?: string | null
          timestamp?: string
          unit?: string
          user_id?: string | null
          value?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      send_daily_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      send_weekly_reports: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
