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
          created_at: string
          dietary_restrictions: string[] | null
          first_name: string | null
          fitness_goals: string | null
          gender: string | null
          has_seen_tutorial: boolean | null
          height_cm: number | null
          id: string
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
          created_at?: string
          dietary_restrictions?: string[] | null
          first_name?: string | null
          fitness_goals?: string | null
          gender?: string | null
          has_seen_tutorial?: boolean | null
          height_cm?: number | null
          id?: string
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
          created_at?: string
          dietary_restrictions?: string[] | null
          first_name?: string | null
          fitness_goals?: string | null
          gender?: string | null
          has_seen_tutorial?: boolean | null
          height_cm?: number | null
          id?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
