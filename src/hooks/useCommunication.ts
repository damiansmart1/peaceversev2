import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

export type AlertSeverityLevel = 'green' | 'yellow' | 'orange' | 'red';
export type ChannelType = 'coordination' | 'broadcast' | 'field_report' | 'direct' | 'emergency';
export type DocumentType = 'sitrep' | 'flash_update' | 'bulletin' | '3w_report' | 'meeting_notes' | 'action_tracker';
export type MessageStatus = 'draft' | 'sent' | 'delivered' | 'read' | 'acknowledged' | 'escalated' | 'archived';

export interface CommunicationChannel {
  id: string;
  name: string;
  description: string | null;
  channel_type: ChannelType;
  created_by: string | null;
  is_active: boolean;
  is_emergency: boolean;
  allowed_roles: string[];
  country_scope: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChannelMessage {
  id: string;
  channel_id: string;
  sender_id: string | null;
  content: string;
  message_type: string;
  priority: AlertSeverityLevel;
  attachments: any[];
  mentions: string[];
  reply_to: string | null;
  is_pinned: boolean;
  metadata: Record<string, any>;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
  sender?: {
    email: string;
    full_name?: string;
  };
}

export interface OCHADocument {
  id: string;
  document_type: DocumentType;
  title: string;
  content: Record<string, any>;
  summary: string | null;
  severity_level: AlertSeverityLevel;
  country: string | null;
  region: string | null;
  incident_ids: string[];
  created_by: string | null;
  approved_by: string | null;
  status: string;
  distribution_list: string[];
  attachments: any[];
  metadata: Record<string, any>;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface BroadcastAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverityLevel;
  alert_type: string;
  target_roles: string[];
  target_countries: string[];
  target_regions: string[];
  requires_acknowledgment: boolean;
  acknowledgment_deadline: string | null;
  created_by: string | null;
  approved_by: string | null;
  status: string;
  sent_at: string | null;
  expires_at: string | null;
  delivery_stats: {
    sent: number;
    delivered: number;
    read: number;
    acknowledged: number;
  };
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FieldReport {
  id: string;
  reporter_id: string | null;
  report_type: string;
  title: string;
  content: string;
  location_country: string | null;
  location_region: string | null;
  location_coordinates: { lat: number; lng: number } | null;
  severity: AlertSeverityLevel;
  incident_ids: string[];
  attachments: any[];
  status: string;
  assigned_to: string | null;
  priority: number;
  response_deadline: string | null;
  response_notes: string | null;
  responded_by: string | null;
  responded_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EscalationLog {
  id: string;
  rule_id: string | null;
  message_id: string | null;
  document_id: string | null;
  incident_id: string | null;
  escalation_level: number;
  escalated_to: string[];
  escalated_roles: string[] | null;
  reason: string | null;
  status: string;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  sla_deadline: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

// Channels hooks
export const useChannels = () => {
  return useQuery({
    queryKey: ['communication-channels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communication_channels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CommunicationChannel[];
    },
  });
};

export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (channel: Partial<CommunicationChannel>) => {
      const { data, error } = await supabase
        .from('communication_channels')
        .insert([channel])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-channels'] });
      toast.success('Channel created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create channel: ' + error.message);
    },
  });
};

// Channel Messages hooks
export const useChannelMessages = (channelId: string | undefined) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!channelId) return;
    
    const channel = supabase
      .channel(`channel-messages-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channel_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['channel-messages', channelId] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, queryClient]);
  
  return useQuery({
    queryKey: ['channel-messages', channelId],
    queryFn: async () => {
      if (!channelId) return [];
      
      const { data, error } = await supabase
        .from('channel_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ChannelMessage[];
    },
    enabled: !!channelId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ channelId, content, priority = 'green', messageType = 'text' }: {
      channelId: string;
      content: string;
      priority?: AlertSeverityLevel;
      messageType?: string;
    }) => {
      const { data, error } = await supabase
        .from('channel_messages')
        .insert({
          channel_id: channelId,
          sender_id: user?.id,
          content,
          priority,
          message_type: messageType,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channel-messages', variables.channelId] });
    },
    onError: (error: any) => {
      toast.error('Failed to send message: ' + error.message);
    },
  });
};

// OCHA Documents hooks
export const useOCHADocuments = (filters?: { type?: DocumentType; status?: string }) => {
  return useQuery({
    queryKey: ['ocha-documents', filters],
    queryFn: async () => {
      let query = supabase
        .from('ocha_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.type) {
        query = query.eq('document_type', filters.type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as OCHADocument[];
    },
  });
};

export const useCreateOCHADocument = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (doc: Partial<OCHADocument>) => {
      const { data, error } = await supabase
        .from('ocha_documents')
        .insert([{
          ...doc,
          created_by: user?.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocha-documents'] });
      toast.success('Document created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create document: ' + error.message);
    },
  });
};

// Broadcast Alerts hooks
export const useBroadcastAlerts = (status?: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('broadcast-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'broadcast_alerts',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['broadcast-alerts'] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  return useQuery({
    queryKey: ['broadcast-alerts', status],
    queryFn: async () => {
      let query = supabase
        .from('broadcast_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as BroadcastAlert[];
    },
  });
};

export const useCreateBroadcast = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (broadcast: Partial<BroadcastAlert>) => {
      const { data, error } = await supabase
        .from('broadcast_alerts')
        .insert([{
          ...broadcast,
          created_by: user?.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-alerts'] });
      toast.success('Broadcast created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create broadcast: ' + error.message);
    },
  });
};

export const useActivateBroadcast = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (broadcastId: string) => {
      const { data, error } = await supabase
        .from('broadcast_alerts')
        .update({
          status: 'active',
          sent_at: new Date().toISOString(),
        })
        .eq('id', broadcastId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-alerts'] });
      toast.success('Broadcast activated and sent');
    },
    onError: (error: any) => {
      toast.error('Failed to activate broadcast: ' + error.message);
    },
  });
};

// Field Reports hooks
export const useFieldReports = (filters?: { status?: string; priority?: number }) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('field-reports-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'field_reports',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['field-reports'] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  return useQuery({
    queryKey: ['field-reports', filters],
    queryFn: async () => {
      let query = supabase
        .from('field_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as FieldReport[];
    },
  });
};

export const useCreateFieldReport = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (report: Partial<FieldReport>) => {
      const { data, error } = await supabase
        .from('field_reports')
        .insert([{
          ...report,
          reporter_id: user?.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-reports'] });
      toast.success('Field report submitted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to submit field report: ' + error.message);
    },
  });
};

export const useUpdateFieldReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FieldReport> }) => {
      const { data, error } = await supabase
        .from('field_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-reports'] });
      toast.success('Field report updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update field report: ' + error.message);
    },
  });
};

// Escalation hooks
export const useEscalationLogs = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('escalation-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'escalation_logs',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['escalation-logs'] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  return useQuery({
    queryKey: ['escalation-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escalation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as EscalationLog[];
    },
  });
};

export const useAcknowledgeEscalation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (escalationId: string) => {
      const { data, error } = await supabase
        .from('escalation_logs')
        .update({
          status: 'acknowledged',
          acknowledged_by: user?.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', escalationId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-logs'] });
      toast.success('Escalation acknowledged');
    },
    onError: (error: any) => {
      toast.error('Failed to acknowledge escalation: ' + error.message);
    },
  });
};

// Acknowledgment hooks
export const useAcknowledgeMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ messageId, note }: { messageId: string; note?: string }) => {
      const { data, error } = await supabase
        .from('message_acknowledgments')
        .insert({
          message_id: messageId,
          user_id: user?.id,
          acknowledgment_note: note,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-messages'] });
      toast.success('Message acknowledged');
    },
    onError: (error: any) => {
      toast.error('Failed to acknowledge message: ' + error.message);
    },
  });
};

export const useAcknowledgeBroadcast = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ broadcastId, note }: { broadcastId: string; note?: string }) => {
      const { data, error } = await supabase
        .from('broadcast_acknowledgments')
        .insert({
          broadcast_id: broadcastId,
          user_id: user?.id,
          acknowledgment_note: note,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-alerts'] });
      toast.success('Alert acknowledged');
    },
    onError: (error: any) => {
      toast.error('Failed to acknowledge alert: ' + error.message);
    },
  });
};
