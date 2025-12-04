import { useState } from 'react';
import { useVerificationTasks, useMyTasks } from '@/hooks/useVerificationTasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, Clock, CheckCircle, AlertTriangle, MapPin, Calendar, User, 
  Search, Filter, TrendingUp, Eye, FileText, Activity
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VerificationTaskDetail } from './VerificationTaskDetail';
import { motion } from 'framer-motion';

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

// Comprehensive mock data for demonstration
const MOCK_VERIFICATION_TASKS = [
  {
    id: 'task-001',
    status: 'pending',
    priority: 'critical',
    task_type: 'incident_verification',
    created_at: '2024-12-03T14:30:00Z',
    assigned_at: null,
    ai_recommendation: 'High-priority incident with multiple corroborating reports. AI confidence: 85%. Recommend immediate verification due to potential escalation risk.',
    citizen_reports: {
      id: 'report-001',
      title: 'Community Tension at Kibera Market',
      description: 'Witnessed escalating tensions between two groups at the main market area around 2pm. Several people were shouting and there was pushing. Police arrived within 30 minutes but the situation remained tense. Local leaders are attempting mediation. Approximately 50 people were involved.',
      category: 'Community Conflict',
      severity_level: 'high',
      location_name: 'Kibera Market, Nairobi',
      location_country: 'Kenya',
      location_latitude: -1.3133,
      location_longitude: 36.7866,
      created_at: '2024-12-03T14:25:00Z',
      is_anonymous: false,
      ai_threat_level: 'medium-high',
      ai_sentiment: 'negative',
      credibility_score: 78,
      media_urls: ['photo1.jpg', 'photo2.jpg'],
      witness_count: 5,
      estimated_people_affected: 200,
      tags: ['market', 'tension', 'police-response', 'mediation'],
    },
  },
  {
    id: 'task-002',
    status: 'pending',
    priority: 'high',
    task_type: 'incident_verification',
    created_at: '2024-12-03T11:15:00Z',
    ai_recommendation: 'Credible report with photo evidence. Location verified via GPS. Similar incidents reported in area last month. Recommend thorough cross-reference check.',
    citizen_reports: {
      id: 'report-002',
      title: 'Road Blockade by Youth Group',
      description: 'A group of approximately 30 young people have blocked the main road near the junction. They are demanding employment opportunities and dialogue with local government. Traffic is being diverted. The protest has been peaceful so far but blocking essential services.',
      category: 'Protest/Demonstration',
      severity_level: 'medium',
      location_name: 'Mathare Junction, Nairobi',
      location_country: 'Kenya',
      location_latitude: -1.2634,
      location_longitude: 36.8573,
      created_at: '2024-12-03T11:00:00Z',
      is_anonymous: true,
      ai_threat_level: 'medium',
      ai_sentiment: 'frustrated',
      credibility_score: 72,
      media_urls: ['video1.mp4'],
      witness_count: 3,
      estimated_people_affected: 500,
      tags: ['protest', 'youth', 'unemployment', 'road-block'],
    },
  },
  {
    id: 'task-003',
    status: 'pending',
    priority: 'medium',
    task_type: 'incident_verification',
    created_at: '2024-12-02T16:45:00Z',
    ai_recommendation: 'Report from trusted source with good track record. Content appears genuine. Recommend standard verification process.',
    citizen_reports: {
      id: 'report-003',
      title: 'Ethnic Tensions at Local School',
      description: 'Parents from different communities had a heated argument at the school gate regarding the upcoming school board elections. The principal intervened but tensions remain. Some parents are threatening to withdraw their children.',
      category: 'Community Conflict',
      severity_level: 'medium',
      location_name: 'Kawangware Primary School',
      location_country: 'Kenya',
      location_latitude: -1.2789,
      location_longitude: 36.7456,
      created_at: '2024-12-02T16:30:00Z',
      is_anonymous: false,
      ai_threat_level: 'medium',
      ai_sentiment: 'negative',
      credibility_score: 85,
      media_urls: [],
      witness_count: 8,
      estimated_people_affected: 150,
      tags: ['school', 'ethnic-tension', 'elections', 'community'],
    },
  },
  {
    id: 'task-004',
    status: 'pending',
    priority: 'low',
    task_type: 'peace_initiative',
    created_at: '2024-12-02T10:00:00Z',
    ai_recommendation: 'Positive peace initiative report. Verify organizer details and impact claims. Low urgency.',
    citizen_reports: {
      id: 'report-004',
      title: 'Successful Interfaith Dialogue Session',
      description: 'Local religious leaders held a successful interfaith dialogue bringing together 100+ community members from different faiths. They signed a peace charter and agreed to monthly meetings. This is part of an ongoing peace initiative.',
      category: 'Peace Initiative',
      severity_level: 'low',
      location_name: 'Eastleigh Community Center',
      location_country: 'Kenya',
      location_latitude: -1.2723,
      location_longitude: 36.8456,
      created_at: '2024-12-02T09:30:00Z',
      is_anonymous: false,
      ai_threat_level: 'none',
      ai_sentiment: 'positive',
      credibility_score: 92,
      media_urls: ['photo1.jpg', 'photo2.jpg', 'document.pdf'],
      witness_count: 12,
      estimated_people_affected: 100,
      tags: ['interfaith', 'dialogue', 'peace-charter', 'community'],
    },
  },
  {
    id: 'task-005',
    status: 'pending',
    priority: 'high',
    task_type: 'incident_verification',
    created_at: '2024-12-03T08:20:00Z',
    ai_recommendation: 'Cross-border incident report requiring coordination. Multiple sources mention similar activity. High priority for regional early warning.',
    citizen_reports: {
      id: 'report-005',
      title: 'Cattle Rustling Incident Near Border',
      description: 'Armed group crossed from neighboring area and took approximately 50 cattle from local herders. One herder was injured. Community members are organizing a response. Authorities have been notified but response is slow.',
      category: 'Armed Violence',
      severity_level: 'high',
      location_name: 'Turkana Border Region',
      location_country: 'Kenya',
      location_latitude: 3.1234,
      location_longitude: 35.9876,
      created_at: '2024-12-03T07:45:00Z',
      is_anonymous: true,
      ai_threat_level: 'high',
      ai_sentiment: 'alarmed',
      credibility_score: 68,
      media_urls: ['photo1.jpg'],
      witness_count: 4,
      estimated_people_affected: 80,
      tags: ['cattle-rustling', 'armed-group', 'border', 'retaliation-risk'],
    },
  },
];

export const VerificationQueue = () => {
  const { tasks: dbTasks, isLoading, assignTask, isAssigning } = useVerificationTasks();
  const { data: myTasks } = useMyTasks();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Use mock data if no DB tasks
  const tasks = dbTasks?.length ? dbTasks : MOCK_VERIFICATION_TASKS;
  
  const filteredTasks = tasks?.filter(t => {
    const matchesSearch = !searchQuery || 
      t.citizen_reports?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.citizen_reports?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.citizen_reports?.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || t.citizen_reports?.category === categoryFilter;
    
    return matchesSearch && matchesPriority && matchesCategory;
  }) || [];

  const availableTasks = filteredTasks.filter(t => t.status === 'pending');
  const activeTasks = myTasks || [];

  // Statistics
  const criticalCount = tasks?.filter(t => t.priority === 'critical' && t.status === 'pending').length || 0;
  const highCount = tasks?.filter(t => t.priority === 'high' && t.status === 'pending').length || 0;
  const avgCredibility = tasks?.reduce((acc, t) => acc + (t.citizen_reports?.credibility_score || 0), 0) / (tasks?.length || 1);

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
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Verification Queue
          </h2>
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
                <p className="text-muted-foreground">No pending tasks matching your filters</p>
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
                      {task.citizen_reports?.credibility_score && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          AI Credibility: {task.citizen_reports.credibility_score}%
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
