import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  Clock,
  CheckCircle,
  XCircle,
  ArrowUp,
  Bell,
  Users,
  Timer,
  Activity,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { 
  useEscalationLogs, 
  useAcknowledgeEscalation,
  EscalationLog
} from '@/hooks/useCommunication';

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  pending: { label: 'Pending', color: 'bg-orange-500', icon: Clock },
  acknowledged: { label: 'Acknowledged', color: 'bg-blue-500', icon: CheckCircle },
  resolved: { label: 'Resolved', color: 'bg-green-500', icon: CheckCircle },
  timeout: { label: 'Timed Out', color: 'bg-red-500', icon: XCircle },
};

const EscalationManager: React.FC = () => {
  const [selectedEscalation, setSelectedEscalation] = useState<EscalationLog | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [responseNote, setResponseNote] = useState('');
  
  const { data: escalations, isLoading, refetch } = useEscalationLogs();
  const acknowledgeEscalation = useAcknowledgeEscalation();

  const filteredEscalations = escalations?.filter(e => 
    statusFilter === 'all' || e.status === statusFilter
  );

  const handleAcknowledge = async (id: string) => {
    await acknowledgeEscalation.mutateAsync(id);
    setSelectedEscalation(null);
    setResponseNote('');
  };

  // Stats calculations
  const stats = {
    pending: escalations?.filter(e => e.status === 'pending').length || 0,
    acknowledged: escalations?.filter(e => e.status === 'acknowledged').length || 0,
    resolved: escalations?.filter(e => e.status === 'resolved').length || 0,
    timeout: escalations?.filter(e => e.status === 'timeout').length || 0,
  };

  const calculateSLAProgress = (escalation: EscalationLog) => {
    if (!escalation.sla_deadline) return 100;
    const now = new Date();
    const deadline = new Date(escalation.sla_deadline);
    const created = new Date(escalation.created_at);
    const total = differenceInMinutes(deadline, created);
    const elapsed = differenceInMinutes(now, created);
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const getSLAStatus = (escalation: EscalationLog) => {
    if (!escalation.sla_deadline) return 'normal';
    const progress = calculateSLAProgress(escalation);
    if (progress >= 100) return 'breached';
    if (progress >= 75) return 'critical';
    if (progress >= 50) return 'warning';
    return 'normal';
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.acknowledged}</p>
                <p className="text-sm text-muted-foreground">Acknowledged</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.timeout}</p>
                <p className="text-sm text-muted-foreground">Timed Out</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <div className="flex-1" />
        
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" />
          Real-time updates enabled
        </Badge>
      </div>

      {/* Escalation List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Escalation Queue
          </CardTitle>
          <CardDescription>
            Active escalations requiring attention with SLA tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              <AnimatePresence>
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading escalations...
                  </div>
                ) : filteredEscalations?.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="font-semibold mb-1">No Escalations</h3>
                    <p className="text-sm text-muted-foreground">
                      All caught up! No pending escalations.
                    </p>
                  </div>
                ) : (
                  filteredEscalations?.map((escalation, index) => {
                    const status = statusConfig[escalation.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    const slaProgress = calculateSLAProgress(escalation);
                    const slaStatus = getSLAStatus(escalation);
                    
                    return (
                      <motion.div
                        key={escalation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                          escalation.status === 'pending' ? 'bg-orange-500/5 border-orange-500/30' :
                          escalation.status === 'timeout' ? 'bg-red-500/5 border-red-500/30' :
                          'bg-muted/50'
                        }`}
                        onClick={() => setSelectedEscalation(escalation)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${status.color}/10`}>
                            <ArrowUp className={`h-5 w-5 text-${status.color.replace('bg-', '')}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${status.color} text-white text-xs`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Level {escalation.escalation_level}
                              </Badge>
                              {escalation.escalated_roles && (
                                <Badge variant="secondary" className="text-xs">
                                  <Users className="h-3 w-3 mr-1" />
                                  {escalation.escalated_roles.join(', ')}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="font-medium">
                              {escalation.reason || 'Escalation triggered'}
                            </p>
                            
                            {escalation.sla_deadline && escalation.status === 'pending' && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <Timer className="h-3 w-3" />
                                    SLA Deadline
                                  </span>
                                  <span className={
                                    slaStatus === 'breached' ? 'text-red-600 font-medium' :
                                    slaStatus === 'critical' ? 'text-orange-600' :
                                    slaStatus === 'warning' ? 'text-yellow-600' :
                                    'text-muted-foreground'
                                  }>
                                    {slaStatus === 'breached' ? 'BREACHED' : 
                                     formatDistanceToNow(new Date(escalation.sla_deadline), { addSuffix: true })}
                                  </span>
                                </div>
                                <Progress 
                                  value={slaProgress} 
                                  className={`h-1.5 ${
                                    slaStatus === 'breached' ? '[&>div]:bg-red-500' :
                                    slaStatus === 'critical' ? '[&>div]:bg-orange-500' :
                                    slaStatus === 'warning' ? '[&>div]:bg-yellow-500' :
                                    '[&>div]:bg-green-500'
                                  }`}
                                />
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(escalation.created_at), { addSuffix: true })}
                              </span>
                              {escalation.acknowledged_at && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  Ack'd {formatDistanceToNow(new Date(escalation.acknowledged_at), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {escalation.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcknowledge(escalation.id);
                              }}
                              className="shrink-0"
                            >
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Escalation Detail Dialog */}
      <Dialog open={!!selectedEscalation} onOpenChange={() => setSelectedEscalation(null)}>
        <DialogContent className="max-w-2xl">
          {selectedEscalation && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${statusConfig[selectedEscalation.status]?.color}/10`}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge className={`${statusConfig[selectedEscalation.status]?.color} text-white mb-1`}>
                      {statusConfig[selectedEscalation.status]?.label}
                    </Badge>
                    <DialogTitle>Escalation Level {selectedEscalation.escalation_level}</DialogTitle>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 pt-4">
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-muted-foreground text-xs">Created</Label>
                    <p className="font-medium">{format(new Date(selectedEscalation.created_at), 'PPp')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Escalated To</Label>
                    <p className="font-medium">{selectedEscalation.escalated_roles?.join(', ') || 'Not specified'}</p>
                  </div>
                  {selectedEscalation.sla_deadline && (
                    <>
                      <div>
                        <Label className="text-muted-foreground text-xs">SLA Deadline</Label>
                        <p className="font-medium">{format(new Date(selectedEscalation.sla_deadline), 'PPp')}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Time Remaining</Label>
                        <p className={`font-medium ${
                          getSLAStatus(selectedEscalation) === 'breached' ? 'text-red-600' : ''
                        }`}>
                          {getSLAStatus(selectedEscalation) === 'breached' 
                            ? 'BREACHED' 
                            : formatDistanceToNow(new Date(selectedEscalation.sla_deadline), { addSuffix: true })}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Reason */}
                {selectedEscalation.reason && (
                  <div>
                    <Label className="text-muted-foreground">Reason</Label>
                    <Card className="mt-2">
                      <CardContent className="p-4">
                        <p>{selectedEscalation.reason}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Acknowledgment Info */}
                {selectedEscalation.acknowledged_at && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle className="h-5 w-5" />
                      Acknowledged
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(selectedEscalation.acknowledged_at), 'PPp')}
                    </p>
                  </div>
                )}
                
                {/* Response Actions */}
                {selectedEscalation.status === 'pending' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Response Note (Optional)</Label>
                      <Textarea
                        value={responseNote}
                        onChange={(e) => setResponseNote(e.target.value)}
                        placeholder="Add any notes about your response..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button variant="outline" onClick={() => setSelectedEscalation(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleAcknowledge(selectedEscalation.id)} className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Acknowledge Escalation
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EscalationManager;
