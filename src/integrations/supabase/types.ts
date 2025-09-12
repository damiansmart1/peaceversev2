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
      achievements: {
        Row: {
          badge_icon: string
          category: string
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          name: string
          points_required: number
        }
        Insert: {
          badge_icon: string
          category: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          name: string
          points_required: number
        }
        Update: {
          badge_icon?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          points_required?: number
        }
        Relationships: []
      }
      comments: {
        Row: {
          content_id: string
          created_at: string
          id: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          created_at: string
          description: string | null
          file_type: string
          file_url: string
          id: string
          like_count: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_type: string
          file_url: string
          id?: string
          like_count?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_type?: string
          file_url?: string
          id?: string
          like_count?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      content_moderation: {
        Row: {
          ai_confidence_score: number | null
          comment_id: string | null
          content_id: string | null
          created_at: string
          flag_description: string | null
          flag_reason: string
          flagged_by: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          ai_confidence_score?: number | null
          comment_id?: string | null
          content_id?: string | null
          created_at?: string
          flag_description?: string | null
          flag_reason: string
          flagged_by?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          ai_confidence_score?: number | null
          comment_id?: string | null
          content_id?: string | null
          created_at?: string
          flag_description?: string | null
          flag_reason?: string
          flagged_by?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_moderation_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_moderation_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          content_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      peace_actions: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          points_awarded: number | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          points_awarded?: number | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          points_awarded?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accessibility_needs: Json | null
          age_group: string | null
          anonymous_mode: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          is_peace_champion: boolean | null
          is_verified: boolean | null
          location: string | null
          peace_points: number | null
          preferred_language: string | null
          total_actions: number | null
          total_stories: number | null
          updated_at: string
          user_id: string
          user_type: string | null
          username: string | null
        }
        Insert: {
          accessibility_needs?: Json | null
          age_group?: string | null
          anonymous_mode?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_peace_champion?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          peace_points?: number | null
          preferred_language?: string | null
          total_actions?: number | null
          total_stories?: number | null
          updated_at?: string
          user_id: string
          user_type?: string | null
          username?: string | null
        }
        Update: {
          accessibility_needs?: Json | null
          age_group?: string | null
          anonymous_mode?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_peace_champion?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          peace_points?: number | null
          preferred_language?: string | null
          total_actions?: number | null
          total_stories?: number | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
          username?: string | null
        }
        Relationships: []
      }
      safe_spaces: {
        Row: {
          active_users_count: number | null
          contact_info: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          latitude: number | null
          location_name: string
          longitude: number | null
          name: string
          space_type: string
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          active_users_count?: number | null
          contact_info?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          location_name: string
          longitude?: number | null
          name: string
          space_type: string
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          active_users_count?: number | null
          contact_info?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          location_name?: string
          longitude?: number | null
          name?: string
          space_type?: string
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
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
  public: {
    Enums: {},
  },
} as const
