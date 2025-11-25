import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Search, AlertTriangle, CheckCheck, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TimelineStage {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
  timestamp?: string;
  details?: string;
}

interface ReportStatusTimelineProps {
  report: any;
}

export const ReportStatusTimeline = ({ report }: ReportStatusTimelineProps) => {
  const getStages = (): TimelineStage[] => {
    const stages: TimelineStage[] = [
      {
        id: 'submitted',
        label: 'Submitted',
        icon: <CheckCircle2 className="h-5 w-5" />,
        completed: true,
        active: false,
        timestamp: report.created_at,
        details: 'Report received and logged in the system',
      },
    ];

    const hasVerificationTask = report.verification_tasks && report.verification_tasks.length > 0;
    const verificationTask = hasVerificationTask ? report.verification_tasks[0] : null;
    
    // Review stage
    const isReviewing = report.status === 'pending' || report.status === 'under_review';
    stages.push({
      id: 'review',
      label: 'Under Review',
      icon: <Search className="h-5 w-5" />,
      completed: hasVerificationTask || report.verification_status === 'verified',
      active: isReviewing && !hasVerificationTask,
      timestamp: verificationTask?.created_at,
      details: hasVerificationTask 
        ? 'Assigned to verification team' 
        : isReviewing 
          ? 'Awaiting assignment to verifier'
          : undefined,
    });

    // Verification stage
    const isVerifying = verificationTask?.status === 'in_progress' || verificationTask?.status === 'pending';
    stages.push({
      id: 'verification',
      label: 'Verification',
      icon: <CheckCheck className="h-5 w-5" />,
      completed: report.verification_status === 'verified' || report.verification_status === 'rejected',
      active: isVerifying,
      timestamp: report.verified_at,
      details: report.verification_status === 'verified'
        ? `Verified by ${report.verified_by_profile?.display_name || 'Verification Team'}`
        : isVerifying
          ? `Being reviewed by ${verificationTask?.assigned_user?.display_name || 'Verifier'}`
          : report.verification_status === 'rejected'
            ? 'Report could not be verified'
            : undefined,
    });

    // Resolution stage
    const isResolved = report.resolution_status === 'resolved' || report.resolution_status === 'closed';
    const isRejected = report.verification_status === 'rejected';
    
    stages.push({
      id: 'resolution',
      label: isRejected ? 'Closed' : 'Action Taken',
      icon: isRejected ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />,
      completed: isResolved || isRejected,
      active: report.resolution_status === 'in_progress',
      timestamp: report.resolution_date,
      details: report.resolution_notes || (isResolved ? 'Report has been addressed' : undefined),
    });

    return stages;
  };

  const stages = getStages();
  const currentStageIndex = stages.findIndex(s => s.active);
  const completedCount = stages.filter(s => s.completed).length;
  const progressPercentage = (completedCount / stages.length) * 100;

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with status */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{report.title}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="uppercase tracking-wide">
              {report.category}
            </Badge>
            <Badge variant={getSeverityColor(report.severity_level)} className="uppercase tracking-wide">
              {report.severity_level || 'Medium'} Priority
            </Badge>
            {report.verification_status === 'verified' && (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 uppercase tracking-wide">
                Verified
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Report ID: {report.id.slice(0, 8)}</p>
          <p>{format(new Date(report.created_at), 'MMM dd, yyyy')}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-foreground">Progress</span>
          <span className="text-muted-foreground">{completedCount} of {stages.length} stages</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-8 pl-8">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1;
          
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="relative"
            >
              {/* Icon */}
              <div
                className={`absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  stage.completed
                    ? 'bg-primary border-primary text-primary-foreground'
                    : stage.active
                      ? 'bg-background border-primary text-primary animate-pulse'
                      : 'bg-background border-border text-muted-foreground'
                }`}
              >
                {stage.completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : stage.active ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold uppercase tracking-wide text-sm ${
                    stage.completed || stage.active ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {stage.label}
                  </h4>
                  {stage.active && (
                    <Badge variant="default" className="uppercase tracking-wide text-xs">
                      In Progress
                    </Badge>
                  )}
                </div>
                
                {stage.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(stage.timestamp), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
                
                {stage.details && (
                  <p className="text-sm text-muted-foreground">{stage.details}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional info */}
      {report.location_city && (
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Location:</span> {report.location_city}
            {report.location_region && `, ${report.location_region}`}
            {report.location_country && ` - ${report.location_country}`}
          </p>
        </div>
      )}
    </div>
  );
};
