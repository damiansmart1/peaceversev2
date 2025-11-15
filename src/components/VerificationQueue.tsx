import { useState } from 'react';
import { useVerificationTasks, useMyTasks } from '@/hooks/useVerificationTasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Clock, CheckCircle, AlertTriangle, MapPin, Calendar, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VerificationTaskDetail } from './VerificationTaskDetail';

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
  const { tasks, isLoading, assignTask, isAssigning } = useVerificationTasks();
  const { data: myTasks } = useMyTasks();
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const availableTasks = tasks?.filter(t => t.status === 'pending') || [];
  const activeTasks = myTasks || [];

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Verification Queue
          </h2>
          <p className="text-muted-foreground mt-2">
            Review and verify citizen reports to maintain platform integrity
          </p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Available Tasks</div>
            <div className="text-2xl font-bold">{availableTasks.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">My Active Tasks</div>
            <div className="text-2xl font-bold">{activeTasks.length}</div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList>
          <TabsTrigger value="available">
            Available ({availableTasks.length})
          </TabsTrigger>
          <TabsTrigger value="my-tasks">
            My Tasks ({activeTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {availableTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No pending tasks available</p>
              </CardContent>
            </Card>
          ) : (
            availableTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}>
                          {task.priority}
                        </Badge>
                        <Badge className={STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}>
                          {task.status}
                        </Badge>
                        <Badge variant="outline">{task.task_type}</Badge>
                      </div>
                      <CardTitle className="text-xl">
                        {task.citizen_reports?.title || 'Untitled Report'}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {task.citizen_reports?.description}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => assignTask(task.id)}
                      disabled={isAssigning}
                      size="sm"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Claim Task
                    </Button>
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
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {task.citizen_reports?.threat_level || 'Not assessed'}
                    </div>
                  </div>
                  {task.ai_recommendation && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-1">AI Recommendation:</p>
                      <p className="text-sm text-muted-foreground">{task.ai_recommendation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="my-tasks" className="space-y-4">
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
      </Tabs>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Task Detail</DialogTitle>
            <DialogDescription>
              Review the report and submit your verification decision
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
