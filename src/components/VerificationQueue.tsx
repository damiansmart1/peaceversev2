import { useState, useEffect } from 'react';
import { useVerificationTasks, useMyTasks } from '@/hooks/useVerificationTasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, Clock, CheckCircle, AlertTriangle, MapPin, Calendar, User, 
  Search, Filter, TrendingUp, Eye, FileText, Activity, RefreshCw
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VerificationTaskDetail } from './VerificationTaskDetail';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
const PRIORITY_COLORS = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

const STATUS_COLORS = {
  pending: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  escalated: 'bg-red-500',
};

export const VerificationQueue = () => {
  const { tasks, isLoading, assignTask, isAssigning, refetch } = useVerificationTasks();
  const { data: myTasks, refetch: refetchMyTasks } = useMyTasks();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Real-time subscription for verification tasks and citizen reports
  useEffect(() => {
    const channel = supabase
      .channel('verification-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verification_tasks'
        },
        (payload) => {
          console.log('Verification task update:', payload);
          refetch();
          refetchMyTasks();
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Report for Verification',
              description: 'A new incident report has been submitted for verification.',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'citizen_reports'
        },
        (payload) => {
          console.log('Citizen report update:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, refetchMyTasks, toast]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), refetchMyTasks()]);
    setIsRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Verification queue has been updated.',
    });
  };
  const filteredTasks = (tasks || []).filter(t => {
    const matchesSearch = !searchQuery || 
      t.citizen_reports?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.citizen_reports?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.citizen_reports?.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || t.citizen_reports?.category === categoryFilter;
    
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const availableTasks = filteredTasks.filter(t => t.status === 'pending');
  const activeTasks = myTasks || [];

  // Statistics
  const allTasks = tasks || [];
  const criticalCount = allTasks.filter(t => t.priority === 'critical' && t.status === 'pending').length;
  const highCount = allTasks.filter(t => t.priority === 'high' && t.status === 'pending').length;
  const avgCredibility = allTasks.length > 0 
    ? allTasks.reduce((acc, t) => acc + (t.credibility_score || t.citizen_reports?.credibility_score || 0), 0) / allTasks.length
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Shield className="w-12 h-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading verification queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Verification Queue
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-muted-foreground mt-2">
            Review and verify citizen reports to maintain platform integrity
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Card className="p-3 min-w-[100px]">
            <div className="text-xs text-muted-foreground">Available</div>
            <div className="text-2xl font-bold">{availableTasks.length}</div>
          </Card>
          <Card className="p-3 min-w-[100px] border-red-500/30">
            <div className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Critical
            </div>
            <div className="text-2xl font-bold text-red-500">{criticalCount}</div>
          </Card>
          <Card className="p-3 min-w-[100px] border-orange-500/30">
            <div className="text-xs text-orange-500">High Priority</div>
            <div className="text-2xl font-bold text-orange-500">{highCount}</div>
          </Card>
          <Card className="p-3 min-w-[100px]">
            <div className="text-xs text-muted-foreground">Avg Credibility</div>
            <div className="text-2xl font-bold">{avgCredibility.toFixed(0)}%</div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reports by title, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Community Conflict">Community Conflict</SelectItem>
              <SelectItem value="Protest/Demonstration">Protest/Demo</SelectItem>
              <SelectItem value="Armed Violence">Armed Violence</SelectItem>
              <SelectItem value="Peace Initiative">Peace Initiative</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available" className="gap-2">
            <FileText className="w-4 h-4" />
            Available ({availableTasks.length})
          </TabsTrigger>
          <TabsTrigger value="my-tasks" className="gap-2">
            <Activity className="w-4 h-4" />
            My Tasks ({activeTasks.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4 mt-4">
          {availableTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Verification Tasks</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchQuery || priorityFilter !== 'all' || categoryFilter !== 'all' 
                    ? 'No tasks match your current filters. Try adjusting your search criteria.'
                    : 'There are no citizen reports waiting for verification. New tasks will appear here when reports are submitted.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            availableTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow border-l-4" style={{
                  borderLeftColor: task.priority === 'critical' ? '#ef4444' : 
                                  task.priority === 'high' ? '#f97316' : 
                                  task.priority === 'medium' ? '#eab308' : '#3b82f6'
                }}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline">{task.citizen_reports?.category}</Badge>
                          {task.citizen_reports?.ai_threat_level && (
                            <Badge variant="secondary">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {task.citizen_reports.ai_threat_level}
                            </Badge>
                          )}
                          {task.citizen_reports?.is_anonymous && (
                            <Badge variant="outline">Anonymous</Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">
                          {task.citizen_reports?.title || 'Untitled Report'}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {task.citizen_reports?.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => assignTask(task.id)}
                          disabled={isAssigning}
                          size="sm"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Claim Task
                        </Button>
                        <Button
                          onClick={() => setSelectedTask(task)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(task.created_at).toLocaleDateString()}
                      </div>
                      {task.citizen_reports?.location_name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {task.citizen_reports.location_name}
                        </div>
                      )}
                      {(task.credibility_score || task.citizen_reports?.credibility_score) && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          AI Credibility: {task.credibility_score || task.citizen_reports?.credibility_score}%
                        </div>
                      )}
                      {task.citizen_reports?.witness_count && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {task.citizen_reports.witness_count} witnesses
                        </div>
                      )}
                    </div>
                    {task.ai_recommendation && (
                      <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          AI Recommendation:
                        </p>
                        <p className="text-sm text-muted-foreground">{task.ai_recommendation}</p>
                      </div>
                    )}
                    {task.citizen_reports?.tags && task.citizen_reports.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {task.citizen_reports.tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="my-tasks" className="space-y-4 mt-4">
          {activeTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">You have no active verification tasks</p>
                <p className="text-sm text-muted-foreground mt-2">Claim a task from the Available tab to get started</p>
              </CardContent>
            </Card>
          ) : (
            activeTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}>
                          {task.priority}
                        </Badge>
                        <Badge className="bg-blue-500">In Progress</Badge>
                      </div>
                      <CardTitle className="text-xl">
                        {task.citizen_reports?.title || 'Untitled Report'}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {task.citizen_reports?.description}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setSelectedTask(task)}
                      size="sm"
                      variant="default"
                    >
                      Review & Verify
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Assigned {new Date(task.assigned_at).toLocaleDateString()}
                    </div>
                    {task.citizen_reports?.location_name && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {task.citizen_reports.location_name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Pending</div>
              <div className="text-3xl font-bold mt-1">{tasks?.filter(t => t.status === 'pending').length}</div>
              <div className="text-xs text-green-500 mt-1">↓ 12% from yesterday</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Avg. Processing Time</div>
              <div className="text-3xl font-bold mt-1">4.2h</div>
              <div className="text-xs text-green-500 mt-1">↓ 15% improvement</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Verification Rate</div>
              <div className="text-3xl font-bold mt-1">87%</div>
              <div className="text-xs text-muted-foreground mt-1">of reports verified</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Active Verifiers</div>
              <div className="text-3xl font-bold mt-1">24</div>
              <div className="text-xs text-green-500 mt-1">↑ 3 since last week</div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Task Detail</DialogTitle>
            <DialogDescription>
              Review the report comprehensively and submit your verification decision
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <VerificationTaskDetail
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
