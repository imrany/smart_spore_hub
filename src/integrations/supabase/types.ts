export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          created_at: string
          hub_id: string
          humidity: number | null
          id: string
          message: string
          resolved: boolean | null
          resolved_at: string | null
          temperature: number | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          hub_id: string
          humidity?: number | null
          id?: string
          message: string
          resolved?: boolean | null
          resolved_at?: string | null
          temperature?: number | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          hub_id?: string
          humidity?: number | null
          id?: string
          message?: string
          resolved?: boolean | null
          resolved_at?: string | null
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          image_url: string | null
          level: string | null
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          level?: string | null
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          level?: string | null
          title?: string
        }
        Relationships: []
      }
      hubs: {
        Row: {
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          location: string
          manager_id: string | null
          name: string
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location: string
          manager_id?: string | null
          name: string
        }
        Update: {
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string
          manager_id?: string | null
          name?: string
        }
        Relationships: []
      }
      market_listings: {
        Row: {
          available: boolean | null
          created_at: string | null
          description: string | null
          farmer_id: string | null
          id: string
          image_url: string | null
          price_per_unit: number
          product_name: string
          quantity: number
          unit: string
        }
        Insert: {
          available?: boolean | null
          created_at?: string | null
          description?: string | null
          farmer_id?: string | null
          id?: string
          image_url?: string | null
          price_per_unit: number
          product_name: string
          quantity: number
          unit: string
        }
        Update: {
          available?: boolean | null
          created_at?: string | null
          description?: string | null
          farmer_id?: string | null
          id?: string
          image_url?: string | null
          price_per_unit?: number
          product_name?: string
          quantity?: number
          unit?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          id: string
          phone_number: string | null
          sms_enabled: boolean | null
          user_id: string | null
          whatsapp_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          phone_number?: string | null
          sms_enabled?: boolean | null
          user_id?: string | null
          whatsapp_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          phone_number?: string | null
          sms_enabled?: boolean | null
          user_id?: string | null
          whatsapp_enabled?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          location: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          location?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          location?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      sensor_readings: {
        Row: {
          created_at: string | null
          hub_id: string
          humidity: number
          id: string
          recorded_at: string
          temperature: number
        }
        Insert: {
          created_at?: string | null
          hub_id: string
          humidity: number
          id?: string
          recorded_at?: string
          temperature: number
        }
        Update: {
          created_at?: string | null
          hub_id?: string
          humidity?: number
          id?: string
          recorded_at?: string
          temperature?: number
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "farmer" | "buyer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["farmer", "buyer", "admin"],
    },
  },
} as const
