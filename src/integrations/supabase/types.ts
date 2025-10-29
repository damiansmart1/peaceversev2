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
          is_archived: boolean | null
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
          is_archived?: boolean | null
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
          is_archived?: boolean | null
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
      moderation_actions: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          metadata: Json | null
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      moderation_flags: {
        Row: {
          comment_id: string | null
          created_at: string
          flag_description: string | null
          flag_reason: string
          flagged_by: string
          id: string
          proposal_id: string | null
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["moderation_status"]
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          flag_description?: string | null
          flag_reason: string
          flagged_by: string
          id?: string
          proposal_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["moderation_status"]
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          flag_description?: string | null
          flag_reason?: string
          flagged_by?: string
          id?: string
          proposal_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["moderation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "moderation_flags_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "proposal_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_flags_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
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
      proposal_comments: {
        Row: {
          attachments: Json | null
          body: string
          created_at: string
          display_anonymous: boolean
          id: string
          is_edited: boolean | null
          is_pinned: boolean | null
          like_count: number | null
          parent_comment_id: string | null
          proposal_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          body: string
          created_at?: string
          display_anonymous?: boolean
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          parent_comment_id?: string | null
          proposal_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          body?: string
          created_at?: string
          display_anonymous?: boolean
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          parent_comment_id?: string | null
          proposal_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "proposal_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_comments_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          metadata: Json | null
          proposal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          metadata?: Json | null
          proposal_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: Database["public"]["Enums"]["interaction_type"]
          metadata?: Json | null
          proposal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_interactions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_poll_responses: {
        Row: {
          created_at: string | null
          display_anonymous: boolean | null
          id: string
          option_index: number
          poll_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_anonymous?: boolean | null
          id?: string
          option_index: number
          poll_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_anonymous?: boolean | null
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_poll_responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "proposal_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_polls: {
        Row: {
          allow_multiple: boolean | null
          created_at: string | null
          created_by: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          options: Json
          proposal_id: string
          question: string
        }
        Insert: {
          allow_multiple?: boolean | null
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          proposal_id: string
          question: string
        }
        Update: {
          allow_multiple?: boolean | null
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          proposal_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_polls_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_shares: {
        Row: {
          created_at: string
          id: string
          platform: string
          proposal_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          proposal_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          proposal_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_shares_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_versions: {
        Row: {
          body: string
          change_description: string | null
          created_at: string
          edited_by: string | null
          id: string
          proposal_id: string
          summary: string
          title: string
          version_number: number
        }
        Insert: {
          body: string
          change_description?: string | null
          created_at?: string
          edited_by?: string | null
          id?: string
          proposal_id: string
          summary: string
          title: string
          version_number: number
        }
        Update: {
          body?: string
          change_description?: string | null
          created_at?: string
          edited_by?: string | null
          id?: string
          proposal_id?: string
          summary?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_versions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_votes: {
        Row: {
          created_at: string
          display_anonymous: boolean
          id: string
          location_hidden: boolean
          proposal_id: string
          updated_at: string
          user_id: string | null
          vote_value: number
        }
        Insert: {
          created_at?: string
          display_anonymous?: boolean
          id?: string
          location_hidden?: boolean
          proposal_id: string
          updated_at?: string
          user_id?: string | null
          vote_value: number
        }
        Update: {
          created_at?: string
          display_anonymous?: boolean
          id?: string
          location_hidden?: boolean
          proposal_id?: string
          updated_at?: string
          user_id?: string | null
          vote_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          attachments: Json | null
          author_id: string
          body: string
          co_authors: string[] | null
          comment_count: number | null
          created_at: string
          end_at: string | null
          id: string
          is_archived: boolean | null
          like_count: number | null
          metadata: Json | null
          share_count: number | null
          signature_count: number | null
          signature_goal: number | null
          slug: string
          start_at: string | null
          status: Database["public"]["Enums"]["proposal_status"]
          summary: string
          tags: string[] | null
          title: string
          unique_contributors: number | null
          updated_at: string
          view_count: number | null
          vote_oppose_count: number | null
          vote_support_count: number | null
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          body: string
          co_authors?: string[] | null
          comment_count?: number | null
          created_at?: string
          end_at?: string | null
          id?: string
          is_archived?: boolean | null
          like_count?: number | null
          metadata?: Json | null
          share_count?: number | null
          signature_count?: number | null
          signature_goal?: number | null
          slug: string
          start_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          summary: string
          tags?: string[] | null
          title: string
          unique_contributors?: number | null
          updated_at?: string
          view_count?: number | null
          vote_oppose_count?: number | null
          vote_support_count?: number | null
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          body?: string
          co_authors?: string[] | null
          comment_count?: number | null
          created_at?: string
          end_at?: string | null
          id?: string
          is_archived?: boolean | null
          like_count?: number | null
          metadata?: Json | null
          share_count?: number | null
          signature_count?: number | null
          signature_goal?: number | null
          slug?: string
          start_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          summary?: string
          tags?: string[] | null
          title?: string
          unique_contributors?: number | null
          updated_at?: string
          view_count?: number | null
          vote_oppose_count?: number | null
          vote_support_count?: number | null
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
          is_archived: boolean | null
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
          is_archived?: boolean | null
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
          is_archived?: boolean | null
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
      generate_proposal_slug: { Args: { title: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      interaction_type: "like" | "support" | "oppose" | "idea" | "bookmark"
      moderation_status: "pending" | "approved" | "rejected" | "flagged"
      proposal_status: "draft" | "published" | "closed" | "archived"
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
      app_role: ["admin", "moderator", "user"],
      interaction_type: ["like", "support", "oppose", "idea", "bookmark"],
      moderation_status: ["pending", "approved", "rejected", "flagged"],
      proposal_status: ["draft", "published", "closed", "archived"],
    },
  },
} as const
