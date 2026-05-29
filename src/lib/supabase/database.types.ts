export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      commissions: {
        Row: {
          collected_by: string | null
          commission_amount: number
          commission_rate: number
          created_at: string
          deal_amount: number
          id: string
          listing_id: string
          listing_type: Database["public"]["Enums"]["listing_type"]
          notes: string | null
          payment_reference: string | null
          request_id: string | null
          status: Database["public"]["Enums"]["commission_status"]
        }
        Insert: {
          collected_by?: string | null
          commission_amount: number
          commission_rate: number
          created_at?: string
          deal_amount: number
          id?: string
          listing_id: string
          listing_type: Database["public"]["Enums"]["listing_type"]
          notes?: string | null
          payment_reference?: string | null
          request_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
        }
        Update: {
          collected_by?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          deal_amount?: number
          id?: string
          listing_id?: string
          listing_type?: Database["public"]["Enums"]["listing_type"]
          notes?: string | null
          payment_reference?: string | null
          request_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
        }
        Relationships: [
          {
            foreignKeyName: "commissions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_primary: boolean
          listing_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean
          listing_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean
          listing_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          admin_notes: string | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string
          currency: string
          deleted_at: string | null
          description: string | null
          details: Json
          id: string
          is_featured: boolean
          latitude: number | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          location_detail: string | null
          longitude: number | null
          owner_id: string
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          security_deposit_amount: number | null
          status: Database["public"]["Enums"]["listing_status"]
          sub_city: string | null
          tiktok_video_url: string | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          admin_notes?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          details?: Json
          id?: string
          is_featured?: boolean
          latitude?: number | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          location_detail?: string | null
          longitude?: number | null
          owner_id: string
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          security_deposit_amount?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          sub_city?: string | null
          tiktok_video_url?: string | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          admin_notes?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          details?: Json
          id?: string
          is_featured?: boolean
          latitude?: number | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          location_detail?: string | null
          longitude?: number | null
          owner_id?: string
          price?: number
          property_type?: Database["public"]["Enums"]["property_type"]
          security_deposit_amount?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          sub_city?: string | null
          tiktok_video_url?: string | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_name: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      request_events: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          is_admin_action: boolean
          new_status: Database["public"]["Enums"]["request_status"]
          note: string | null
          old_status: Database["public"]["Enums"]["request_status"] | null
          request_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          is_admin_action?: boolean
          new_status: Database["public"]["Enums"]["request_status"]
          note?: string | null
          old_status?: Database["public"]["Enums"]["request_status"] | null
          request_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          is_admin_action?: boolean
          new_status?: Database["public"]["Enums"]["request_status"]
          note?: string | null
          old_status?: Database["public"]["Enums"]["request_status"] | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          end_date: string | null
          id: string
          listing_id: string
          message: string | null
          name: string
          offered_price: number | null
          owner_response_notes: string | null
          phone: string
          phone_verified: boolean
          request_type: Database["public"]["Enums"]["request_type"]
          start_date: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          end_date?: string | null
          id?: string
          listing_id: string
          message?: string | null
          name: string
          offered_price?: number | null
          owner_response_notes?: string | null
          phone: string
          phone_verified?: boolean
          request_type: Database["public"]["Enums"]["request_type"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          end_date?: string | null
          id?: string
          listing_id?: string
          message?: string | null
          name?: string
          offered_price?: number | null
          owner_response_notes?: string | null
          phone?: string
          phone_verified?: boolean
          request_type?: Database["public"]["Enums"]["request_type"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_listings: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      security_deposits: {
        Row: {
          admin_notes: string | null
          collected_at: string | null
          collected_by: string | null
          created_at: string
          deposit_amount: number
          deposit_status: Database["public"]["Enums"]["deposit_status"]
          id: string
          listing_id: string
          payment_method: string | null
          payment_reference: string | null
          request_id: string
          returned_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          collected_at?: string | null
          collected_by?: string | null
          created_at?: string
          deposit_amount: number
          deposit_status?: Database["public"]["Enums"]["deposit_status"]
          id?: string
          listing_id: string
          payment_method?: string | null
          payment_reference?: string | null
          request_id: string
          returned_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          collected_at?: string | null
          collected_by?: string | null
          created_at?: string
          deposit_amount?: number
          deposit_status?: Database["public"]["Enums"]["deposit_status"]
          id?: string
          listing_id?: string
          payment_method?: string | null
          payment_reference?: string | null
          request_id?: string
          returned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_deposits_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_deposits_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_owner_of: { Args: { lid: string }; Returns: boolean }
    }
    Enums: {
      app_role: "user" | "owner" | "admin"
      commission_status: "pending" | "collected" | "waived"
      deposit_status: "pending" | "collected" | "returned" | "forfeited"
      listing_status:
        | "draft"
        | "pending_review"
        | "published"
        | "rejected"
        | "archived"
      listing_type: "rent" | "sale"
      property_type:
        | "apartment"
        | "house"
        | "villa"
        | "condominium"
        | "studio"
        | "land"
        | "commercial"
        | "warehouse"
        | "vehicle"
      request_status:
        | "new"
        | "admin_reviewing"
        | "owner_contacted"
        | "owner_responded"
        | "confirmed"
        | "completed"
        | "rejected"
        | "cancelled"
      request_type: "rental" | "purchase" | "viewing" | "info"
      verification_status: "unverified" | "pending" | "verified" | "suspended"
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
    Enums: {
      app_role: ["user", "owner", "admin"],
      commission_status: ["pending", "collected", "waived"],
      deposit_status: ["pending", "collected", "returned", "forfeited"],
      listing_status: [
        "draft",
        "pending_review",
        "published",
        "rejected",
        "archived",
      ],
      listing_type: ["rent", "sale"],
      property_type: [
        "apartment",
        "house",
        "villa",
        "condominium",
        "studio",
        "land",
        "commercial",
        "warehouse",
        "vehicle",
      ],
      request_status: [
        "new",
        "admin_reviewing",
        "owner_contacted",
        "owner_responded",
        "confirmed",
        "completed",
        "rejected",
        "cancelled",
      ],
      request_type: ["rental", "purchase", "viewing", "info"],
      verification_status: ["unverified", "pending", "verified", "suspended"],
    },
  },
} as const

