import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Radio, 
  Plus,
  Send,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Users,
  Globe,
  Megaphone,
  Activity,
  Eye,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  useBroadcastAlerts, 
  useCreateBroadcast, 
  useActivateBroadcast,
  useAcknowledgeBroadcast,
  AlertSeverityLevel,
  BroadcastAlert
} from '@/hooks/useCommunication';

const severityConfig: Record<AlertSeverityLevel, { color: string; bg: string; label: string }> = {
  green: { color: 'text-green-600', bg: 'bg-green-500/10', label: 'Advisory' },
  yellow: { color: 'text-yellow-600', bg: 'bg-yellow-500/10', label: 'Watch' },
  orange: { color: 'text-orange-600', bg: 'bg-orange-500/10', label: 'Warning' },
  red: { color: 'text-red-600', bg: 'bg-red-500/10', label: 'Emergency' },
};

const alertTypes = [
  { value: 'general', label: 'General Information' },
  { value: 'emergency', label: 'Emergency Alert' },
  { value: 'security', label: 'Security Advisory' },
  { value: 'weather', label: 'Weather Warning' },
  { value: 'health', label: 'Health Alert' },
];

const targetRoles = [
  { value: 'citizen', label: 'Citizens' },
  { value: 'verifier', label: 'Verifiers' },
  { value: 'partner', label: 'Partner Organizations' },
  { value: 'government', label: 'Government Officials' },
];

const BroadcastCenter: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastAlert | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertSeverityLevel>('yellow');
  const [alertType, setAlertType] = useState('general');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['citizen']);
  const [requiresAck, setRequiresAck] = useState(false);
  
  const { data: broadcasts, isLoading } = useBroadcastAlerts(filter === 'all' ? undefined : filter);
  const createBroadcast = useCreateBroadcast();
  const activateBroadcast = useActivateBroadcast();
  const acknowledgeBroadcast = useAcknowledgeBroadcast();

  const handleCreate = async () => {
    await createBroadcast.mutateAsync({
      title,
      message,
      severity,
      alert_type: alertType,
      target_roles: selectedRoles,
      requires_acknowledgment: requiresAck,
    });
    
    setTitle('');
    setMessage('');
    setSeverity('yellow');
    setAlertType('general');
    setSelectedRoles(['citizen']);
    setRequiresAck(false);
    setIsCreateOpen(false);
  };

  const handleActivate = async (id: string) => {
    await activateBroadcast.mutateAsync(id);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Approval</Badge>;
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Broadcasts</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Broadcast
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Create Emergency Broadcast
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Alert Severity</Label>
                  <Select value={severity} onValueChange={(v) => setSeverity(v as AlertSeverityLevel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(severityConfig) as [AlertSeverityLevel, typeof severityConfig.green][]).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full bg-${key}-500`} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Alert Type</Label>
                  <Select value={alertType} onValueChange={setAlertType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {alertTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief, clear alert title..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detailed alert message with actions to take..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Target Audience</Label>
                <div className="grid grid-cols-2 gap-3">
                  {targetRoles.map((role) => (
                    <div key={role.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={role.value}
                        checked={selectedRoles.includes(role.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRoles([...selectedRoles, role.value]);
                          } else {
                            setSelectedRoles(selectedRoles.filter(r => r !== role.value));
                          }
                        }}
                      />
                      <label htmlFor={role.value} className="text-sm font-medium">
                        {role.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-base">Require Acknowledgment</Label>
                  <p className="text-sm text-muted-foreground">
                    Recipients must confirm they received this alert
                  </p>
                </div>
                <Switch checked={requiresAck} onCheckedChange={setRequiresAck} />
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!title || !message}>
                  Create Broadcast
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Broadcasts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {isLoading ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading broadcasts...
              </CardContent>
            </Card>
          ) : broadcasts?.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-semibold mb-1">No Broadcasts</h3>
                <p className="text-sm text-muted-foreground">
                  Create a new broadcast to alert stakeholders
                </p>
              </CardContent>
            </Card>
          ) : (
            broadcasts?.map((broadcast, index) => (
              <motion.div
                key={broadcast.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`h-full ${severityConfig[broadcast.severity].bg} border-l-4 border-l-${broadcast.severity}-500`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-5 w-5 ${severityConfig[broadcast.severity].color}`} />
                        <Badge variant="outline" className="text-xs">
                          {broadcast.alert_type}
                        </Badge>
                      </div>
                      {statusBadge(broadcast.status)}
                    </div>
                    <CardTitle className="text-lg mt-2">{broadcast.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {broadcast.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {broadcast.target_roles?.join(', ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(broadcast.created_at), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    
                    {broadcast.status === 'active' && broadcast.delivery_stats && (
                      <div className="grid grid-cols-4 gap-2 p-2 bg-background/50 rounded-lg">
                        <div className="text-center">
                          <p className="text-lg font-bold">{broadcast.delivery_stats.sent}</p>
                          <p className="text-xs text-muted-foreground">Sent</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{broadcast.delivery_stats.delivered}</p>
                          <p className="text-xs text-muted-foreground">Delivered</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{broadcast.delivery_stats.read}</p>
                          <p className="text-xs text-muted-foreground">Read</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{broadcast.delivery_stats.acknowledged}</p>
                          <p className="text-xs text-muted-foreground">Ack'd</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {broadcast.status === 'draft' && (
                        <Button 
                          size="sm" 
                          className="flex-1 gap-1"
                          onClick={() => handleActivate(broadcast.id)}
                        >
                          <Send className="h-3 w-3" />
                          Activate
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setSelectedBroadcast(broadcast)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Broadcast Detail Dialog */}
      <Dialog open={!!selectedBroadcast} onOpenChange={() => setSelectedBroadcast(null)}>
        <DialogContent className="max-w-2xl">
          {selectedBroadcast && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${severityConfig[selectedBroadcast.severity].bg}`}>
                    <AlertTriangle className={`h-6 w-6 ${severityConfig[selectedBroadcast.severity].color}`} />
                  </div>
                  <div>
                    <DialogTitle>{selectedBroadcast.title}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedBroadcast.alert_type} • {format(new Date(selectedBroadcast.created_at), 'PPp')}
                    </p>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedBroadcast.message}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Severity Level</Label>
                    <p className="font-medium">{severityConfig[selectedBroadcast.severity].label}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">{statusBadge(selectedBroadcast.status)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Target Audience</Label>
                    <p className="font-medium">{selectedBroadcast.target_roles?.join(', ')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Requires Acknowledgment</Label>
                    <p className="font-medium">{selectedBroadcast.requires_acknowledgment ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                {selectedBroadcast.status === 'active' && selectedBroadcast.delivery_stats && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Delivery Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-2xl font-bold">{selectedBroadcast.delivery_stats.sent}</p>
                          <p className="text-xs text-muted-foreground">Sent</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-2xl font-bold">{selectedBroadcast.delivery_stats.delivered}</p>
                          <p className="text-xs text-muted-foreground">Delivered</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-2xl font-bold">{selectedBroadcast.delivery_stats.read}</p>
                          <p className="text-xs text-muted-foreground">Read</p>
                        </div>
                        <div className="text-center p-3 bg-green-500/10 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{selectedBroadcast.delivery_stats.acknowledged}</p>
                          <p className="text-xs text-muted-foreground">Acknowledged</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BroadcastCenter;
