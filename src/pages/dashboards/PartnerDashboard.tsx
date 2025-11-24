import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Target, Heart, Globe, MessageSquare } from 'lucide-react';

const PartnerDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Partner Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Collaborate and drive peace-building initiatives
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Ongoing initiatives</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Community Reach</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">People impacted</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73%</div>
                <p className="text-xs text-muted-foreground">Community participation</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">9.2</div>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/community')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Community Engagement
                </CardTitle>
                <CardDescription>
                  Connect with community members and track engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Community</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/proposals')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Partner Proposals
                </CardTitle>
                <CardDescription>
                  Submit and track partnership initiatives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Proposals</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/peace-pulse')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Peace Metrics
                </CardTitle>
                <CardDescription>
                  View analytics and impact measurements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Analytics</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/challenges')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Create Challenges
                </CardTitle>
                <CardDescription>
                  Launch new peace-building initiatives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">New Challenge</Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Partnership Activity</CardTitle>
              <CardDescription>Your latest contributions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Partnership activity tracking coming soon
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
