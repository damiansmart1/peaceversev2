import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertTriangle, FileCheck, TrendingUp } from 'lucide-react';
import { useVerificationTasks } from '@/hooks/useVerificationTasks';
import { Badge } from '@/components/ui/badge';

const VerifierDashboard = () => {
  const navigate = useNavigate();
  const { tasks, isLoading } = useVerificationTasks();

  const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Verifier Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Review and verify community submissions
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingTasks}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks}</div>
                <p className="text-xs text-muted-foreground">Total verified</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks * 10}</div>
                <p className="text-xs text-muted-foreground">Verification points</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/verification')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" />
                  Review Submissions
                </CardTitle>
                <CardDescription>
                  Verify and validate community content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Start Reviewing
                  {pendingTasks > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {pendingTasks} pending
                    </Badge>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/reports')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Review Reports
                </CardTitle>
                <CardDescription>
                  Check incident reports and citizen feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Your Verification Activity</CardTitle>
              <CardDescription>Recent submissions you've reviewed</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{task.content_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(task.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No verification tasks yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerifierDashboard;
