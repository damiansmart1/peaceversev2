import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Globe, 
  Plus,
  MapPin,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Send,
  MessageSquare,
  ArrowRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  useFieldReports, 
  useCreateFieldReport,
  useUpdateFieldReport,
  AlertSeverityLevel,
  FieldReport
} from '@/hooks/useCommunication';
import { useAuth } from '@/contexts/AuthContext';

const reportTypes = [
  { value: 'situation', label: 'Situation Update', icon: Globe },
  { value: 'assessment', label: 'Needs Assessment', icon: MessageSquare },
  { value: 'request', label: 'Resource Request', icon: AlertCircle },
  { value: 'update', label: 'Activity Update', icon: RefreshCw },
];

const priorityConfig: Record<number, { label: string; color: string }> = {
  1: { label: 'Urgent', color: 'bg-red-500' },
  2: { label: 'High', color: 'bg-orange-500' },
  3: { label: 'Medium', color: 'bg-yellow-500' },
  4: { label: 'Low', color: 'bg-green-500' },
};

const severityColors: Record<AlertSeverityLevel, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-500', icon: Send },
  received: { label: 'Received', color: 'bg-purple-500', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-yellow-500', icon: RefreshCw },
  actioned: { label: 'Actioned', color: 'bg-green-500', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-500', icon: CheckCircle },
};

const FieldReportingCenter: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // Form state
  const [reportType, setReportType] = useState('situation');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [severity, setSeverity] = useState<AlertSeverityLevel>('green');
  const [priority, setPriority] = useState(3);
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  
  const { user } = useAuth();
  const { data: reports, isLoading, refetch } = useFieldReports(
    statusFilter !== 'all' || priorityFilter !== 'all' 
      ? { 
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? parseInt(priorityFilter) : undefined
        } 
      : undefined
  );
  const createReport = useCreateFieldReport();
  const updateReport = useUpdateFieldReport();

  const handleCreate = async () => {
    await createReport.mutateAsync({
      report_type: reportType,
      title,
      content,
      severity,
      priority,
      location_country: country,
      location_region: region,
    });
    
    setTitle('');
    setContent('');
    setSeverity('green');
    setPriority(3);
    setCountry('');
    setRegion('');
    setIsCreateOpen(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await updateReport.mutateAsync({
      id,
      updates: { 
        status: newStatus,
        responded_at: newStatus === 'actioned' ? new Date().toISOString() : undefined,
        responded_by: newStatus === 'actioned' ? user?.id : undefined,
      },
    });
    setSelectedReport(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {Object.entries(priorityConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Submit Field Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Submit Field Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {/* Report Type Selection */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {reportTypes.map((type) => (
                  <Card 
                    key={type.value}
                    className={`cursor-pointer transition-all ${
                      reportType === type.value ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setReportType(type.value)}
                  >
                    <CardContent className="p-3 text-center">
                      <type.icon className={`h-5 w-5 mx-auto mb-1 ${reportType === type.value ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="font-medium text-xs">{type.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority.toString()} onValueChange={(v) => setPriority(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${config.color}`} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severity Level</Label>
                  <Select value={severity} onValueChange={(v) => setSeverity(v as AlertSeverityLevel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">Green - Normal</SelectItem>
                      <SelectItem value="yellow">Yellow - Elevated</SelectItem>
                      <SelectItem value="orange">Orange - High</SelectItem>
                      <SelectItem value="red">Red - Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., Kenya"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Region/Location</Label>
                  <Input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g., Turkana County"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Report Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of the report..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Detailed Report</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide detailed information, observations, and recommendations..."
                  rows={6}
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!title || !content} className="gap-2">
                  <Send className="h-4 w-4" />
                  Submit Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      <ScrollArea className="h-[calc(100vh-450px)] min-h-[400px]">
        <div className="space-y-3 pr-4">
          <AnimatePresence>
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Loading field reports...
                </CardContent>
              </Card>
            ) : reports?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="font-semibold mb-1">No Field Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    Submit a report from the field
                  </p>
                </CardContent>
              </Card>
            ) : (
              reports?.map((report, index) => {
                const status = statusConfig[report.status] || statusConfig.submitted;
                const priorityCfg = priorityConfig[report.priority] || priorityConfig[3];
                const StatusIcon = status.icon;
                
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedReport(report)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${severityColors[report.severity]}/10 shrink-0`}>
                            <Globe className={`h-5 w-5`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {reportTypes.find(t => t.value === report.report_type)?.label || report.report_type}
                              </Badge>
                              <Badge className={`${priorityCfg.color} text-white text-xs`}>
                                {priorityCfg.label}
                              </Badge>
                              <Badge className={`${status.color} text-white text-xs`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                            
                            <h3 className="font-semibold truncate">{report.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {report.content}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              {(report.location_country || report.location_region) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {[report.location_region, report.location_country].filter(Boolean).join(', ')}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          
                          <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${severityColors[selectedReport.severity]}/10`}>
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {reportTypes.find(t => t.value === selectedReport.report_type)?.label}
                      </Badge>
                      <Badge className={`${priorityConfig[selectedReport.priority]?.color} text-white`}>
                        {priorityConfig[selectedReport.priority]?.label}
                      </Badge>
                    </div>
                    <DialogTitle>{selectedReport.title}</DialogTitle>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 pt-4">
                {/* Status & Location */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <Badge className={`${statusConfig[selectedReport.status]?.color} text-white mt-1`}>
                      {statusConfig[selectedReport.status]?.label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Location</Label>
                    <p className="font-medium mt-1">
                      {[selectedReport.location_region, selectedReport.location_country].filter(Boolean).join(', ') || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Submitted</Label>
                    <p className="font-medium mt-1">
                      {format(new Date(selectedReport.created_at), 'PPp')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Severity</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`w-3 h-3 rounded-full ${severityColors[selectedReport.severity]}`} />
                      <span className="font-medium capitalize">{selectedReport.severity}</span>
                    </div>
                  </div>
                </div>
                
                {/* Report Content */}
                <div>
                  <Label className="text-muted-foreground">Report Details</Label>
                  <Card className="mt-2">
                    <CardContent className="p-4">
                      <p className="whitespace-pre-wrap">{selectedReport.content}</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Response Notes */}
                {selectedReport.response_notes && (
                  <div>
                    <Label className="text-muted-foreground">Response Notes</Label>
                    <Card className="mt-2 border-green-500/30 bg-green-500/5">
                      <CardContent className="p-4">
                        <p className="whitespace-pre-wrap">{selectedReport.response_notes}</p>
                        {selectedReport.responded_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Responded: {format(new Date(selectedReport.responded_at), 'PPp')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  {selectedReport.status === 'submitted' && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleUpdateStatus(selectedReport.id, 'received')}
                    >
                      Mark as Received
                    </Button>
                  )}
                  {selectedReport.status === 'received' && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleUpdateStatus(selectedReport.id, 'processing')}
                    >
                      Start Processing
                    </Button>
                  )}
                  {selectedReport.status === 'processing' && (
                    <Button 
                      onClick={() => handleUpdateStatus(selectedReport.id, 'actioned')}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Actioned
                    </Button>
                  )}
                  {selectedReport.status === 'actioned' && (
                    <Button 
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedReport.id, 'closed')}
                    >
                      Close Report
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FieldReportingCenter;
