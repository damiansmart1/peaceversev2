import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, XCircle, AlertCircle, Clock, Shield, 
  ChevronRight, Eye, Zap, FileText, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useVerificationTasks } from '@/hooks/useVerificationTasks';

export const QuickVerificationActions = () => {
  const navigate = useNavigate();
  const { tasks, isLoading, assignTask, isAssigning } = useVerificationTasks();

  const urgentTasks = (tasks || [])
    .filter(t => t.status === 'pending' && ['critical', 'high'].includes(t.priority))
    .slice(0, 3);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-500/5';
      case 'high': return 'border-orange-500 bg-orange-500/5';
      case 'medium': return 'border-yellow-500 bg-yellow-500/5';
      default: return 'border-blue-500 bg-blue-500/5';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500 text-black';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-amber-500" />
            Quick Actions
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/verification')}
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/verification')}
          >
            <FileText className="w-6 h-6" />
            <span className="text-sm">Start Verification</span>
            {urgentTasks.length > 0 && (
              <Badge variant="secondary" className="bg-white/20">
                {urgentTasks.length} urgent
              </Badge>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/incidents')}
          >
            <Eye className="w-6 h-6" />
            <span className="text-sm">View Incidents</span>
          </Button>
        </div>

        {/* Urgent Tasks Preview */}
        {urgentTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Urgent Tasks</p>
            {urgentTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border-l-4 ${getPriorityColor(task.priority)} cursor-pointer hover:shadow-md transition-all`}
                onClick={() => assignTask(task.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getPriorityBadge(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm truncate">
                      {task.citizen_reports?.title || 'Untitled Report'}
                    </h4>
                    {task.citizen_reports?.location_name && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {task.citizen_reports.location_name}
                      </p>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    disabled={isAssigning}
                  >
                    <Shield className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {urgentTasks.length === 0 && !isLoading && (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">No urgent tasks pending</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {(tasks || []).filter(t => t.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {(tasks || []).filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {(tasks || []).filter(t => t.priority === 'critical' && t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
