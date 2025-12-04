import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, CheckCircle, AlertTriangle, User, Bot, 
  FileText, Shield, Eye, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineEvent {
  id: string;
  type: 'submission' | 'ai_analysis' | 'assignment' | 'review' | 'verification' | 'escalation' | 'comment';
  title: string;
  description: string;
  timestamp: string;
  actor: {
    type: 'user' | 'system' | 'ai';
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

interface VerificationTimelineProps {
  reportId: string;
  events?: TimelineEvent[];
}

// Mock timeline events
const MOCK_EVENTS: TimelineEvent[] = [
  {
    id: '1',
    type: 'submission',
    title: 'Report Submitted',
    description: 'Incident report submitted via mobile app with 2 photos and GPS coordinates',
    timestamp: '2024-12-03T14:30:00Z',
    actor: { type: 'user', name: 'Peace Advocate' },
  },
  {
    id: '2',
    type: 'ai_analysis',
    title: 'AI Analysis Complete',
    description: 'Automated analysis detected high-priority incident. Credibility score: 78%. Threat level: Medium-High.',
    timestamp: '2024-12-03T14:30:15Z',
    actor: { type: 'ai', name: 'Peaceverse AI' },
    metadata: { credibilityScore: 78, threatLevel: 'medium-high', sentiment: 'negative' },
  },
  {
    id: '3',
    type: 'assignment',
    title: 'Task Created & Prioritized',
    description: 'Verification task created with HIGH priority based on AI risk assessment',
    timestamp: '2024-12-03T14:30:20Z',
    actor: { type: 'system', name: 'System' },
    metadata: { priority: 'high' },
  },
  {
    id: '4',
    type: 'assignment',
    title: 'Task Claimed',
    description: 'Verification task claimed by certified verifier',
    timestamp: '2024-12-03T15:45:00Z',
    actor: { type: 'user', name: 'Verifier_KE_001' },
  },
  {
    id: '5',
    type: 'review',
    title: 'Evidence Review Started',
    description: 'Verifier began reviewing attached photos and location data',
    timestamp: '2024-12-03T15:47:00Z',
    actor: { type: 'user', name: 'Verifier_KE_001' },
  },
  {
    id: '6',
    type: 'comment',
    title: 'Verification Note Added',
    description: 'Photo metadata confirms location matches reported GPS coordinates. Timeline consistent.',
    timestamp: '2024-12-03T15:55:00Z',
    actor: { type: 'user', name: 'Verifier_KE_001' },
  },
  {
    id: '7',
    type: 'review',
    title: 'Cross-Reference Check',
    description: 'Found 2 corroborating reports from same area within 24 hours',
    timestamp: '2024-12-03T16:05:00Z',
    actor: { type: 'user', name: 'Verifier_KE_001' },
  },
];

const EVENT_ICONS = {
  submission: <FileText className="w-4 h-4" />,
  ai_analysis: <Bot className="w-4 h-4" />,
  assignment: <User className="w-4 h-4" />,
  review: <Eye className="w-4 h-4" />,
  verification: <CheckCircle className="w-4 h-4" />,
  escalation: <AlertTriangle className="w-4 h-4" />,
  comment: <MessageSquare className="w-4 h-4" />,
};

const EVENT_COLORS = {
  submission: 'bg-blue-500',
  ai_analysis: 'bg-purple-500',
  assignment: 'bg-yellow-500',
  review: 'bg-cyan-500',
  verification: 'bg-green-500',
  escalation: 'bg-red-500',
  comment: 'bg-gray-500',
};

export const VerificationTimeline = ({ reportId, events = MOCK_EVENTS }: VerificationTimelineProps) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeDiff = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Verification Timeline
          </CardTitle>
          <Badge variant="outline">
            {events.length} Events
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          {/* Events */}
          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-10"
              >
                {/* Event Icon */}
                <div className={`absolute left-0 w-8 h-8 rounded-full ${EVENT_COLORS[event.type]} flex items-center justify-center text-white`}>
                  {EVENT_ICONS[event.type]}
                </div>

                {/* Event Content */}
                <div className="p-3 rounded-lg border bg-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{event.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.description}
                      </p>

                      {/* Actor */}
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={event.actor.avatar} />
                          <AvatarFallback className="text-xs">
                            {event.actor.type === 'ai' ? '🤖' : event.actor.type === 'system' ? '⚙️' : event.actor.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {event.actor.name}
                        </span>
                      </div>

                      {/* Metadata */}
                      {event.metadata && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-medium">{getTimeDiff(event.timestamp)}</div>
                      <div className="text-xs text-muted-foreground">{formatTime(event.timestamp)}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-medium">Current Status: In Review</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Verification in progress. Awaiting final decision from assigned verifier.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
