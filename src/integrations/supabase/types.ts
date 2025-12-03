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
            foreignKeyName: "incident_correlations_related_incident_id_fkey"
            columns: ["related_incident_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
        ]
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
          status: string
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
          status?: string
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
          status?: string
          title?: string
          updated_at?: string
          visibility?: string
          votes_abstain?: number
          votes_against?: number
          votes_for?: number
        }
        Relationships: []
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
      safe_spaces: {
        Row: {
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
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          latitude?: number | null
          location_name: string
          longitude?: number | null
          name: string
          space_type?: string
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
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
        ]
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
    }
    Views: {
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
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
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
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
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
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
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
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
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
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
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
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
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
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
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
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
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
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
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
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
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
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
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
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number }
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
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
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
      app_role: "citizen" | "verifier" | "partner" | "government" | "admin"
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
      app_role: ["citizen", "verifier", "partner", "government", "admin"],
    },
  },
} as const
