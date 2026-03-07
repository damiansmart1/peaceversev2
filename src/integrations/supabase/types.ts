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
      achievements: {
        Row: {
          badge_icon: string
          category: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          name: string
          points_required: number
          points_reward: number
        }
        Insert: {
          badge_icon?: string
          category?: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          name: string
          points_required?: number
          points_reward?: number
        }
        Update: {
          badge_icon?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          points_required?: number
          points_reward?: number
        }
        Relationships: []
      }
      actor_networks: {
        Row: {
          activity_timeline: Json | null
          actors: Json
          centrality_scores: Json | null
          countries_involved: string[] | null
          created_at: string | null
          expansion_trend: string | null
          first_observed: string | null
          id: string
          influence_map: Json | null
          key_actors: Json | null
          last_activity: string | null
          network_name: string | null
          network_threat_level: string | null
          network_type: string | null
          primary_locations: string[] | null
          relationships: Json
          updated_at: string | null
        }
        Insert: {
          activity_timeline?: Json | null
          actors: Json
          centrality_scores?: Json | null
          countries_involved?: string[] | null
          created_at?: string | null
          expansion_trend?: string | null
          first_observed?: string | null
          id?: string
          influence_map?: Json | null
          key_actors?: Json | null
          last_activity?: string | null
          network_name?: string | null
          network_threat_level?: string | null
          network_type?: string | null
          primary_locations?: string[] | null
          relationships: Json
          updated_at?: string | null
        }
        Update: {
          activity_timeline?: Json | null
          actors?: Json
          centrality_scores?: Json | null
          countries_involved?: string[] | null
          created_at?: string | null
          expansion_trend?: string | null
          first_observed?: string | null
          id?: string
          influence_map?: Json | null
          key_actors?: Json | null
          last_activity?: string | null
          network_name?: string | null
          network_threat_level?: string | null
          network_type?: string | null
          primary_locations?: string[] | null
          relationships?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      african_countries: {
        Row: {
          area_km2: number | null
          capital: string | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          official_languages: string[] | null
          population: number | null
          regional_block_id: string | null
          updated_at: string | null
        }
        Insert: {
          area_km2?: number | null
          capital?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          official_languages?: string[] | null
          population?: number | null
          regional_block_id?: string | null
          updated_at?: string | null
        }
        Update: {
          area_km2?: number | null
          capital?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          official_languages?: string[] | null
          population?: number | null
          regional_block_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "african_countries_regional_block_id_fkey"
            columns: ["regional_block_id"]
            isOneToOne: false
            referencedRelation: "regional_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analysis_logs: {
        Row: {
          analysis_type: Database["public"]["Enums"]["ai_analysis_type"]
          confidence_score: number | null
          created_at: string | null
          detected_entities: Json | null
          id: string
          input_data: Json | null
          ip_address: string | null
          model_used: string
          model_version: string | null
          output_data: Json
          processing_time_ms: number | null
          report_id: string | null
          risk_indicators: Json | null
          security_flags: Json | null
          sentiment_breakdown: Json | null
          user_id: string | null
          validation_status: string | null
        }
        Insert: {
          analysis_type: Database["public"]["Enums"]["ai_analysis_type"]
          confidence_score?: number | null
          created_at?: string | null
          detected_entities?: Json | null
          id?: string
          input_data?: Json | null
          ip_address?: string | null
          model_used: string
          model_version?: string | null
          output_data: Json
          processing_time_ms?: number | null
          report_id?: string | null
          risk_indicators?: Json | null
          security_flags?: Json | null
          sentiment_breakdown?: Json | null
          user_id?: string | null
          validation_status?: string | null
        }
        Update: {
          analysis_type?: Database["public"]["Enums"]["ai_analysis_type"]
          confidence_score?: number | null
          created_at?: string | null
          detected_entities?: Json | null
          id?: string
          input_data?: Json | null
          ip_address?: string | null
          model_used?: string
          model_version?: string | null
          output_data?: Json
          processing_time_ms?: number | null
          report_id?: string | null
          risk_indicators?: Json | null
          security_flags?: Json | null
          sentiment_breakdown?: Json | null
          user_id?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_logs_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analysis_logs_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analytics_summary: {
        Row: {
          analysis_type_breakdown: Json | null
          average_confidence: number | null
          average_processing_time_ms: number | null
          created_at: string | null
          critical_detections: number | null
          date: string
          flagged_count: number | null
          high_confidence_count: number | null
          id: string
          low_confidence_count: number | null
          model_usage_stats: Json | null
          total_analyses: number | null
          updated_at: string | null
        }
        Insert: {
          analysis_type_breakdown?: Json | null
          average_confidence?: number | null
          average_processing_time_ms?: number | null
          created_at?: string | null
          critical_detections?: number | null
          date?: string
          flagged_count?: number | null
          high_confidence_count?: number | null
          id?: string
          low_confidence_count?: number | null
          model_usage_stats?: Json | null
          total_analyses?: number | null
          updated_at?: string | null
        }
        Update: {
          analysis_type_breakdown?: Json | null
          average_confidence?: number | null
          average_processing_time_ms?: number | null
          created_at?: string | null
          critical_detections?: number | null
          date?: string
          flagged_count?: number | null
          high_confidence_count?: number | null
          id?: string
          low_confidence_count?: number | null
          model_usage_stats?: Json | null
          total_analyses?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_governance_registry: {
        Row: {
          created_at: string | null
          description: string
          id: string
          last_reviewed: string | null
          mitigation_strategies: string[] | null
          monitoring_metrics: Json | null
          risk_category: string
          risk_name: string
          severity: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          last_reviewed?: string | null
          mitigation_strategies?: string[] | null
          monitoring_metrics?: Json | null
          risk_category: string
          risk_name: string
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          last_reviewed?: string | null
          mitigation_strategies?: string[] | null
          monitoring_metrics?: Json | null
          risk_category?: string
          risk_name?: string
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_report_exports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          date_range: Json
          error_message: string | null
          expires_at: string | null
          file_url: string | null
          filters: Json | null
          generated_by: string
          id: string
          record_count: number | null
          report_type: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          date_range: Json
          error_message?: string | null
          expires_at?: string | null
          file_url?: string | null
          filters?: Json | null
          generated_by: string
          id?: string
          record_count?: number | null
          report_type: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          date_range?: Json
          error_message?: string | null
          expires_at?: string | null
          file_url?: string | null
          filters?: Json | null
          generated_by?: string
          id?: string
          record_count?: number | null
          report_type?: string
          status?: string | null
        }
        Relationships: []
      }
      alert_logs: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_rule_id: string | null
          alert_type: string
          channels_sent: string[] | null
          context_data: Json | null
          correlation_ids: string[] | null
          hotspot_ids: string[] | null
          id: string
          incident_ids: string[] | null
          message: string
          recipients: string[] | null
          severity: string
          status: string | null
          title: string
          triggered_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_rule_id?: string | null
          alert_type: string
          channels_sent?: string[] | null
          context_data?: Json | null
          correlation_ids?: string[] | null
          hotspot_ids?: string[] | null
          id?: string
          incident_ids?: string[] | null
          message: string
          recipients?: string[] | null
          severity: string
          status?: string | null
          title: string
          triggered_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_rule_id?: string | null
          alert_type?: string
          channels_sent?: string[] | null
          context_data?: Json | null
          correlation_ids?: string[] | null
          hotspot_ids?: string[] | null
          id?: string
          incident_ids?: string[] | null
          message?: string
          recipients?: string[] | null
          severity?: string
          status?: string | null
          title?: string
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_logs_alert_rule_id_fkey"
            columns: ["alert_rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          cooldown_minutes: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          geographic_scope: string[] | null
          id: string
          is_active: boolean | null
          max_alerts_per_day: number | null
          name: string
          notification_channels: string[] | null
          recipient_roles: string[] | null
          recipient_users: string[] | null
          severity: string
          threshold_value: number | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          cooldown_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          geographic_scope?: string[] | null
          id?: string
          is_active?: boolean | null
          max_alerts_per_day?: number | null
          name: string
          notification_channels?: string[] | null
          recipient_roles?: string[] | null
          recipient_users?: string[] | null
          severity: string
          threshold_value?: number | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          cooldown_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          geographic_scope?: string[] | null
          id?: string
          is_active?: boolean | null
          max_alerts_per_day?: number | null
          name?: string
          notification_channels?: string[] | null
          recipient_roles?: string[] | null
          recipient_users?: string[] | null
          severity?: string
          threshold_value?: number | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_name: string | null
          permissions: Json | null
          rate_limit_per_minute: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_name?: string | null
          permissions?: Json | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_name?: string | null
          permissions?: Json | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          response_status: number | null
          response_time_ms: number | null
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: string | null
          method: string
          response_status?: number | null
          response_time_ms?: number | null
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          response_status?: number | null
          response_time_ms?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_acknowledgments: {
        Row: {
          acknowledged_at: string | null
          acknowledgment_note: string | null
          broadcast_id: string
          id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledgment_note?: string | null
          broadcast_id: string
          id?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledgment_note?: string | null
          broadcast_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_acknowledgments_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcast_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_alerts: {
        Row: {
          acknowledgment_deadline: string | null
          alert_type: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          delivery_stats: Json | null
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          requires_acknowledgment: boolean | null
          sent_at: string | null
          severity: Database["public"]["Enums"]["alert_severity_level"]
          status: string | null
          target_countries: string[] | null
          target_regions: string[] | null
          target_roles: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          acknowledgment_deadline?: string | null
          alert_type?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_stats?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          requires_acknowledgment?: boolean | null
          sent_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity_level"]
          status?: string | null
          target_countries?: string[] | null
          target_regions?: string[] | null
          target_roles?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          acknowledgment_deadline?: string | null
          alert_type?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_stats?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          requires_acknowledgment?: boolean | null
          sent_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity_level"]
          status?: string | null
          target_countries?: string[] | null
          target_regions?: string[] | null
          target_roles?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          points_awarded: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submission_text: string | null
          submission_type: string
          submission_url: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          points_awarded?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_text?: string | null
          submission_type?: string
          submission_url?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          points_awarded?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_text?: string | null
          submission_type?: string
          submission_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string | null
          last_read_at: string | null
          notification_enabled: boolean | null
          role: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          notification_enabled?: boolean | null
          role?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          notification_enabled?: boolean | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_messages: {
        Row: {
          attachments: Json | null
          channel_id: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          mentions: string[] | null
          message_type: string | null
          metadata: Json | null
          priority: Database["public"]["Enums"]["alert_severity_level"] | null
          reply_to: string | null
          sender_id: string | null
          status: Database["public"]["Enums"]["comm_message_status"] | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          channel_id: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          mentions?: string[] | null
          message_type?: string | null
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["alert_severity_level"] | null
          reply_to?: string | null
          sender_id?: string | null
          status?: Database["public"]["Enums"]["comm_message_status"] | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          channel_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          mentions?: string[] | null
          message_type?: string | null
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["alert_severity_level"] | null
          reply_to?: string | null
          sender_id?: string | null
          status?: Database["public"]["Enums"]["comm_message_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "channel_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chatroom_members: {
        Row: {
          chatroom_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          chatroom_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          chatroom_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatroom_members_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chatroom_messages: {
        Row: {
          chatroom_id: string
          content: string
          created_at: string
          id: string
          media_url: string | null
          user_id: string
        }
        Insert: {
          chatroom_id: string
          content: string
          created_at?: string
          id?: string
          media_url?: string | null
          user_id: string
        }
        Update: {
          chatroom_id?: string
          content?: string
          created_at?: string
          id?: string
          media_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatroom_messages_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chatrooms: {
        Row: {
          category: string
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          location_region: string | null
          max_members: number | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          location_region?: string | null
          max_members?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          location_region?: string | null
          max_members?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      citizen_reports: {
        Row: {
          ai_key_entities: Json | null
          ai_sentiment: string | null
          ai_threat_level: string | null
          assistance_provider: string | null
          assistance_received: boolean | null
          assistance_type: string[] | null
          authorities_notified: boolean | null
          authorities_responded: boolean | null
          authority_response_details: string | null
          casualties_reported: number | null
          category: string
          children_involved: boolean | null
          community_impact_level: string | null
          community_response: string | null
          confidential_notes: string | null
          created_at: string | null
          credibility_score: number | null
          description: string
          duration_minutes: number | null
          economic_impact_estimate: number | null
          engagement_score: number | null
          estimated_people_affected: number | null
          evidence_description: string | null
          first_occurrence: boolean | null
          follow_up_contact_consent: boolean | null
          follow_up_required: boolean | null
          has_physical_evidence: boolean | null
          has_witnesses: boolean | null
          historical_context: string | null
          id: string
          immediate_actions_taken: string[] | null
          immediate_needs: string[] | null
          incident_date: string | null
          incident_time: string | null
          infrastructure_damage: string[] | null
          injuries_reported: number | null
          is_anonymous: boolean | null
          language: string | null
          last_activity_at: string | null
          location_accuracy: string | null
          location_address: string | null
          location_city: string | null
          location_country: string | null
          location_latitude: number | null
          location_longitude: number | null
          location_name: string | null
          location_postal_code: string | null
          location_region: string | null
          location_type: string | null
          media_types: string[] | null
          media_urls: string[] | null
          perpetrator_description: string | null
          perpetrator_type: string | null
          preferred_contact_method: string | null
          previous_reports_filed: boolean | null
          recurring_issue: boolean | null
          related_incidents: string[] | null
          reporter_contact_email: string | null
          reporter_contact_phone: string | null
          reporter_id: string | null
          resolution_date: string | null
          resolution_notes: string | null
          resolution_status: string | null
          services_disrupted: string[] | null
          severity_level: string | null
          share_count: number | null
          source: string | null
          status: string | null
          sub_category: string | null
          tags: string[] | null
          title: string
          translated_from: string | null
          updated_at: string | null
          urgency_level: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          view_count: number | null
          visibility: string | null
          vulnerable_groups_affected: string[] | null
          witness_contact_info: Json | null
          witness_count: number | null
        }
        Insert: {
          ai_key_entities?: Json | null
          ai_sentiment?: string | null
          ai_threat_level?: string | null
          assistance_provider?: string | null
          assistance_received?: boolean | null
          assistance_type?: string[] | null
          authorities_notified?: boolean | null
          authorities_responded?: boolean | null
          authority_response_details?: string | null
          casualties_reported?: number | null
          category: string
          children_involved?: boolean | null
          community_impact_level?: string | null
          community_response?: string | null
          confidential_notes?: string | null
          created_at?: string | null
          credibility_score?: number | null
          description: string
          duration_minutes?: number | null
          economic_impact_estimate?: number | null
          engagement_score?: number | null
          estimated_people_affected?: number | null
          evidence_description?: string | null
          first_occurrence?: boolean | null
          follow_up_contact_consent?: boolean | null
          follow_up_required?: boolean | null
          has_physical_evidence?: boolean | null
          has_witnesses?: boolean | null
          historical_context?: string | null
          id?: string
          immediate_actions_taken?: string[] | null
          immediate_needs?: string[] | null
          incident_date?: string | null
          incident_time?: string | null
          infrastructure_damage?: string[] | null
          injuries_reported?: number | null
          is_anonymous?: boolean | null
          language?: string | null
          last_activity_at?: string | null
          location_accuracy?: string | null
          location_address?: string | null
          location_city?: string | null
          location_country?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_name?: string | null
          location_postal_code?: string | null
          location_region?: string | null
          location_type?: string | null
          media_types?: string[] | null
          media_urls?: string[] | null
          perpetrator_description?: string | null
          perpetrator_type?: string | null
          preferred_contact_method?: string | null
          previous_reports_filed?: boolean | null
          recurring_issue?: boolean | null
          related_incidents?: string[] | null
          reporter_contact_email?: string | null
          reporter_contact_phone?: string | null
          reporter_id?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          resolution_status?: string | null
          services_disrupted?: string[] | null
          severity_level?: string | null
          share_count?: number | null
          source?: string | null
          status?: string | null
          sub_category?: string | null
          tags?: string[] | null
          title: string
          translated_from?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          view_count?: number | null
          visibility?: string | null
          vulnerable_groups_affected?: string[] | null
          witness_contact_info?: Json | null
          witness_count?: number | null
        }
        Update: {
          ai_key_entities?: Json | null
          ai_sentiment?: string | null
          ai_threat_level?: string | null
          assistance_provider?: string | null
          assistance_received?: boolean | null
          assistance_type?: string[] | null
          authorities_notified?: boolean | null
          authorities_responded?: boolean | null
          authority_response_details?: string | null
          casualties_reported?: number | null
          category?: string
          children_involved?: boolean | null
          community_impact_level?: string | null
          community_response?: string | null
          confidential_notes?: string | null
          created_at?: string | null
          credibility_score?: number | null
          description?: string
          duration_minutes?: number | null
          economic_impact_estimate?: number | null
          engagement_score?: number | null
          estimated_people_affected?: number | null
          evidence_description?: string | null
          first_occurrence?: boolean | null
          follow_up_contact_consent?: boolean | null
          follow_up_required?: boolean | null
          has_physical_evidence?: boolean | null
          has_witnesses?: boolean | null
          historical_context?: string | null
          id?: string
          immediate_actions_taken?: string[] | null
          immediate_needs?: string[] | null
          incident_date?: string | null
          incident_time?: string | null
          infrastructure_damage?: string[] | null
          injuries_reported?: number | null
          is_anonymous?: boolean | null
          language?: string | null
          last_activity_at?: string | null
          location_accuracy?: string | null
          location_address?: string | null
          location_city?: string | null
          location_country?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_name?: string | null
          location_postal_code?: string | null
          location_region?: string | null
          location_type?: string | null
          media_types?: string[] | null
          media_urls?: string[] | null
          perpetrator_description?: string | null
          perpetrator_type?: string | null
          preferred_contact_method?: string | null
          previous_reports_filed?: boolean | null
          recurring_issue?: boolean | null
          related_incidents?: string[] | null
          reporter_contact_email?: string | null
          reporter_contact_phone?: string | null
          reporter_id?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          resolution_status?: string | null
          services_disrupted?: string[] | null
          severity_level?: string | null
          share_count?: number | null
          source?: string | null
          status?: string | null
          sub_category?: string | null
          tags?: string[] | null
          title?: string
          translated_from?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          view_count?: number | null
          visibility?: string | null
          vulnerable_groups_affected?: string[] | null
          witness_contact_info?: Json | null
          witness_count?: number | null
        }
        Relationships: []
      }
      civic_analytics: {
        Row: {
          country: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          period_end: string | null
          period_start: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number
          period_end?: string | null
          period_start?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          period_end?: string | null
          period_start?: string | null
        }
        Relationships: []
      }
      civic_claim_reviews: {
        Row: {
          claim_text: string
          created_at: string | null
          evidence_summary: string | null
          flagged_by: string | null
          id: string
          moderation_notes: string | null
          review_status: string | null
          reviewed_by: string | null
          source_document_id: string | null
          supporting_passages: Json | null
          updated_at: string | null
        }
        Insert: {
          claim_text: string
          created_at?: string | null
          evidence_summary?: string | null
          flagged_by?: string | null
          id?: string
          moderation_notes?: string | null
          review_status?: string | null
          reviewed_by?: string | null
          source_document_id?: string | null
          supporting_passages?: Json | null
          updated_at?: string | null
        }
        Update: {
          claim_text?: string
          created_at?: string | null
          evidence_summary?: string | null
          flagged_by?: string | null
          id?: string
          moderation_notes?: string | null
          review_status?: string | null
          reviewed_by?: string | null
          source_document_id?: string | null
          supporting_passages?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "civic_claim_reviews_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "civic_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_documents: {
        Row: {
          ai_summary: Json | null
          country: string | null
          created_at: string | null
          description: string | null
          document_type: string
          file_url: string | null
          financial_allocations: Json | null
          id: string
          institutions: string[] | null
          language: string | null
          original_text: string | null
          parsed_sections: Json | null
          publish_date: string | null
          question_count: number | null
          region: string | null
          source_url: string | null
          status: string
          summary: string | null
          title: string
          topics: string[] | null
          updated_at: string | null
          uploaded_by: string | null
          view_count: number | null
        }
        Insert: {
          ai_summary?: Json | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          document_type?: string
          file_url?: string | null
          financial_allocations?: Json | null
          id?: string
          institutions?: string[] | null
          language?: string | null
          original_text?: string | null
          parsed_sections?: Json | null
          publish_date?: string | null
          question_count?: number | null
          region?: string | null
          source_url?: string | null
          status?: string
          summary?: string | null
          title: string
          topics?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          view_count?: number | null
        }
        Update: {
          ai_summary?: Json | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          document_type?: string
          file_url?: string | null
          financial_allocations?: Json | null
          id?: string
          institutions?: string[] | null
          language?: string | null
          original_text?: string | null
          parsed_sections?: Json | null
          publish_date?: string | null
          question_count?: number | null
          region?: string | null
          source_url?: string | null
          status?: string
          summary?: string | null
          title?: string
          topics?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      civic_knowledge_graph: {
        Row: {
          connections: Json | null
          created_at: string | null
          entity_id: string | null
          entity_name: string
          entity_type: string
          id: string
          properties: Json | null
          updated_at: string | null
        }
        Insert: {
          connections?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_name: string
          entity_type: string
          id?: string
          properties?: Json | null
          updated_at?: string | null
        }
        Update: {
          connections?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string
          entity_type?: string
          id?: string
          properties?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      civic_questions: {
        Row: {
          ai_answer: string | null
          ai_confidence: number | null
          asked_by: string | null
          created_at: string | null
          document_id: string | null
          document_references: Json | null
          id: string
          is_anonymous: boolean | null
          is_public: boolean | null
          question_text: string
          source_passages: Json | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          upvote_count: number | null
          view_count: number | null
        }
        Insert: {
          ai_answer?: string | null
          ai_confidence?: number | null
          asked_by?: string | null
          created_at?: string | null
          document_id?: string | null
          document_references?: Json | null
          id?: string
          is_anonymous?: boolean | null
          is_public?: boolean | null
          question_text: string
          source_passages?: Json | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          upvote_count?: number | null
          view_count?: number | null
        }
        Update: {
          ai_answer?: string | null
          ai_confidence?: number | null
          asked_by?: string | null
          created_at?: string | null
          document_id?: string | null
          document_references?: Json | null
          id?: string
          is_anonymous?: boolean | null
          is_public?: boolean | null
          question_text?: string
          source_passages?: Json | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          upvote_count?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "civic_questions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "civic_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_content: {
        Row: {
          content: string | null
          content_key: string
          content_type: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          media_alt: string | null
          media_url: string | null
          metadata: Json | null
          section: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          content_key: string
          content_type: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          media_alt?: string | null
          media_url?: string | null
          metadata?: Json | null
          section: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          content_key?: string
          content_type?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          media_alt?: string | null
          media_url?: string | null
          metadata?: Json | null
          section?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "proposal_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reports: {
        Row: {
          comment_id: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "proposal_comments"
            referencedColumns: ["id"]
          },
        ]
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
      communication_channels: {
        Row: {
          allowed_roles: string[] | null
          channel_type: Database["public"]["Enums"]["comm_channel_type"]
          country_scope: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_emergency: boolean | null
          metadata: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          allowed_roles?: string[] | null
          channel_type?: Database["public"]["Enums"]["comm_channel_type"]
          country_scope?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_emergency?: boolean | null
          metadata?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          allowed_roles?: string[] | null
          channel_type?: Database["public"]["Enums"]["comm_channel_type"]
          country_scope?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_emergency?: boolean | null
          metadata?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          organization: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          organization?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          organization?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      content: {
        Row: {
          approval_status: string
          attachments: Json | null
          category: string
          created_at: string
          description: string | null
          file_type: string
          file_url: string
          id: string
          is_archived: boolean
          like_count: number
          share_count: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          approval_status?: string
          attachments?: Json | null
          category?: string
          created_at?: string
          description?: string | null
          file_type: string
          file_url: string
          id?: string
          is_archived?: boolean
          like_count?: number
          share_count?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          approval_status?: string
          attachments?: Json | null
          category?: string
          created_at?: string
          description?: string | null
          file_type?: string
          file_url?: string
          id?: string
          is_archived?: boolean
          like_count?: number
          share_count?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      content_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      content_comment_reports: {
        Row: {
          comment_id: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          content_id: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          content_id: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          content_id?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tips: {
        Row: {
          amount: number
          content_id: string
          created_at: string
          creator_id: string
          id: string
          message: string | null
          tipper_id: string
        }
        Insert: {
          amount: number
          content_id: string
          created_at?: string
          creator_id: string
          id?: string
          message?: string | null
          tipper_id: string
        }
        Update: {
          amount?: number
          content_id?: string
          created_at?: string
          creator_id?: string
          id?: string
          message?: string | null
          tipper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_tips_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_earnings: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          source: string
          source_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          source: string
          source_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          source?: string
          source_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_quality_metrics: {
        Row: {
          accuracy_indicators: Json | null
          anomaly_flags: string[] | null
          completeness_score: number | null
          consistency_score: number | null
          created_at: string | null
          data_gaps: string[] | null
          duplicate_probability: number | null
          enhancement_suggestions: string[] | null
          id: string
          overall_quality_score: number | null
          potential_duplicates: string[] | null
          report_id: string | null
          source_reliability: string | null
          timeliness_score: number | null
          updated_at: string | null
          verification_level: string | null
        }
        Insert: {
          accuracy_indicators?: Json | null
          anomaly_flags?: string[] | null
          completeness_score?: number | null
          consistency_score?: number | null
          created_at?: string | null
          data_gaps?: string[] | null
          duplicate_probability?: number | null
          enhancement_suggestions?: string[] | null
          id?: string
          overall_quality_score?: number | null
          potential_duplicates?: string[] | null
          report_id?: string | null
          source_reliability?: string | null
          timeliness_score?: number | null
          updated_at?: string | null
          verification_level?: string | null
        }
        Update: {
          accuracy_indicators?: Json | null
          anomaly_flags?: string[] | null
          completeness_score?: number | null
          consistency_score?: number | null
          created_at?: string | null
          data_gaps?: string[] | null
          duplicate_probability?: number | null
          enhancement_suggestions?: string[] | null
          id?: string
          overall_quality_score?: number | null
          potential_duplicates?: string[] | null
          report_id?: string | null
          source_reliability?: string | null
          timeliness_score?: number | null
          updated_at?: string | null
          verification_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_quality_metrics_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_quality_metrics_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      election_anomalies: {
        Row: {
          anomaly_type: string
          confidence_score: number | null
          created_at: string | null
          description: string | null
          election_id: string
          id: string
          polling_station_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          statistical_data: Json | null
          status: string | null
        }
        Insert: {
          anomaly_type: string
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          election_id: string
          id?: string
          polling_station_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          statistical_data?: Json | null
          status?: string | null
        }
        Update: {
          anomaly_type?: string
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          election_id?: string
          id?: string
          polling_station_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          statistical_data?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "election_anomalies_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "election_anomalies_polling_station_id_fkey"
            columns: ["polling_station_id"]
            isOneToOne: false
            referencedRelation: "polling_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      election_audit_log: {
        Row: {
          action_details: Json
          action_type: string
          election_id: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          log_hash: string | null
          performed_at: string | null
          performed_by: string | null
          previous_log_hash: string | null
          user_agent: string | null
        }
        Insert: {
          action_details: Json
          action_type: string
          election_id?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          log_hash?: string | null
          performed_at?: string | null
          performed_by?: string | null
          previous_log_hash?: string | null
          user_agent?: string | null
        }
        Update: {
          action_details?: Json
          action_type?: string
          election_id?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          log_hash?: string | null
          performed_at?: string | null
          performed_by?: string | null
          previous_log_hash?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "election_audit_log_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      election_incident_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          severity_default:
            | Database["public"]["Enums"]["election_incident_severity"]
            | null
          sub_categories: string[] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          severity_default?:
            | Database["public"]["Enums"]["election_incident_severity"]
            | null
          sub_categories?: string[] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          severity_default?:
            | Database["public"]["Enums"]["election_incident_severity"]
            | null
          sub_categories?: string[] | null
        }
        Relationships: []
      }
      election_incidents: {
        Row: {
          category: string
          country_code: string
          created_at: string | null
          credibility_score: number | null
          description: string
          disruption_duration_minutes: number | null
          district: string | null
          duration_minutes: number | null
          election_id: string
          escalated: boolean | null
          escalated_to: string[] | null
          evidence_description: string | null
          has_witnesses: boolean | null
          id: string
          incident_code: string | null
          incident_datetime: string
          is_anonymous: boolean | null
          latitude: number | null
          location_address: string | null
          longitude: number | null
          media_urls: string[] | null
          people_affected: number | null
          polling_station_id: string | null
          region: string | null
          reported_by: string | null
          reporter_role: Database["public"]["Enums"]["observer_role"] | null
          requires_immediate_action: boolean | null
          resolution_notes: string | null
          resolution_status: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["election_incident_severity"]
          status: string | null
          sub_category: string | null
          title: string
          updated_at: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          voting_disrupted: boolean | null
          witness_count: number | null
        }
        Insert: {
          category: string
          country_code: string
          created_at?: string | null
          credibility_score?: number | null
          description: string
          disruption_duration_minutes?: number | null
          district?: string | null
          duration_minutes?: number | null
          election_id: string
          escalated?: boolean | null
          escalated_to?: string[] | null
          evidence_description?: string | null
          has_witnesses?: boolean | null
          id?: string
          incident_code?: string | null
          incident_datetime: string
          is_anonymous?: boolean | null
          latitude?: number | null
          location_address?: string | null
          longitude?: number | null
          media_urls?: string[] | null
          people_affected?: number | null
          polling_station_id?: string | null
          region?: string | null
          reported_by?: string | null
          reporter_role?: Database["public"]["Enums"]["observer_role"] | null
          requires_immediate_action?: boolean | null
          resolution_notes?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: Database["public"]["Enums"]["election_incident_severity"]
          status?: string | null
          sub_category?: string | null
          title: string
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          voting_disrupted?: boolean | null
          witness_count?: number | null
        }
        Update: {
          category?: string
          country_code?: string
          created_at?: string | null
          credibility_score?: number | null
          description?: string
          disruption_duration_minutes?: number | null
          district?: string | null
          duration_minutes?: number | null
          election_id?: string
          escalated?: boolean | null
          escalated_to?: string[] | null
          evidence_description?: string | null
          has_witnesses?: boolean | null
          id?: string
          incident_code?: string | null
          incident_datetime?: string
          is_anonymous?: boolean | null
          latitude?: number | null
          location_address?: string | null
          longitude?: number | null
          media_urls?: string[] | null
          people_affected?: number | null
          polling_station_id?: string | null
          region?: string | null
          reported_by?: string | null
          reporter_role?: Database["public"]["Enums"]["observer_role"] | null
          requires_immediate_action?: boolean | null
          resolution_notes?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["election_incident_severity"]
          status?: string | null
          sub_category?: string | null
          title?: string
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          voting_disrupted?: boolean | null
          witness_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "election_incidents_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "election_incidents_polling_station_id_fkey"
            columns: ["polling_station_id"]
            isOneToOne: false
            referencedRelation: "polling_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      election_observers: {
        Row: {
          accreditation_number: string | null
          accreditation_status: string | null
          accredited_at: string | null
          accredited_by: string | null
          assigned_regions: string[] | null
          assigned_stations: string[] | null
          created_at: string | null
          current_location: Json | null
          deployment_status: string | null
          election_id: string
          email: string | null
          full_name: string
          gender: string | null
          id: string
          id_verified: boolean | null
          is_active: boolean | null
          last_check_in: string | null
          oath_signed: boolean | null
          observer_role: Database["public"]["Enums"]["observer_role"]
          organization: string | null
          phone: string | null
          training_completed: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accreditation_number?: string | null
          accreditation_status?: string | null
          accredited_at?: string | null
          accredited_by?: string | null
          assigned_regions?: string[] | null
          assigned_stations?: string[] | null
          created_at?: string | null
          current_location?: Json | null
          deployment_status?: string | null
          election_id: string
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          id_verified?: boolean | null
          is_active?: boolean | null
          last_check_in?: string | null
          oath_signed?: boolean | null
          observer_role: Database["public"]["Enums"]["observer_role"]
          organization?: string | null
          phone?: string | null
          training_completed?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accreditation_number?: string | null
          accreditation_status?: string | null
          accredited_at?: string | null
          accredited_by?: string | null
          assigned_regions?: string[] | null
          assigned_stations?: string[] | null
          created_at?: string | null
          current_location?: Json | null
          deployment_status?: string | null
          election_id?: string
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          id_verified?: boolean | null
          is_active?: boolean | null
          last_check_in?: string | null
          oath_signed?: boolean | null
          observer_role?: Database["public"]["Enums"]["observer_role"]
          organization?: string | null
          phone?: string | null
          training_completed?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "election_observers_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      election_results: {
        Row: {
          contest_reason: string | null
          contested: boolean | null
          created_at: string | null
          election_id: string
          form_image_urls: string[] | null
          fully_verified: boolean | null
          hash_value: string | null
          id: string
          polling_station_id: string
          previous_hash: string | null
          rejected_votes: number
          result_form_url: string | null
          results_data: Json
          signature_count: number | null
          signatures: Json | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          total_registered: number
          total_votes_cast: number
          turnout_percentage: number | null
          updated_at: string | null
          valid_votes: number
        }
        Insert: {
          contest_reason?: string | null
          contested?: boolean | null
          created_at?: string | null
          election_id: string
          form_image_urls?: string[] | null
          fully_verified?: boolean | null
          hash_value?: string | null
          id?: string
          polling_station_id: string
          previous_hash?: string | null
          rejected_votes: number
          result_form_url?: string | null
          results_data?: Json
          signature_count?: number | null
          signatures?: Json | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          total_registered: number
          total_votes_cast: number
          turnout_percentage?: number | null
          updated_at?: string | null
          valid_votes: number
        }
        Update: {
          contest_reason?: string | null
          contested?: boolean | null
          created_at?: string | null
          election_id?: string
          form_image_urls?: string[] | null
          fully_verified?: boolean | null
          hash_value?: string | null
          id?: string
          polling_station_id?: string
          previous_hash?: string | null
          rejected_votes?: number
          result_form_url?: string | null
          results_data?: Json
          signature_count?: number | null
          signatures?: Json | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          total_registered?: number
          total_votes_cast?: number
          turnout_percentage?: number | null
          updated_at?: string | null
          valid_votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "election_results_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "election_results_polling_station_id_fkey"
            columns: ["polling_station_id"]
            isOneToOne: false
            referencedRelation: "polling_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      elections: {
        Row: {
          campaign_end: string | null
          campaign_start: string | null
          candidates: Json | null
          certified_at: string | null
          certified_by: string | null
          config: Json | null
          country_code: string
          country_name: string
          created_at: string | null
          created_by: string | null
          description: string | null
          election_type: Database["public"]["Enums"]["election_type"]
          id: string
          is_active: boolean | null
          min_signatures_required: number | null
          multi_signature_required: boolean | null
          name: string
          political_parties: Json | null
          regions: string[] | null
          registration_end: string | null
          registration_start: string | null
          status: Database["public"]["Enums"]["election_status"] | null
          total_polling_stations: number | null
          total_registered_voters: number | null
          updated_at: string | null
          verification_required: boolean | null
          voting_date: string
          voting_end_date: string | null
        }
        Insert: {
          campaign_end?: string | null
          campaign_start?: string | null
          candidates?: Json | null
          certified_at?: string | null
          certified_by?: string | null
          config?: Json | null
          country_code: string
          country_name: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          election_type: Database["public"]["Enums"]["election_type"]
          id?: string
          is_active?: boolean | null
          min_signatures_required?: number | null
          multi_signature_required?: boolean | null
          name: string
          political_parties?: Json | null
          regions?: string[] | null
          registration_end?: string | null
          registration_start?: string | null
          status?: Database["public"]["Enums"]["election_status"] | null
          total_polling_stations?: number | null
          total_registered_voters?: number | null
          updated_at?: string | null
          verification_required?: boolean | null
          voting_date: string
          voting_end_date?: string | null
        }
        Update: {
          campaign_end?: string | null
          campaign_start?: string | null
          candidates?: Json | null
          certified_at?: string | null
          certified_by?: string | null
          config?: Json | null
          country_code?: string
          country_name?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          election_type?: Database["public"]["Enums"]["election_type"]
          id?: string
          is_active?: boolean | null
          min_signatures_required?: number | null
          multi_signature_required?: boolean | null
          name?: string
          political_parties?: Json | null
          regions?: string[] | null
          registration_end?: string | null
          registration_start?: string | null
          status?: Database["public"]["Enums"]["election_status"] | null
          total_polling_stations?: number | null
          total_registered_voters?: number | null
          updated_at?: string | null
          verification_required?: boolean | null
          voting_date?: string
          voting_end_date?: string | null
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          category: string | null
          country_code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          name: string
          phone_number: string
          priority: number | null
          region: string | null
        }
        Insert: {
          category?: string | null
          country_code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name: string
          phone_number: string
          priority?: number | null
          region?: string | null
        }
        Update: {
          category?: string | null
          country_code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name?: string
          phone_number?: string
          priority?: number | null
          region?: string | null
        }
        Relationships: []
      }
      escalation_logs: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string | null
          document_id: string | null
          escalated_roles: string[] | null
          escalated_to: string[]
          escalation_level: number | null
          id: string
          incident_id: string | null
          message_id: string | null
          metadata: Json | null
          reason: string | null
          resolved_at: string | null
          rule_id: string | null
          sla_deadline: string | null
          status: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string | null
          document_id?: string | null
          escalated_roles?: string[] | null
          escalated_to: string[]
          escalation_level?: number | null
          id?: string
          incident_id?: string | null
          message_id?: string | null
          metadata?: Json | null
          reason?: string | null
          resolved_at?: string | null
          rule_id?: string | null
          sla_deadline?: string | null
          status?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string | null
          document_id?: string | null
          escalated_roles?: string[] | null
          escalated_to?: string[]
          escalation_level?: number | null
          id?: string
          incident_id?: string | null
          message_id?: string | null
          metadata?: Json | null
          reason?: string | null
          resolved_at?: string | null
          rule_id?: string | null
          sla_deadline?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalation_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ocha_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_logs_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "channel_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "escalation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_rules: {
        Row: {
          country_scope: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          escalation_time_minutes: number | null
          id: string
          is_active: boolean | null
          max_escalations: number | null
          name: string
          notification_channels: string[] | null
          severity_threshold:
            | Database["public"]["Enums"]["alert_severity_level"]
            | null
          target_roles: string[]
          target_users: string[] | null
          trigger_conditions: Json
          updated_at: string | null
        }
        Insert: {
          country_scope?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          escalation_time_minutes?: number | null
          id?: string
          is_active?: boolean | null
          max_escalations?: number | null
          name: string
          notification_channels?: string[] | null
          severity_threshold?:
            | Database["public"]["Enums"]["alert_severity_level"]
            | null
          target_roles?: string[]
          target_users?: string[] | null
          trigger_conditions?: Json
          updated_at?: string | null
        }
        Update: {
          country_scope?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          escalation_time_minutes?: number | null
          id?: string
          is_active?: boolean | null
          max_escalations?: number | null
          name?: string
          notification_channels?: string[] | null
          severity_threshold?:
            | Database["public"]["Enums"]["alert_severity_level"]
            | null
          target_roles?: string[]
          target_users?: string[] | null
          trigger_conditions?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      external_data_records: {
        Row: {
          ai_extracted_entities: Json | null
          ai_sentiment: string | null
          content: Json
          external_id: string | null
          fetched_at: string | null
          geographic_data: Json | null
          id: string
          linked_incident_ids: string[] | null
          original_timestamp: string | null
          processed_at: string | null
          record_type: string
          relevance_score: number | null
          source_id: string
        }
        Insert: {
          ai_extracted_entities?: Json | null
          ai_sentiment?: string | null
          content: Json
          external_id?: string | null
          fetched_at?: string | null
          geographic_data?: Json | null
          id?: string
          linked_incident_ids?: string[] | null
          original_timestamp?: string | null
          processed_at?: string | null
          record_type: string
          relevance_score?: number | null
          source_id: string
        }
        Update: {
          ai_extracted_entities?: Json | null
          ai_sentiment?: string | null
          content?: Json
          external_id?: string | null
          fetched_at?: string | null
          geographic_data?: Json | null
          id?: string
          linked_incident_ids?: string[] | null
          original_timestamp?: string | null
          processed_at?: string | null
          record_type?: string
          relevance_score?: number | null
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_data_records_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "external_data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      external_data_sources: {
        Row: {
          api_endpoint: string | null
          configuration: Json | null
          created_at: string | null
          credentials_key: string | null
          fetch_frequency_minutes: number | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          last_sync_status: string | null
          source_name: string
          source_type: string
          total_records_fetched: number | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          configuration?: Json | null
          created_at?: string | null
          credentials_key?: string | null
          fetch_frequency_minutes?: number | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          source_name: string
          source_type: string
          total_records_fetched?: number | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          configuration?: Json | null
          created_at?: string | null
          credentials_key?: string | null
          fetch_frequency_minutes?: number | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          source_name?: string
          source_type?: string
          total_records_fetched?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      field_reports: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          incident_ids: string[] | null
          location_coordinates: Json | null
          location_country: string | null
          location_region: string | null
          metadata: Json | null
          priority: number | null
          report_type: string | null
          reporter_id: string | null
          responded_at: string | null
          responded_by: string | null
          response_deadline: string | null
          response_notes: string | null
          severity: Database["public"]["Enums"]["alert_severity_level"] | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          incident_ids?: string[] | null
          location_coordinates?: Json | null
          location_country?: string | null
          location_region?: string | null
          metadata?: Json | null
          priority?: number | null
          report_type?: string | null
          reporter_id?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_deadline?: string | null
          response_notes?: string | null
          severity?: Database["public"]["Enums"]["alert_severity_level"] | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          incident_ids?: string[] | null
          location_coordinates?: Json | null
          location_country?: string | null
          location_region?: string | null
          metadata?: Json | null
          priority?: number | null
          report_type?: string | null
          reporter_id?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_deadline?: string | null
          response_notes?: string | null
          severity?: Database["public"]["Enums"]["alert_severity_level"] | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      geographic_clusters: {
        Row: {
          affected_population: number | null
          ai_analysis: Json | null
          average_severity: number | null
          categories: Json | null
          center_latitude: number
          center_longitude: number
          cities: string[] | null
          cluster_name: string
          cluster_risk_score: number | null
          countries: string[] | null
          created_at: string | null
          first_incident_date: string | null
          growth_rate: number | null
          id: string
          incident_count: number | null
          incident_ids: string[] | null
          is_expanding: boolean | null
          last_incident_date: string | null
          primary_category: string | null
          radius_km: number
          severity_distribution: Json | null
          updated_at: string | null
        }
        Insert: {
          affected_population?: number | null
          ai_analysis?: Json | null
          average_severity?: number | null
          categories?: Json | null
          center_latitude: number
          center_longitude: number
          cities?: string[] | null
          cluster_name: string
          cluster_risk_score?: number | null
          countries?: string[] | null
          created_at?: string | null
          first_incident_date?: string | null
          growth_rate?: number | null
          id?: string
          incident_count?: number | null
          incident_ids?: string[] | null
          is_expanding?: boolean | null
          last_incident_date?: string | null
          primary_category?: string | null
          radius_km: number
          severity_distribution?: Json | null
          updated_at?: string | null
        }
        Update: {
          affected_population?: number | null
          ai_analysis?: Json | null
          average_severity?: number | null
          categories?: Json | null
          center_latitude?: number
          center_longitude?: number
          cities?: string[] | null
          cluster_name?: string
          cluster_risk_score?: number | null
          countries?: string[] | null
          created_at?: string | null
          first_incident_date?: string | null
          growth_rate?: number | null
          id?: string
          incident_count?: number | null
          incident_ids?: string[] | null
          is_expanding?: boolean | null
          last_incident_date?: string | null
          primary_category?: string | null
          radius_km?: number
          severity_distribution?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      incident_correlations: {
        Row: {
          ai_analysis: Json | null
          correlation_strength: number | null
          correlation_type: string
          countries_involved: string[] | null
          cross_border: boolean | null
          detected_at: string | null
          detected_by: string | null
          escalation_chain: boolean | null
          geographic_distance_km: number | null
          id: string
          pattern_detected: string | null
          primary_incident_id: string
          related_incident_id: string
          shared_characteristics: Json | null
          temporal_distance_hours: number | null
        }
        Insert: {
          ai_analysis?: Json | null
          correlation_strength?: number | null
          correlation_type: string
          countries_involved?: string[] | null
          cross_border?: boolean | null
          detected_at?: string | null
          detected_by?: string | null
          escalation_chain?: boolean | null
          geographic_distance_km?: number | null
          id?: string
          pattern_detected?: string | null
          primary_incident_id: string
          related_incident_id: string
          shared_characteristics?: Json | null
          temporal_distance_hours?: number | null
        }
        Update: {
          ai_analysis?: Json | null
          correlation_strength?: number | null
          correlation_type?: string
          countries_involved?: string[] | null
          cross_border?: boolean | null
          detected_at?: string | null
          detected_by?: string | null
          escalation_chain?: boolean | null
          geographic_distance_km?: number | null
          id?: string
          pattern_detected?: string | null
          primary_incident_id?: string
          related_incident_id?: string
          shared_characteristics?: Json | null
          temporal_distance_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_correlations_primary_incident_id_fkey"
            columns: ["primary_incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_correlations_primary_incident_id_fkey"
            columns: ["primary_incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_correlations_related_incident_id_fkey"
            columns: ["related_incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_correlations_related_incident_id_fkey"
            columns: ["related_incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_patterns: {
        Row: {
          ai_analysis: Json | null
          confidence_score: number | null
          countries_affected: string[] | null
          created_at: string | null
          description: string | null
          detection_criteria: Json
          end_date: string | null
          id: string
          incident_count: number | null
          is_active: boolean | null
          last_occurrence: string | null
          matched_incidents: string[] | null
          pattern_name: string
          pattern_type: string
          recommendations: Json | null
          recurrence_frequency: string | null
          regions_affected: string[] | null
          severity_trend: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          confidence_score?: number | null
          countries_affected?: string[] | null
          created_at?: string | null
          description?: string | null
          detection_criteria: Json
          end_date?: string | null
          id?: string
          incident_count?: number | null
          is_active?: boolean | null
          last_occurrence?: string | null
          matched_incidents?: string[] | null
          pattern_name: string
          pattern_type: string
          recommendations?: Json | null
          recurrence_frequency?: string | null
          regions_affected?: string[] | null
          severity_trend?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          confidence_score?: number | null
          countries_affected?: string[] | null
          created_at?: string | null
          description?: string | null
          detection_criteria?: Json
          end_date?: string | null
          id?: string
          incident_count?: number | null
          is_active?: boolean | null
          last_occurrence?: string | null
          matched_incidents?: string[] | null
          pattern_name?: string
          pattern_type?: string
          recommendations?: Json | null
          recurrence_frequency?: string | null
          regions_affected?: string[] | null
          severity_trend?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      incident_risk_scores: {
        Row: {
          ai_confidence: number | null
          ai_reasoning: Json | null
          calculated_by: string | null
          contagion_risk: number | null
          contributing_factors: Json | null
          created_at: string | null
          escalation_probability: number | null
          escalation_timeline: string | null
          id: string
          impact_score: number | null
          incident_id: string
          overall_risk_score: number
          predicted_impact_area: string[] | null
          recommended_actions: Json | null
          risk_indicators: Json | null
          severity_score: number | null
          threat_level: string
          updated_at: string | null
          urgency_score: number | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_reasoning?: Json | null
          calculated_by?: string | null
          contagion_risk?: number | null
          contributing_factors?: Json | null
          created_at?: string | null
          escalation_probability?: number | null
          escalation_timeline?: string | null
          id?: string
          impact_score?: number | null
          incident_id: string
          overall_risk_score: number
          predicted_impact_area?: string[] | null
          recommended_actions?: Json | null
          risk_indicators?: Json | null
          severity_score?: number | null
          threat_level: string
          updated_at?: string | null
          urgency_score?: number | null
        }
        Update: {
          ai_confidence?: number | null
          ai_reasoning?: Json | null
          calculated_by?: string | null
          contagion_risk?: number | null
          contributing_factors?: Json | null
          created_at?: string | null
          escalation_probability?: number | null
          escalation_timeline?: string | null
          id?: string
          impact_score?: number | null
          incident_id?: string
          overall_risk_score?: number
          predicted_impact_area?: string[] | null
          recommended_actions?: Json | null
          risk_indicators?: Json | null
          severity_score?: number | null
          threat_level?: string
          updated_at?: string | null
          urgency_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_risk_scores_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_risk_scores_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_timeline: {
        Row: {
          actor_id: string | null
          actor_name: string | null
          actor_role: string | null
          created_at: string
          event_description: string | null
          event_title: string
          event_type: string
          id: string
          incident_id: string
          metadata: Json | null
        }
        Insert: {
          actor_id?: string | null
          actor_name?: string | null
          actor_role?: string | null
          created_at?: string
          event_description?: string | null
          event_title: string
          event_type: string
          id?: string
          incident_id: string
          metadata?: Json | null
        }
        Update: {
          actor_id?: string | null
          actor_name?: string | null
          actor_role?: string | null
          created_at?: string
          event_description?: string | null
          event_title?: string
          event_type?: string
          id?: string
          incident_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_timeline_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_timeline_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      institutional_responses: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          institution_name: string
          question_id: string
          respondent_id: string | null
          response_text: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          institution_name: string
          question_id: string
          respondent_id?: string | null
          response_text: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          institution_name?: string
          question_id?: string
          respondent_id?: string | null
          response_text?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institutional_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "civic_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connections: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          credentials_encrypted: string | null
          direction: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          last_sync_at: string | null
          last_sync_status: string | null
          name: string
          sync_frequency_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          credentials_encrypted?: string | null
          direction?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          name: string
          sync_frequency_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          credentials_encrypted?: string | null
          direction?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          name?: string
          sync_frequency_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      levels: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          level_number: number
          rewards: Json | null
          title: string
          xp_required: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          level_number: number
          rewards?: Json | null
          title: string
          xp_required: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          level_number?: number
          rewards?: Json | null
          title?: string
          xp_required?: number
        }
        Relationships: []
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
      message_acknowledgments: {
        Row: {
          acknowledged_at: string | null
          acknowledgment_note: string | null
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledgment_note?: string | null
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledgment_note?: string | null
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_acknowledgments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "channel_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          related_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      observation_checklists: {
        Row: {
          checklist_data: Json
          created_at: string | null
          election_id: string
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          observer_id: string | null
          overall_rating: string | null
          phase: string
          polling_station_id: string | null
          submitted_at: string | null
        }
        Insert: {
          checklist_data?: Json
          created_at?: string | null
          election_id: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          observer_id?: string | null
          overall_rating?: string | null
          phase?: string
          polling_station_id?: string | null
          submitted_at?: string | null
        }
        Update: {
          checklist_data?: Json
          created_at?: string | null
          election_id?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          observer_id?: string | null
          overall_rating?: string | null
          phase?: string
          polling_station_id?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "observation_checklists_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observation_checklists_observer_id_fkey"
            columns: ["observer_id"]
            isOneToOne: false
            referencedRelation: "election_observers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observation_checklists_polling_station_id_fkey"
            columns: ["polling_station_id"]
            isOneToOne: false
            referencedRelation: "polling_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      observer_check_ins: {
        Row: {
          accuracy_meters: number | null
          check_type: string
          checked_at: string | null
          device_info: Json | null
          election_id: string
          id: string
          latitude: number
          longitude: number
          observer_id: string
          polling_station_id: string | null
        }
        Insert: {
          accuracy_meters?: number | null
          check_type?: string
          checked_at?: string | null
          device_info?: Json | null
          election_id: string
          id?: string
          latitude: number
          longitude: number
          observer_id: string
          polling_station_id?: string | null
        }
        Update: {
          accuracy_meters?: number | null
          check_type?: string
          checked_at?: string | null
          device_info?: Json | null
          election_id?: string
          id?: string
          latitude?: number
          longitude?: number
          observer_id?: string
          polling_station_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "observer_check_ins_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observer_check_ins_observer_id_fkey"
            columns: ["observer_id"]
            isOneToOne: false
            referencedRelation: "election_observers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observer_check_ins_polling_station_id_fkey"
            columns: ["polling_station_id"]
            isOneToOne: false
            referencedRelation: "polling_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      ocha_documents: {
        Row: {
          approved_by: string | null
          attachments: Json | null
          content: Json
          country: string | null
          created_at: string | null
          created_by: string | null
          distribution_list: string[] | null
          document_type: Database["public"]["Enums"]["ocha_document_type"]
          id: string
          incident_ids: string[] | null
          metadata: Json | null
          published_at: string | null
          region: string | null
          severity_level:
            | Database["public"]["Enums"]["alert_severity_level"]
            | null
          status: string | null
          summary: string | null
          title: string
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          approved_by?: string | null
          attachments?: Json | null
          content?: Json
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          distribution_list?: string[] | null
          document_type: Database["public"]["Enums"]["ocha_document_type"]
          id?: string
          incident_ids?: string[] | null
          metadata?: Json | null
          published_at?: string | null
          region?: string | null
          severity_level?:
            | Database["public"]["Enums"]["alert_severity_level"]
            | null
          status?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          approved_by?: string | null
          attachments?: Json | null
          content?: Json
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          distribution_list?: string[] | null
          document_type?: Database["public"]["Enums"]["ocha_document_type"]
          id?: string
          incident_ids?: string[] | null
          metadata?: Json | null
          published_at?: string | null
          region?: string | null
          severity_level?:
            | Database["public"]["Enums"]["alert_severity_level"]
            | null
          status?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      offline_report_queue: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          parsed_data: Json | null
          phone_number: string
          processed_at: string | null
          processing_status: string | null
          raw_data: Json
          report_id: string | null
          retry_count: number | null
          source: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          parsed_data?: Json | null
          phone_number: string
          processed_at?: string | null
          processing_status?: string | null
          raw_data: Json
          report_id?: string | null
          retry_count?: number | null
          source: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          parsed_data?: Json | null
          phone_number?: string
          processed_at?: string | null
          processing_status?: string | null
          raw_data?: Json
          report_id?: string | null
          retry_count?: number | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "offline_report_queue_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offline_report_queue_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      partnership_inquiries: {
        Row: {
          contact_email: string
          contact_name: string
          contact_phone: string | null
          country: string | null
          created_at: string
          id: string
          message: string
          organization_name: string
          organization_type: string
          partnership_tier: string
          status: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          message: string
          organization_name: string
          organization_type: string
          partnership_tier: string
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          message?: string
          organization_name?: string
          organization_type?: string
          partnership_tier?: string
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      peace_accountability_metrics: {
        Row: {
          accountability_index: number | null
          avg_resolution_time: string | null
          avg_response_time: string | null
          calculated_at: string | null
          country_code: string
          created_by: string | null
          id: string
          incidents_reported: number | null
          incidents_resolved: number | null
          incidents_verified: number | null
          updated_at: string | null
        }
        Insert: {
          accountability_index?: number | null
          avg_resolution_time?: string | null
          avg_response_time?: string | null
          calculated_at?: string | null
          country_code: string
          created_by?: string | null
          id?: string
          incidents_reported?: number | null
          incidents_resolved?: number | null
          incidents_verified?: number | null
          updated_at?: string | null
        }
        Update: {
          accountability_index?: number | null
          avg_resolution_time?: string | null
          avg_response_time?: string | null
          calculated_at?: string | null
          country_code?: string
          created_by?: string | null
          id?: string
          incidents_reported?: number | null
          incidents_resolved?: number | null
          incidents_verified?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      peace_pulse_metrics: {
        Row: {
          activity_count: number | null
          calculated_at: string | null
          country_code: string
          created_by: string | null
          hotspot_locations: Json | null
          id: string
          region: string | null
          risk_score: number | null
          sentiment_average: number | null
          tension_level: string | null
          time_period: string | null
          trending_topics: Json | null
          updated_at: string | null
        }
        Insert: {
          activity_count?: number | null
          calculated_at?: string | null
          country_code: string
          created_by?: string | null
          hotspot_locations?: Json | null
          id?: string
          region?: string | null
          risk_score?: number | null
          sentiment_average?: number | null
          tension_level?: string | null
          time_period?: string | null
          trending_topics?: Json | null
          updated_at?: string | null
        }
        Update: {
          activity_count?: number | null
          calculated_at?: string | null
          country_code?: string
          created_by?: string | null
          hotspot_locations?: Json | null
          id?: string
          region?: string | null
          risk_score?: number | null
          sentiment_average?: number | null
          tension_level?: string | null
          time_period?: string | null
          trending_topics?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      perpetrator_analysis: {
        Row: {
          activity_timeline: Json | null
          ai_profile: Json | null
          aliases: string[] | null
          created_at: string | null
          description: string | null
          first_recorded: string | null
          id: string
          incident_count: number | null
          is_active: boolean | null
          last_activity: string | null
          linked_incidents: string[] | null
          modus_operandi: string[] | null
          network_connections: string[] | null
          operating_areas: string[] | null
          operating_countries: string[] | null
          perpetrator_identifier: string
          perpetrator_type: string | null
          target_types: string[] | null
          threat_level: string | null
          updated_at: string | null
        }
        Insert: {
          activity_timeline?: Json | null
          ai_profile?: Json | null
          aliases?: string[] | null
          created_at?: string | null
          description?: string | null
          first_recorded?: string | null
          id?: string
          incident_count?: number | null
          is_active?: boolean | null
          last_activity?: string | null
          linked_incidents?: string[] | null
          modus_operandi?: string[] | null
          network_connections?: string[] | null
          operating_areas?: string[] | null
          operating_countries?: string[] | null
          perpetrator_identifier: string
          perpetrator_type?: string | null
          target_types?: string[] | null
          threat_level?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_timeline?: Json | null
          ai_profile?: Json | null
          aliases?: string[] | null
          created_at?: string | null
          description?: string | null
          first_recorded?: string | null
          id?: string
          incident_count?: number | null
          is_active?: boolean | null
          last_activity?: string | null
          linked_incidents?: string[] | null
          modus_operandi?: string[] | null
          network_connections?: string[] | null
          operating_areas?: string[] | null
          operating_countries?: string[] | null
          perpetrator_identifier?: string
          perpetrator_type?: string | null
          target_types?: string[] | null
          threat_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      poll_analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          poll_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          poll_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          poll_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_analytics_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_responses: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          ip_hash: string | null
          is_anonymous: boolean | null
          poll_id: string
          rating_value: number | null
          selected_options: number[]
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          is_anonymous?: boolean | null
          poll_id: string
          rating_value?: number | null
          selected_options: number[]
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          is_anonymous?: boolean | null
          poll_id?: string
          rating_value?: number | null
          selected_options?: number[]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polling_stations: {
        Row: {
          accessibility_notes: string | null
          address: string | null
          closed_at: string | null
          constituency: string | null
          country_code: string
          created_at: string | null
          district: string | null
          election_id: string
          equipment_status: Json | null
          geofence_radius_meters: number | null
          id: string
          is_accessible: boolean | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          opened_at: string | null
          region: string | null
          registered_voters: number | null
          setup_verified: boolean | null
          setup_verified_at: string | null
          setup_verified_by: string | null
          station_code: string
          station_name: string
          updated_at: string | null
          ward: string | null
        }
        Insert: {
          accessibility_notes?: string | null
          address?: string | null
          closed_at?: string | null
          constituency?: string | null
          country_code: string
          created_at?: string | null
          district?: string | null
          election_id: string
          equipment_status?: Json | null
          geofence_radius_meters?: number | null
          id?: string
          is_accessible?: boolean | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          opened_at?: string | null
          region?: string | null
          registered_voters?: number | null
          setup_verified?: boolean | null
          setup_verified_at?: string | null
          setup_verified_by?: string | null
          station_code: string
          station_name: string
          updated_at?: string | null
          ward?: string | null
        }
        Update: {
          accessibility_notes?: string | null
          address?: string | null
          closed_at?: string | null
          constituency?: string | null
          country_code?: string
          created_at?: string | null
          district?: string | null
          election_id?: string
          equipment_status?: Json | null
          geofence_radius_meters?: number | null
          id?: string
          is_accessible?: boolean | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          opened_at?: string | null
          region?: string | null
          registered_voters?: number | null
          setup_verified?: boolean | null
          setup_verified_at?: string | null
          setup_verified_by?: string | null
          station_code?: string
          station_name?: string
          updated_at?: string | null
          ward?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polling_stations_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          options: Json
          poll_type: string
          settings: Json | null
          starts_at: string | null
          title: string
          total_participants: number | null
          total_votes: number | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          options?: Json
          poll_type?: string
          settings?: Json | null
          starts_at?: string | null
          title: string
          total_participants?: number | null
          total_votes?: number | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          options?: Json
          poll_type?: string
          settings?: Json | null
          starts_at?: string | null
          title?: string
          total_participants?: number | null
          total_votes?: number | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      predictive_hotspots: {
        Row: {
          ai_model_used: string | null
          confidence_level: number | null
          country: string
          environmental_factors: Json | null
          historical_patterns: Json | null
          hotspot_score: number
          id: string
          incident_count_30d: number | null
          incident_trend: string | null
          last_updated: string | null
          latitude: number
          longitude: number
          monitoring_priority: string | null
          predicted_at: string | null
          prediction_factors: Json | null
          prediction_window: string
          radius_km: number
          recommended_interventions: Json | null
          region_name: string
          risk_level: string
          seasonal_factors: Json | null
          similar_historical_events: Json | null
          socioeconomic_indicators: Json | null
          status: string | null
          valid_until: string
        }
        Insert: {
          ai_model_used?: string | null
          confidence_level?: number | null
          country: string
          environmental_factors?: Json | null
          historical_patterns?: Json | null
          hotspot_score: number
          id?: string
          incident_count_30d?: number | null
          incident_trend?: string | null
          last_updated?: string | null
          latitude: number
          longitude: number
          monitoring_priority?: string | null
          predicted_at?: string | null
          prediction_factors?: Json | null
          prediction_window: string
          radius_km: number
          recommended_interventions?: Json | null
          region_name: string
          risk_level: string
          seasonal_factors?: Json | null
          similar_historical_events?: Json | null
          socioeconomic_indicators?: Json | null
          status?: string | null
          valid_until: string
        }
        Update: {
          ai_model_used?: string | null
          confidence_level?: number | null
          country?: string
          environmental_factors?: Json | null
          historical_patterns?: Json | null
          hotspot_score?: number
          id?: string
          incident_count_30d?: number | null
          incident_trend?: string | null
          last_updated?: string | null
          latitude?: number
          longitude?: number
          monitoring_priority?: string | null
          predicted_at?: string | null
          prediction_factors?: Json | null
          prediction_window?: string
          radius_km?: number
          recommended_interventions?: Json | null
          region_name?: string
          risk_level?: string
          seasonal_factors?: Json | null
          similar_historical_events?: Json | null
          socioeconomic_indicators?: Json | null
          status?: string | null
          valid_until?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          creator_tier: string | null
          current_level: number | null
          display_name: string | null
          email: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_creator: boolean | null
          is_verified: boolean | null
          peace_points: number | null
          posts_count: number | null
          social_links: Json | null
          total_views: number | null
          updated_at: string | null
          user_type: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          creator_tier?: string | null
          current_level?: number | null
          display_name?: string | null
          email?: string | null
          followers_count?: number | null
          following_count?: number | null
          id: string
          is_creator?: boolean | null
          is_verified?: boolean | null
          peace_points?: number | null
          posts_count?: number | null
          social_links?: Json | null
          total_views?: number | null
          updated_at?: string | null
          user_type?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          creator_tier?: string | null
          current_level?: number | null
          display_name?: string | null
          email?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_creator?: boolean | null
          is_verified?: boolean | null
          peace_points?: number | null
          posts_count?: number | null
          social_links?: Json | null
          total_views?: number | null
          updated_at?: string | null
          user_type?: string | null
          username?: string | null
        }
        Relationships: []
      }
      proposal_comments: {
        Row: {
          body: string
          created_at: string
          display_anonymous: boolean
          id: string
          is_edited: boolean
          is_pinned: boolean
          like_count: number
          parent_comment_id: string | null
          proposal_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          display_anonymous?: boolean
          id?: string
          is_edited?: boolean
          is_pinned?: boolean
          like_count?: number
          parent_comment_id?: string | null
          proposal_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          display_anonymous?: boolean
          id?: string
          is_edited?: boolean
          is_pinned?: boolean
          like_count?: number
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
      proposal_votes: {
        Row: {
          created_at: string
          display_anonymous: boolean
          id: string
          proposal_id: string
          user_id: string
          vote: string
        }
        Insert: {
          created_at?: string
          display_anonymous?: boolean
          id?: string
          proposal_id: string
          user_id: string
          vote: string
        }
        Update: {
          created_at?: string
          display_anonymous?: boolean
          id?: string
          proposal_id?: string
          user_id?: string
          vote?: string
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
          category: string
          created_at: string
          creator_id: string
          description: string
          ends_at: string | null
          id: string
          stage: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          visibility: string
          votes_abstain: number
          votes_against: number
          votes_for: number
        }
        Insert: {
          category: string
          created_at?: string
          creator_id: string
          description: string
          ends_at?: string | null
          id?: string
          stage?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          visibility?: string
          votes_abstain?: number
          votes_against?: number
          votes_for?: number
        }
        Update: {
          category?: string
          created_at?: string
          creator_id?: string
          description?: string
          ends_at?: string | null
          id?: string
          stage?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          visibility?: string
          votes_abstain?: number
          votes_against?: number
          votes_for?: number
        }
        Relationships: []
      }
      pvt_samples: {
        Row: {
          confidence_level: number | null
          election_id: string
          id: string
          margin_of_error: number | null
          polling_station_id: string | null
          projected_results: Json | null
          results_data: Json
          sample_group: string | null
          submitted_at: string | null
          submitted_by: string | null
          turnout_data: Json | null
        }
        Insert: {
          confidence_level?: number | null
          election_id: string
          id?: string
          margin_of_error?: number | null
          polling_station_id?: string | null
          projected_results?: Json | null
          results_data?: Json
          sample_group?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          turnout_data?: Json | null
        }
        Update: {
          confidence_level?: number | null
          election_id?: string
          id?: string
          margin_of_error?: number | null
          polling_station_id?: string | null
          projected_results?: Json | null
          results_data?: Json
          sample_group?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          turnout_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pvt_samples_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvt_samples_polling_station_id_fkey"
            columns: ["polling_station_id"]
            isOneToOne: false
            referencedRelation: "polling_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_blocks: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          display_order: number | null
          full_name: string | null
          headquarters: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          full_name?: string | null
          headquarters?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          full_name?: string | null
          headquarters?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      reporter_safety_profiles: {
        Row: {
          anonymous_reporter_hash: string | null
          created_at: string | null
          emergency_contacts: Json | null
          id: string
          is_in_danger_zone: boolean | null
          last_known_safe_location: Json | null
          last_safety_check: string | null
          location_masking_enabled: boolean | null
          protection_measures: string[] | null
          reporter_id: string | null
          risk_level: string | null
          safety_alerts_enabled: boolean | null
          safety_protocols_active: string[] | null
          safety_score: number | null
          secure_communication_enabled: boolean | null
          threat_indicators: Json | null
          updated_at: string | null
        }
        Insert: {
          anonymous_reporter_hash?: string | null
          created_at?: string | null
          emergency_contacts?: Json | null
          id?: string
          is_in_danger_zone?: boolean | null
          last_known_safe_location?: Json | null
          last_safety_check?: string | null
          location_masking_enabled?: boolean | null
          protection_measures?: string[] | null
          reporter_id?: string | null
          risk_level?: string | null
          safety_alerts_enabled?: boolean | null
          safety_protocols_active?: string[] | null
          safety_score?: number | null
          secure_communication_enabled?: boolean | null
          threat_indicators?: Json | null
          updated_at?: string | null
        }
        Update: {
          anonymous_reporter_hash?: string | null
          created_at?: string | null
          emergency_contacts?: Json | null
          id?: string
          is_in_danger_zone?: boolean | null
          last_known_safe_location?: Json | null
          last_safety_check?: string | null
          location_masking_enabled?: boolean | null
          protection_measures?: string[] | null
          reporter_id?: string | null
          risk_level?: string | null
          safety_alerts_enabled?: boolean | null
          safety_protocols_active?: string[] | null
          safety_score?: number | null
          secure_communication_enabled?: boolean | null
          threat_indicators?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      response_deployments: {
        Row: {
          actions_taken: Json | null
          arrived_at: string | null
          completed_at: string | null
          coordinating_with: string[] | null
          created_at: string | null
          deployed_personnel: number | null
          deployed_resources: Json | null
          deployment_status: string
          dispatched_at: string | null
          estimated_arrival: string | null
          id: string
          incident_id: string
          notes: string | null
          outcomes: Json | null
          priority_level: string | null
          reporting_to: string | null
          requested_at: string | null
          team_id: string
          updated_at: string | null
        }
        Insert: {
          actions_taken?: Json | null
          arrived_at?: string | null
          completed_at?: string | null
          coordinating_with?: string[] | null
          created_at?: string | null
          deployed_personnel?: number | null
          deployed_resources?: Json | null
          deployment_status?: string
          dispatched_at?: string | null
          estimated_arrival?: string | null
          id?: string
          incident_id: string
          notes?: string | null
          outcomes?: Json | null
          priority_level?: string | null
          reporting_to?: string | null
          requested_at?: string | null
          team_id: string
          updated_at?: string | null
        }
        Update: {
          actions_taken?: Json | null
          arrived_at?: string | null
          completed_at?: string | null
          coordinating_with?: string[] | null
          created_at?: string | null
          deployed_personnel?: number | null
          deployed_resources?: Json | null
          deployment_status?: string
          dispatched_at?: string | null
          estimated_arrival?: string | null
          id?: string
          incident_id?: string
          notes?: string | null
          outcomes?: Json | null
          priority_level?: string | null
          reporting_to?: string | null
          requested_at?: string | null
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "response_deployments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_deployments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_deployments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "response_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      response_teams: {
        Row: {
          availability_schedule: Json | null
          available_resources: Json | null
          base_location: string | null
          capabilities: string[] | null
          contact_info: Json
          coverage_radius_km: number | null
          created_at: string | null
          current_status: string | null
          emergency_contact: string | null
          id: string
          operating_regions: string[] | null
          organization: string
          team_name: string
          team_size: number | null
          team_type: string | null
          updated_at: string | null
        }
        Insert: {
          availability_schedule?: Json | null
          available_resources?: Json | null
          base_location?: string | null
          capabilities?: string[] | null
          contact_info: Json
          coverage_radius_km?: number | null
          created_at?: string | null
          current_status?: string | null
          emergency_contact?: string | null
          id?: string
          operating_regions?: string[] | null
          organization: string
          team_name: string
          team_size?: number | null
          team_type?: string | null
          updated_at?: string | null
        }
        Update: {
          availability_schedule?: Json | null
          available_resources?: Json | null
          base_location?: string | null
          capabilities?: string[] | null
          contact_info?: Json
          coverage_radius_km?: number | null
          created_at?: string | null
          current_status?: string | null
          emergency_contact?: string | null
          id?: string
          operating_regions?: string[] | null
          organization?: string
          team_name?: string
          team_size?: number | null
          team_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      result_signatures: {
        Row: {
          agrees_with_result: boolean | null
          comments: string | null
          device_info: Json | null
          id: string
          ip_address: unknown
          objection_reason: string | null
          result_id: string
          signature_hash: string | null
          signature_type: string
          signed_at: string | null
          signer_id: string
          signer_organization: string | null
          signer_role: Database["public"]["Enums"]["observer_role"]
        }
        Insert: {
          agrees_with_result?: boolean | null
          comments?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          objection_reason?: string | null
          result_id: string
          signature_hash?: string | null
          signature_type: string
          signed_at?: string | null
          signer_id: string
          signer_organization?: string | null
          signer_role: Database["public"]["Enums"]["observer_role"]
        }
        Update: {
          agrees_with_result?: boolean | null
          comments?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          objection_reason?: string | null
          result_id?: string
          signature_hash?: string | null
          signature_type?: string
          signed_at?: string | null
          signer_id?: string
          signer_organization?: string | null
          signer_role?: Database["public"]["Enums"]["observer_role"]
        }
        Relationships: [
          {
            foreignKeyName: "result_signatures_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "election_results"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_store_items: {
        Row: {
          cost_points: number
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_available: boolean
          item_type: string
          name: string
          stock_quantity: number | null
        }
        Insert: {
          cost_points?: number
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          item_type?: string
          name: string
          stock_quantity?: number | null
        }
        Update: {
          cost_points?: number
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          item_type?: string
          name?: string
          stock_quantity?: number | null
        }
        Relationships: []
      }
      role_feature_access: {
        Row: {
          created_at: string
          feature_key: string
          id: string
          is_enabled: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          feature_key: string
          id?: string
          is_enabled?: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          feature_key?: string
          id?: string
          is_enabled?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      safe_spaces: {
        Row: {
          capacity: number | null
          contact_phone: string | null
          country_code: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_archived: boolean | null
          latitude: number | null
          location_name: string
          longitude: number | null
          name: string
          region: string | null
          space_type: string
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          capacity?: number | null
          contact_phone?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          latitude?: number | null
          location_name: string
          longitude?: number | null
          name: string
          region?: string | null
          space_type?: string
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          capacity?: number | null
          contact_phone?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          latitude?: number | null
          location_name?: string
          longitude?: number | null
          name?: string
          region?: string | null
          space_type?: string
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      safety_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          anonymous_hash: string | null
          created_at: string | null
          id: string
          incident_id: string | null
          location_data: Json | null
          message: string
          recommended_actions: string[] | null
          reporter_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string | null
          threat_details: Json | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          anonymous_hash?: string | null
          created_at?: string | null
          id?: string
          incident_id?: string | null
          location_data?: Json | null
          message: string
          recommended_actions?: string[] | null
          reporter_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string | null
          threat_details?: Json | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          anonymous_hash?: string | null
          created_at?: string | null
          id?: string
          incident_id?: string | null
          location_data?: Json | null
          message?: string
          recommended_actions?: string[] | null
          reporter_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string | null
          threat_details?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_alerts_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_alerts_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_models: {
        Row: {
          ai_model_used: string | null
          assumptions: Json
          base_incident_id: string | null
          confidence_intervals: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          economic_impact_usd: number | null
          estimated_affected_population: number | null
          geographic_impact_areas: string[] | null
          humanitarian_impact_score: number | null
          id: string
          model_version: string | null
          name: string
          predicted_outcomes: Json
          probability_distribution: Json | null
          recommended_interventions: Json | null
          scenario_type: string
          status: string | null
          tested_interventions: Json | null
          time_horizon_days: number
          variables: Json
        }
        Insert: {
          ai_model_used?: string | null
          assumptions: Json
          base_incident_id?: string | null
          confidence_intervals?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          economic_impact_usd?: number | null
          estimated_affected_population?: number | null
          geographic_impact_areas?: string[] | null
          humanitarian_impact_score?: number | null
          id?: string
          model_version?: string | null
          name: string
          predicted_outcomes: Json
          probability_distribution?: Json | null
          recommended_interventions?: Json | null
          scenario_type: string
          status?: string | null
          tested_interventions?: Json | null
          time_horizon_days: number
          variables: Json
        }
        Update: {
          ai_model_used?: string | null
          assumptions?: Json
          base_incident_id?: string | null
          confidence_intervals?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          economic_impact_usd?: number | null
          estimated_affected_population?: number | null
          geographic_impact_areas?: string[] | null
          humanitarian_impact_score?: number | null
          id?: string
          model_version?: string | null
          name?: string
          predicted_outcomes?: Json
          probability_distribution?: Json | null
          recommended_interventions?: Json | null
          scenario_type?: string
          status?: string | null
          tested_interventions?: Json | null
          time_horizon_days?: number
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "scenario_models_base_incident_id_fkey"
            columns: ["base_incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scenario_models_base_incident_id_fkey"
            columns: ["base_incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_broadcasts: {
        Row: {
          alert_id: string | null
          completed_at: string | null
          created_at: string | null
          delivered_count: number | null
          failed_count: number | null
          id: string
          message: string
          recipient_count: number | null
          status: string | null
        }
        Insert: {
          alert_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          message: string
          recipient_count?: number | null
          status?: string | null
        }
        Update: {
          alert_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          message?: string
          recipient_count?: number | null
          status?: string | null
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          command: string | null
          created_at: string | null
          direction: string
          error_message: string | null
          id: string
          message: string
          metadata: Json | null
          phone_number: string
          provider_message_id: string | null
          report_id: string | null
          status: string | null
        }
        Insert: {
          command?: string | null
          created_at?: string | null
          direction: string
          error_message?: string | null
          id?: string
          message: string
          metadata?: Json | null
          phone_number: string
          provider_message_id?: string | null
          report_id?: string | null
          status?: string | null
        }
        Update: {
          command?: string | null
          created_at?: string | null
          direction?: string
          error_message?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          phone_number?: string
          provider_message_id?: string | null
          report_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_logs_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_sessions: {
        Row: {
          created_at: string | null
          current_state: string | null
          data: Json | null
          expires_at: string | null
          id: string
          language: string | null
          phone_number: string
          session_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_state?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          language?: string | null
          phone_number: string
          session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_state?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          language?: string | null
          phone_number?: string
          session_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sms_subscribers: {
        Row: {
          alert_types: string[] | null
          country_code: string | null
          id: string
          is_active: boolean | null
          language: string | null
          phone_number: string
          region: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
          verification_code: string | null
          verified: boolean | null
        }
        Insert: {
          alert_types?: string[] | null
          country_code?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          phone_number: string
          region?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          verification_code?: string | null
          verified?: boolean | null
        }
        Update: {
          alert_types?: string[] | null
          country_code?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          phone_number?: string
          region?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          verification_code?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string | null
          display_frequency: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string
          name: string
          pages: string[] | null
          rotation_duration: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          display_frequency?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url: string
          name: string
          pages?: string[] | null
          rotation_duration?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          display_frequency?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string
          name?: string
          pages?: string[] | null
          rotation_duration?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      temporal_analysis: {
        Row: {
          ai_insights: Json | null
          analysis_period: string
          category_distribution: Json | null
          comparison_period: Json | null
          country: string | null
          created_at: string | null
          end_date: string
          id: string
          incident_breakdown: Json | null
          peak_days: string[] | null
          peak_hours: number[] | null
          peak_months: number[] | null
          percentage_change: number | null
          region: string | null
          seasonality_detected: boolean | null
          seasonality_pattern: string | null
          severity_distribution: Json | null
          start_date: string
          total_incidents: number | null
          trend_direction: string | null
        }
        Insert: {
          ai_insights?: Json | null
          analysis_period: string
          category_distribution?: Json | null
          comparison_period?: Json | null
          country?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          incident_breakdown?: Json | null
          peak_days?: string[] | null
          peak_hours?: number[] | null
          peak_months?: number[] | null
          percentage_change?: number | null
          region?: string | null
          seasonality_detected?: boolean | null
          seasonality_pattern?: string | null
          severity_distribution?: Json | null
          start_date: string
          total_incidents?: number | null
          trend_direction?: string | null
        }
        Update: {
          ai_insights?: Json | null
          analysis_period?: string
          category_distribution?: Json | null
          comparison_period?: Json | null
          country?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          incident_breakdown?: Json | null
          peak_days?: string[] | null
          peak_hours?: number[] | null
          peak_months?: number[] | null
          percentage_change?: number | null
          region?: string | null
          seasonality_detected?: boolean | null
          seasonality_pattern?: string | null
          severity_distribution?: Json | null
          start_date?: string
          total_incidents?: number | null
          trend_direction?: string | null
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
      user_feature_access: {
        Row: {
          created_at: string | null
          feature_key: string
          granted_by: string | null
          id: string
          is_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feature_key: string
          granted_by?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feature_key?: string
          granted_by?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          balance: number | null
          created_at: string
          currency: string | null
          id: string
          total_earned: number | null
          total_withdrawn: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ussd_logs: {
        Row: {
          action: string
          carrier: string | null
          country_code: string | null
          created_at: string | null
          id: string
          input_text: string | null
          phone_number: string
          report_id: string | null
          response_text: string | null
          session_id: string | null
        }
        Insert: {
          action: string
          carrier?: string | null
          country_code?: string | null
          created_at?: string | null
          id?: string
          input_text?: string | null
          phone_number: string
          report_id?: string | null
          response_text?: string | null
          session_id?: string | null
        }
        Update: {
          action?: string
          carrier?: string | null
          country_code?: string | null
          created_at?: string | null
          id?: string
          input_text?: string | null
          phone_number?: string
          report_id?: string | null
          response_text?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ussd_logs_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ussd_logs_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      ussd_sessions: {
        Row: {
          created_at: string | null
          current_state: string
          data: Json | null
          id: string
          language: string | null
          phone_number: string
          session_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_state?: string
          data?: Json | null
          id?: string
          language?: string | null
          phone_number: string
          session_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_state?: string
          data?: Json | null
          id?: string
          language?: string | null
          phone_number?: string
          session_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      verification_tasks: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          category: string | null
          completed_at: string | null
          confidence_score: number | null
          created_at: string
          credibility_score: number | null
          evidence_urls: string[] | null
          id: string
          priority: string
          recommended_action: string | null
          report_id: string | null
          status: string
          updated_at: string
          verdict: string | null
          verification_notes: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          credibility_score?: number | null
          evidence_urls?: string[] | null
          id?: string
          priority?: string
          recommended_action?: string | null
          report_id?: string | null
          status?: string
          updated_at?: string
          verdict?: string | null
          verification_notes?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          credibility_score?: number | null
          evidence_urls?: string[] | null
          id?: string
          priority?: string
          recommended_action?: string | null
          report_id?: string | null
          status?: string
          updated_at?: string
          verdict?: string | null
          verification_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_tasks_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_tasks_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt_number: number | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          success: boolean | null
          webhook_id: string | null
        }
        Insert: {
          attempt_number?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean | null
          webhook_id?: string | null
        }
        Update: {
          attempt_number?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhook_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_subscriptions: {
        Row: {
          created_at: string | null
          created_by: string | null
          events: string[]
          failure_count: number | null
          filters: Json | null
          id: string
          is_active: boolean | null
          last_status: string | null
          last_triggered_at: string | null
          name: string
          organization_name: string | null
          retry_count: number | null
          secret: string
          timeout_seconds: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          events?: string[]
          failure_count?: number | null
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          last_status?: string | null
          last_triggered_at?: string | null
          name: string
          organization_name?: string | null
          retry_count?: number | null
          secret: string
          timeout_seconds?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          events?: string[]
          failure_count?: number | null
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          last_status?: string | null
          last_triggered_at?: string | null
          name?: string
          organization_name?: string | null
          retry_count?: number | null
          secret?: string
          timeout_seconds?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string
          end_date: string
          id: string
          is_active: boolean
          points_reward: number
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          challenge_type?: string
          created_at?: string
          description: string
          end_date: string
          id?: string
          is_active?: boolean
          points_reward?: number
          start_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean
          points_reward?: number
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      citizen_reports_safe: {
        Row: {
          ai_key_entities: Json | null
          ai_sentiment: string | null
          ai_threat_level: string | null
          assistance_provider: string | null
          assistance_received: boolean | null
          assistance_type: string[] | null
          authorities_notified: boolean | null
          authorities_responded: boolean | null
          authority_response_details: string | null
          casualties_reported: number | null
          category: string | null
          children_involved: boolean | null
          community_impact_level: string | null
          community_response: string | null
          confidential_notes: string | null
          created_at: string | null
          credibility_score: number | null
          description: string | null
          duration_minutes: number | null
          economic_impact_estimate: number | null
          engagement_score: number | null
          estimated_people_affected: number | null
          evidence_description: string | null
          first_occurrence: boolean | null
          follow_up_contact_consent: boolean | null
          follow_up_required: boolean | null
          has_physical_evidence: boolean | null
          has_witnesses: boolean | null
          historical_context: string | null
          id: string | null
          immediate_actions_taken: string[] | null
          immediate_needs: string[] | null
          incident_date: string | null
          incident_time: string | null
          infrastructure_damage: string[] | null
          injuries_reported: number | null
          is_anonymous: boolean | null
          language: string | null
          last_activity_at: string | null
          location_accuracy: string | null
          location_address: string | null
          location_city: string | null
          location_country: string | null
          location_latitude: number | null
          location_longitude: number | null
          location_name: string | null
          location_postal_code: string | null
          location_region: string | null
          location_type: string | null
          media_types: string[] | null
          media_urls: string[] | null
          perpetrator_description: string | null
          perpetrator_type: string | null
          preferred_contact_method: string | null
          previous_reports_filed: boolean | null
          recurring_issue: boolean | null
          related_incidents: string[] | null
          reporter_contact_email: string | null
          reporter_contact_phone: string | null
          reporter_id: string | null
          resolution_date: string | null
          resolution_notes: string | null
          resolution_status: string | null
          services_disrupted: string[] | null
          severity_level: string | null
          share_count: number | null
          source: string | null
          status: string | null
          sub_category: string | null
          tags: string[] | null
          title: string | null
          translated_from: string | null
          updated_at: string | null
          urgency_level: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          view_count: number | null
          visibility: string | null
          vulnerable_groups_affected: string[] | null
          witness_contact_info: Json | null
          witness_count: number | null
        }
        Insert: {
          ai_key_entities?: Json | null
          ai_sentiment?: string | null
          ai_threat_level?: string | null
          assistance_provider?: string | null
          assistance_received?: boolean | null
          assistance_type?: string[] | null
          authorities_notified?: boolean | null
          authorities_responded?: boolean | null
          authority_response_details?: string | null
          casualties_reported?: number | null
          category?: string | null
          children_involved?: boolean | null
          community_impact_level?: string | null
          community_response?: string | null
          confidential_notes?: never
          created_at?: string | null
          credibility_score?: number | null
          description?: string | null
          duration_minutes?: number | null
          economic_impact_estimate?: number | null
          engagement_score?: number | null
          estimated_people_affected?: number | null
          evidence_description?: string | null
          first_occurrence?: boolean | null
          follow_up_contact_consent?: boolean | null
          follow_up_required?: boolean | null
          has_physical_evidence?: boolean | null
          has_witnesses?: boolean | null
          historical_context?: string | null
          id?: string | null
          immediate_actions_taken?: string[] | null
          immediate_needs?: string[] | null
          incident_date?: string | null
          incident_time?: string | null
          infrastructure_damage?: string[] | null
          injuries_reported?: number | null
          is_anonymous?: boolean | null
          language?: string | null
          last_activity_at?: string | null
          location_accuracy?: string | null
          location_address?: never
          location_city?: string | null
          location_country?: string | null
          location_latitude?: never
          location_longitude?: never
          location_name?: never
          location_postal_code?: never
          location_region?: string | null
          location_type?: string | null
          media_types?: string[] | null
          media_urls?: string[] | null
          perpetrator_description?: string | null
          perpetrator_type?: string | null
          preferred_contact_method?: string | null
          previous_reports_filed?: boolean | null
          recurring_issue?: boolean | null
          related_incidents?: string[] | null
          reporter_contact_email?: never
          reporter_contact_phone?: never
          reporter_id?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          resolution_status?: string | null
          services_disrupted?: string[] | null
          severity_level?: string | null
          share_count?: number | null
          source?: string | null
          status?: string | null
          sub_category?: string | null
          tags?: string[] | null
          title?: string | null
          translated_from?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          view_count?: number | null
          visibility?: string | null
          vulnerable_groups_affected?: string[] | null
          witness_contact_info?: never
          witness_count?: number | null
        }
        Update: {
          ai_key_entities?: Json | null
          ai_sentiment?: string | null
          ai_threat_level?: string | null
          assistance_provider?: string | null
          assistance_received?: boolean | null
          assistance_type?: string[] | null
          authorities_notified?: boolean | null
          authorities_responded?: boolean | null
          authority_response_details?: string | null
          casualties_reported?: number | null
          category?: string | null
          children_involved?: boolean | null
          community_impact_level?: string | null
          community_response?: string | null
          confidential_notes?: never
          created_at?: string | null
          credibility_score?: number | null
          description?: string | null
          duration_minutes?: number | null
          economic_impact_estimate?: number | null
          engagement_score?: number | null
          estimated_people_affected?: number | null
          evidence_description?: string | null
          first_occurrence?: boolean | null
          follow_up_contact_consent?: boolean | null
          follow_up_required?: boolean | null
          has_physical_evidence?: boolean | null
          has_witnesses?: boolean | null
          historical_context?: string | null
          id?: string | null
          immediate_actions_taken?: string[] | null
          immediate_needs?: string[] | null
          incident_date?: string | null
          incident_time?: string | null
          infrastructure_damage?: string[] | null
          injuries_reported?: number | null
          is_anonymous?: boolean | null
          language?: string | null
          last_activity_at?: string | null
          location_accuracy?: string | null
          location_address?: never
          location_city?: string | null
          location_country?: string | null
          location_latitude?: never
          location_longitude?: never
          location_name?: never
          location_postal_code?: never
          location_region?: string | null
          location_type?: string | null
          media_types?: string[] | null
          media_urls?: string[] | null
          perpetrator_description?: string | null
          perpetrator_type?: string | null
          preferred_contact_method?: string | null
          previous_reports_filed?: boolean | null
          recurring_issue?: boolean | null
          related_incidents?: string[] | null
          reporter_contact_email?: never
          reporter_contact_phone?: never
          reporter_id?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          resolution_status?: string | null
          services_disrupted?: string[] | null
          severity_level?: string | null
          share_count?: number | null
          source?: string | null
          status?: string | null
          sub_category?: string | null
          tags?: string[] | null
          title?: string | null
          translated_from?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          view_count?: number | null
          visibility?: string | null
          vulnerable_groups_affected?: string[] | null
          witness_contact_info?: never
          witness_count?: number | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          creator_tier: string | null
          current_level: number | null
          display_name: string | null
          followers_count: number | null
          following_count: number | null
          id: string | null
          is_creator: boolean | null
          is_verified: boolean | null
          peace_points: number | null
          posts_count: number | null
          social_links: Json | null
          total_views: number | null
          user_type: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          creator_tier?: string | null
          current_level?: number | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string | null
          is_creator?: boolean | null
          is_verified?: boolean | null
          peace_points?: number | null
          posts_count?: number | null
          social_links?: Json | null
          total_views?: number | null
          user_type?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          creator_tier?: string | null
          current_level?: number | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string | null
          is_creator?: boolean | null
          is_verified?: boolean | null
          peace_points?: number | null
          posts_count?: number | null
          social_links?: Json | null
          total_views?: number | null
          user_type?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      gettransactionid: { Args: never; Returns: unknown }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_report_views: {
        Args: { report_id: string }
        Returns: undefined
      }
      increment_share_count: {
        Args: { content_id: string }
        Returns: undefined
      }
      is_election_admin: { Args: { _user_id: string }; Returns: boolean }
      is_election_observer: {
        Args: { _election_id: string; _user_id: string }
        Returns: boolean
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      process_content_tip: {
        Args: {
          p_amount: number
          p_content_id: string
          p_creator_id: string
          p_message?: string
        }
        Returns: Json
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      update_ai_analytics_summary: { Args: never; Returns: undefined }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      ai_analysis_type:
        | "sentiment"
        | "threat_detection"
        | "credibility"
        | "entity_extraction"
        | "tone_classification"
        | "anomaly_detection"
        | "sentiment_and_threat"
      alert_severity_level: "green" | "yellow" | "orange" | "red"
      app_role: "citizen" | "verifier" | "partner" | "government" | "admin"
      comm_channel_type:
        | "coordination"
        | "broadcast"
        | "field_report"
        | "direct"
        | "emergency"
      comm_message_status:
        | "draft"
        | "sent"
        | "delivered"
        | "read"
        | "acknowledged"
        | "escalated"
        | "archived"
      election_incident_severity:
        | "minor"
        | "moderate"
        | "serious"
        | "critical"
        | "emergency"
      election_status:
        | "draft"
        | "scheduled"
        | "registration"
        | "campaigning"
        | "voting"
        | "counting"
        | "verification"
        | "certified"
        | "disputed"
        | "completed"
      election_type:
        | "presidential"
        | "parliamentary"
        | "gubernatorial"
        | "local"
        | "referendum"
        | "by_election"
        | "primary"
      observer_role:
        | "domestic_observer"
        | "international_observer"
        | "party_agent"
        | "media"
        | "election_official"
        | "security_personnel"
      ocha_document_type:
        | "sitrep"
        | "flash_update"
        | "bulletin"
        | "3w_report"
        | "meeting_notes"
        | "action_tracker"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
      ai_analysis_type: [
        "sentiment",
        "threat_detection",
        "credibility",
        "entity_extraction",
        "tone_classification",
        "anomaly_detection",
        "sentiment_and_threat",
      ],
      alert_severity_level: ["green", "yellow", "orange", "red"],
      app_role: ["citizen", "verifier", "partner", "government", "admin"],
      comm_channel_type: [
        "coordination",
        "broadcast",
        "field_report",
        "direct",
        "emergency",
      ],
      comm_message_status: [
        "draft",
        "sent",
        "delivered",
        "read",
        "acknowledged",
        "escalated",
        "archived",
      ],
      election_incident_severity: [
        "minor",
        "moderate",
        "serious",
        "critical",
        "emergency",
      ],
      election_status: [
        "draft",
        "scheduled",
        "registration",
        "campaigning",
        "voting",
        "counting",
        "verification",
        "certified",
        "disputed",
        "completed",
      ],
      election_type: [
        "presidential",
        "parliamentary",
        "gubernatorial",
        "local",
        "referendum",
        "by_election",
        "primary",
      ],
      observer_role: [
        "domestic_observer",
        "international_observer",
        "party_agent",
        "media",
        "election_official",
        "security_personnel",
      ],
      ocha_document_type: [
        "sitrep",
        "flash_update",
        "bulletin",
        "3w_report",
        "meeting_notes",
        "action_tracker",
      ],
    },
  },
} as const
