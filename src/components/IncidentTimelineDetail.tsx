import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle2, Clock, Search, AlertTriangle, CheckCheck, XCircle, 
  FileText, Shield, Users, MessageSquare, AlertCircle, ArrowUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIncidentTimeline, TimelineEvent } from '@/hooks/useIncidentTimeline';
import { Skeleton } from '@/components/ui/skeleton';

interface IncidentTimelineDetailProps {
  incidentId: string;
  incidentTitle?: string;
}

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  submitted: FileText,
  pending: Clock,
  under_review: Search,
  verified: CheckCircle2,
  verification_verified: CheckCheck,
  verification_pending_verification: Clock,
  verification_rejected: XCircle,
  escalated: AlertTriangle,
  resolved: Shield,
  action_taken: CheckCircle2,
  comment: MessageSquare,
};

const EVENT_COLORS: Record<string, string> = {
  submitted: 'bg-primary/10 text-primary border-primary/30',
  pending: 'bg-muted text-muted-foreground border-border',
  under_review: 'bg-warning/10 text-warning border-warning/30',
  verified: 'bg-green-500/10 text-green-600 border-green-500/30',
  verification_verified: 'bg-green-500/10 text-green-600 border-green-500/30',
  verification_pending_verification: 'bg-warning/10 text-warning border-warning/30',
  verification_rejected: 'bg-destructive/10 text-destructive border-destructive/30',
  escalated: 'bg-destructive/10 text-destructive border-destructive/30',
  resolved: 'bg-secondary/10 text-secondary border-secondary/30',
  action_taken: 'bg-green-500/10 text-green-600 border-green-500/30',
  comment: 'bg-muted text-muted-foreground border-border',
};

export const IncidentTimelineDetail = ({ incidentId, incidentTitle }: IncidentTimelineDetailProps) => {
  const { data: timeline, isLoading } = useIncidentTimeline(incidentId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No timeline events recorded yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Incident Timeline
        </CardTitle>
        {incidentTitle && (
          <p className="text-sm text-muted-foreground line-clamp-1">{incidentTitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="relative space-y-0">
            {/* Vertical connecting line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-primary via-secondary to-muted" />

            {timeline.map((event, index) => {
              const Icon = EVENT_ICONS[event.event_type] || AlertCircle;
              const colorClass = EVENT_COLORS[event.event_type] || 'bg-muted text-muted-foreground border-border';
              const isFirst = index === 0;
              const isLast = index === timeline.length - 1;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="relative flex gap-4 pb-6"
                >
                  {/* Timeline node */}
                  <div className="relative z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.1, duration: 0.2, type: 'spring' }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${colorClass}`}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                    {isLast && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-primary/20"
                      />
                    )}
                  </div>

                  {/* Event content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">
                          {event.event_title}
                        </h4>
                        {event.event_description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {event.event_description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </Badge>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(event.created_at), 'MMM d, yyyy HH:mm')}
                      </span>
                      {event.actor_name && (
                        <Badge variant="secondary" className="text-[10px]">
                          <Users className="w-2.5 h-2.5 mr-1" />
                          {event.actor_name}
                        </Badge>
                      )}
                      {event.actor_role && (
                        <Badge variant="outline" className="text-[10px]">
                          {event.actor_role}
                        </Badge>
                      )}
                    </div>

                    {/* Additional metadata display */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {event.metadata.category && (
                          <Badge variant="outline" className="text-[10px]">
                            {event.metadata.category}
                          </Badge>
                        )}
                        {event.metadata.severity && (
                          <Badge 
                            variant={event.metadata.severity === 'critical' ? 'destructive' : 'secondary'} 
                            className="text-[10px]"
                          >
                            {event.metadata.severity}
                          </Badge>
                        )}
                        {event.metadata.old_status && event.metadata.new_status && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="capitalize">{event.metadata.old_status}</span>
                            <ArrowUp className="w-2.5 h-2.5 rotate-90" />
                            <span className="capitalize font-medium">{event.metadata.new_status}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Current status indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: timeline.length * 0.05 + 0.2 }}
              className="relative flex gap-4 items-center"
            >
              <div className="w-10 flex justify-center">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              </div>
              <span className="text-xs text-muted-foreground">Current Status</span>
            </motion.div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
