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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      divisions: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          slug: string
          type: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          slug: string
          type: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          slug?: string
          type?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          assigned_staff: string | null
          attachments: Json | null
          company_name: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string | null
          division_id: string
          id: string
          inquiry_payload: Json
          internal_notes: string | null
          status: string
          tracking_uuid: string
          updated_at: string | null
          wa_message_id: string | null
          wa_sent_at: string | null
        }
        Insert: {
          assigned_staff?: string | null
          attachments?: Json | null
          company_name?: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string | null
          division_id: string
          id?: string
          inquiry_payload?: Json
          internal_notes?: string | null
          status?: string
          tracking_uuid?: string
          updated_at?: string | null
          wa_message_id?: string | null
          wa_sent_at?: string | null
        }
        Update: {
          assigned_staff?: string | null
          attachments?: Json | null
          company_name?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          division_id?: string
          id?: string
          inquiry_payload?: Json
          internal_notes?: string | null
          status?: string
          tracking_uuid?: string
          updated_at?: string | null
          wa_message_id?: string | null
          wa_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_assigned_staff_fkey"
            columns: ["assigned_staff"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_events: {
        Row: {
          actor_id: string | null
          created_at: string | null
          event_type: string
          id: string
          inquiry_id: string | null
          payload: Json | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          inquiry_id?: string | null
          payload?: Json | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          inquiry_id?: string | null
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_events_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          division_id: string
          id: string
          image_path: string | null
          is_active: boolean | null
          metadata: Json | null
          name: string
          sku: string | null
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          division_id: string
          id?: string
          image_path?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          sku?: string | null
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          division_id?: string
          id?: string
          image_path?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          sku?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          division_id: string | null
          full_name: string
          id: string
          is_active: boolean | null
          role: string | null
          whatsapp_phone: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          division_id?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          role?: string | null
          whatsapp_phone: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          division_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          role?: string | null
          whatsapp_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
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
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
