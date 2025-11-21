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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      dde_admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      dde_candles: {
        Row: {
          created_at: string
          duration_hours: number | null
          expires_at: string
          id: string
          is_active: boolean | null
          lit_at: string
          lit_by_email: string | null
          lit_by_name: string
          memorial_page_id: string | null
          message: string | null
          obituary_id: string | null
        }
        Insert: {
          created_at?: string
          duration_hours?: number | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          lit_at?: string
          lit_by_email?: string | null
          lit_by_name: string
          memorial_page_id?: string | null
          message?: string | null
          obituary_id?: string | null
        }
        Update: {
          created_at?: string
          duration_hours?: number | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          lit_at?: string
          lit_by_email?: string | null
          lit_by_name?: string
          memorial_page_id?: string | null
          message?: string | null
          obituary_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dde_candles_memorial_page_id_fkey"
            columns: ["memorial_page_id"]
            isOneToOne: false
            referencedRelation: "dde_memorial_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dde_candles_obituary_id_fkey"
            columns: ["obituary_id"]
            isOneToOne: false
            referencedRelation: "dde_obituaries"
            referencedColumns: ["id"]
          },
        ]
      }
      dde_condolences: {
        Row: {
          author_email: string | null
          author_name: string
          created_at: string | null
          id: string
          is_moderated: boolean | null
          is_public: boolean | null
          memorial_page_id: string | null
          message: string
          moderation_status: string | null
        }
        Insert: {
          author_email?: string | null
          author_name: string
          created_at?: string | null
          id?: string
          is_moderated?: boolean | null
          is_public?: boolean | null
          memorial_page_id?: string | null
          message: string
          moderation_status?: string | null
        }
        Update: {
          author_email?: string | null
          author_name?: string
          created_at?: string | null
          id?: string
          is_moderated?: boolean | null
          is_public?: boolean | null
          memorial_page_id?: string | null
          message?: string
          moderation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dde_condolences_memorial_page_id_fkey"
            columns: ["memorial_page_id"]
            isOneToOne: false
            referencedRelation: "dde_memorial_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      dde_email_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          email_address: string
          error_message: string | null
          html_content: string
          id: string
          last_attempt_at: string | null
          max_attempts: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_data: Json | null
          template_name: string | null
          text_content: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          email_address: string
          error_message?: string | null
          html_content: string
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_data?: Json | null
          template_name?: string | null
          text_content?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          email_address?: string
          error_message?: string | null
          html_content?: string
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_data?: Json | null
          template_name?: string | null
          text_content?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dde_email_templates: {
        Row: {
          created_at: string | null
          html_template: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          text_template: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          html_template: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          text_template?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          html_template?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          text_template?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      dde_memorial_pages: {
        Row: {
          birth_date: string
          birth_maiden_name: string | null
          birth_place: string | null
          birth_year: number | null
          cause_of_death: string | null
          created_at: string | null
          death_date: string
          death_place: string | null
          deceased_first_name: string
          deceased_last_name: string
          deleted_at: string | null
          family_members: Json | null
          gender: string | null
          hero_background_url: string | null
          id: string
          is_deleted: boolean | null
          is_moderated: boolean | null
          is_published: boolean | null
          life_events: Json | null
          life_story: string | null
          location: string | null
          main_photo_url: string | null
          memorial_text: string | null
          moderation_status: string | null
          payment_required: boolean | null
          payment_status: string | null
          photo_gallery: Json | null
          published_at: string | null
          published_until: string | null
          publishing_duration_days: number | null
          publishing_fee: number | null
          relationship_status: string | null
          updated_at: string | null
          user_id: string | null
          visitor_count: number | null
        }
        Insert: {
          birth_date: string
          birth_maiden_name?: string | null
          birth_place?: string | null
          birth_year?: number | null
          cause_of_death?: string | null
          created_at?: string | null
          death_date: string
          death_place?: string | null
          deceased_first_name: string
          deceased_last_name: string
          deleted_at?: string | null
          family_members?: Json | null
          gender?: string | null
          hero_background_url?: string | null
          id?: string
          is_deleted?: boolean | null
          is_moderated?: boolean | null
          is_published?: boolean | null
          life_events?: Json | null
          life_story?: string | null
          location?: string | null
          main_photo_url?: string | null
          memorial_text?: string | null
          moderation_status?: string | null
          payment_required?: boolean | null
          payment_status?: string | null
          photo_gallery?: Json | null
          published_at?: string | null
          published_until?: string | null
          publishing_duration_days?: number | null
          publishing_fee?: number | null
          relationship_status?: string | null
          updated_at?: string | null
          user_id?: string | null
          visitor_count?: number | null
        }
        Update: {
          birth_date?: string
          birth_maiden_name?: string | null
          birth_place?: string | null
          birth_year?: number | null
          cause_of_death?: string | null
          created_at?: string | null
          death_date?: string
          death_place?: string | null
          deceased_first_name?: string
          deceased_last_name?: string
          deleted_at?: string | null
          family_members?: Json | null
          gender?: string | null
          hero_background_url?: string | null
          id?: string
          is_deleted?: boolean | null
          is_moderated?: boolean | null
          is_published?: boolean | null
          life_events?: Json | null
          life_story?: string | null
          location?: string | null
          main_photo_url?: string | null
          memorial_text?: string | null
          moderation_status?: string | null
          payment_required?: boolean | null
          payment_status?: string | null
          photo_gallery?: Json | null
          published_at?: string | null
          published_until?: string | null
          publishing_duration_days?: number | null
          publishing_fee?: number | null
          relationship_status?: string | null
          updated_at?: string | null
          user_id?: string | null
          visitor_count?: number | null
        }
        Relationships: []
      }
      dde_memorial_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          is_moderated: boolean | null
          memorial_page_id: string | null
          photo_url: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_moderated?: boolean | null
          memorial_page_id?: string | null
          photo_url: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_moderated?: boolean | null
          memorial_page_id?: string | null
          photo_url?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dde_memorial_photos_memorial_page_id_fkey"
            columns: ["memorial_page_id"]
            isOneToOne: false
            referencedRelation: "dde_memorial_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      dde_memorial_visits: {
        Row: {
          id: string
          memorial_page_id: string | null
          visited_at: string | null
          visitor_ip: string | null
        }
        Insert: {
          id?: string
          memorial_page_id?: string | null
          visited_at?: string | null
          visitor_ip?: string | null
        }
        Update: {
          id?: string
          memorial_page_id?: string | null
          visited_at?: string | null
          visitor_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dde_memorial_visits_memorial_page_id_fkey"
            columns: ["memorial_page_id"]
            isOneToOne: false
            referencedRelation: "dde_memorial_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      dde_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_email_sent: boolean | null
          is_read: boolean | null
          message: string
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_email_sent?: boolean | null
          is_read?: boolean | null
          message: string
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_email_sent?: boolean | null
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dde_obituaries: {
        Row: {
          additional_texts: string | null
          background_image: string | null
          background_opacity: number | null
          birth_date: string
          birth_maiden_name: string | null
          birth_place: string | null
          birth_year: number | null
          cause_of_death: string | null
          color_theme: string | null
          created_at: string
          custom_color: string | null
          death_date: string
          death_place: string | null
          deceased_additional_name: string | null
          deceased_first_name: string
          deceased_last_name: string
          deleted_at: string | null
          family_members: Json | null
          font_family: string | null
          frame_style: string | null
          gender: string | null
          id: string
          introduction: string | null
          is_deleted: boolean | null
          is_published: boolean | null
          last_residence: string | null
          letter_spacing: number | null
          life_events: Json | null
          line_height: number | null
          location_date: string | null
          main_text: string | null
          orientation: string | null
          payment_required: boolean | null
          payment_status: string | null
          photo_url: string | null
          published_at: string | null
          published_duration_days: number | null
          published_until: string | null
          publishing_fee: number | null
          relationship_status: string | null
          side_texts: string | null
          symbol_image: string | null
          text_align: string | null
          trauerspruch: string | null
          updated_at: string
          user_id: string | null
          views_count: number | null
        }
        Insert: {
          additional_texts?: string | null
          background_image?: string | null
          background_opacity?: number | null
          birth_date: string
          birth_maiden_name?: string | null
          birth_place?: string | null
          birth_year?: number | null
          cause_of_death?: string | null
          color_theme?: string | null
          created_at?: string
          custom_color?: string | null
          death_date: string
          death_place?: string | null
          deceased_additional_name?: string | null
          deceased_first_name: string
          deceased_last_name: string
          deleted_at?: string | null
          family_members?: Json | null
          font_family?: string | null
          frame_style?: string | null
          gender?: string | null
          id?: string
          introduction?: string | null
          is_deleted?: boolean | null
          is_published?: boolean | null
          last_residence?: string | null
          letter_spacing?: number | null
          life_events?: Json | null
          line_height?: number | null
          location_date?: string | null
          main_text?: string | null
          orientation?: string | null
          payment_required?: boolean | null
          payment_status?: string | null
          photo_url?: string | null
          published_at?: string | null
          published_duration_days?: number | null
          published_until?: string | null
          publishing_fee?: number | null
          relationship_status?: string | null
          side_texts?: string | null
          symbol_image?: string | null
          text_align?: string | null
          trauerspruch?: string | null
          updated_at?: string
          user_id?: string | null
          views_count?: number | null
        }
        Update: {
          additional_texts?: string | null
          background_image?: string | null
          background_opacity?: number | null
          birth_date?: string
          birth_maiden_name?: string | null
          birth_place?: string | null
          birth_year?: number | null
          cause_of_death?: string | null
          color_theme?: string | null
          created_at?: string
          custom_color?: string | null
          death_date?: string
          death_place?: string | null
          deceased_additional_name?: string | null
          deceased_first_name?: string
          deceased_last_name?: string
          deleted_at?: string | null
          family_members?: Json | null
          font_family?: string | null
          frame_style?: string | null
          gender?: string | null
          id?: string
          introduction?: string | null
          is_deleted?: boolean | null
          is_published?: boolean | null
          last_residence?: string | null
          letter_spacing?: number | null
          life_events?: Json | null
          line_height?: number | null
          location_date?: string | null
          main_text?: string | null
          orientation?: string | null
          payment_required?: boolean | null
          payment_status?: string | null
          photo_url?: string | null
          published_at?: string | null
          published_duration_days?: number | null
          published_until?: string | null
          publishing_fee?: number | null
          relationship_status?: string | null
          side_texts?: string | null
          symbol_image?: string | null
          text_align?: string | null
          trauerspruch?: string | null
          updated_at?: string
          user_id?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      dde_orders: {
        Row: {
          billing_address: Json | null
          completed_at: string | null
          created_at: string
          currency: string | null
          id: string
          items: Json
          order_number: string
          payment_method: string | null
          payment_status: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          items?: Json
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          items?: Json
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dde_payment_methods: {
        Row: {
          card_brand: string | null
          created_at: string
          expiry_month: number | null
          expiry_year: number | null
          external_id: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          last_four_digits: string | null
          provider: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          created_at?: string
          expiry_month?: number | null
          expiry_year?: number | null
          external_id?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_four_digits?: string | null
          provider?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_brand?: string | null
          created_at?: string
          expiry_month?: number | null
          expiry_year?: number | null
          external_id?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_four_digits?: string | null
          provider?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dde_user_profiles: {
        Row: {
          account_status: string | null
          city: string | null
          country: string | null
          created_at: string
          data_processing_consent: boolean | null
          date_of_birth: string | null
          display_name: string | null
          email_verified: boolean | null
          first_name: string | null
          id: string
          language: string | null
          last_login_at: string | null
          last_name: string | null
          marketing_emails: boolean | null
          newsletter_subscription: boolean | null
          notifications_enabled: boolean | null
          phone: string | null
          phone_verified: boolean | null
          postal_code: string | null
          preferred_contact_method: string | null
          profile_visibility: string | null
          street_address: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          data_processing_consent?: boolean | null
          date_of_birth?: string | null
          display_name?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_login_at?: string | null
          last_name?: string | null
          marketing_emails?: boolean | null
          newsletter_subscription?: boolean | null
          notifications_enabled?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          postal_code?: string | null
          preferred_contact_method?: string | null
          profile_visibility?: string | null
          street_address?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          data_processing_consent?: boolean | null
          date_of_birth?: string | null
          display_name?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_login_at?: string | null
          last_name?: string | null
          marketing_emails?: boolean | null
          newsletter_subscription?: boolean | null
          notifications_enabled?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          postal_code?: string | null
          preferred_contact_method?: string | null
          profile_visibility?: string | null
          street_address?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_dde_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "moderator" | "user"
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
      user_role: ["admin", "moderator", "user"],
    },
  },
} as const
