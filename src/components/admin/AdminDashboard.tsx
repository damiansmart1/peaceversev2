import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { Users, FileText, MapPin, Trophy, Flag, Newspaper, AlertTriangle, TrendingUp, TrendingDown, Activity, Eye, Heart, MessageSquare, Shield, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

export const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [users, content, proposals, safeSpaces, challenges, flags, incidents, reports] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('content').select('*'),
        supabase.from('proposals').select('*'),
        supabase.from('safe_spaces').select('*'),
        supabase.from('weekly_challenges').select('*'),
        supabase.from('moderation_flags').select('*'),
        supabase.from('incidents').select('*'),
        supabase.from('citizen_reports').select('*'),
      ]);

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calculate growth rates
      const newUsersWeek = users.data?.filter(u => new Date(u.created_at!) > weekAgo).length || 0;
      const newUsersMonth = users.data?.filter(u => new Date(u.created_at!) > monthAgo).length || 0;
      const prevMonthUsers = users.data?.filter(u => {
        const created = new Date(u.created_at!);
        return created > new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) && created < monthAgo;
      }).length || 0;
      
      const userGrowthRate = prevMonthUsers > 0 ? ((newUsersMonth - prevMonthUsers) / prevMonthUsers * 100).toFixed(1) : '0';

      return {
        users: users.count || users.data?.length || 0,
        content: content.count || content.data?.length || 0,
        proposals: proposals.count || proposals.data?.length || 0,
        safeSpaces: safeSpaces.count || safeSpaces.data?.length || 0,
        challenges: challenges.count || challenges.data?.length || 0,
        flags: flags.count || flags.data?.length || 0,
        incidents: incidents.count || incidents.data?.length || 0,
        reports: reports.count || reports.data?.length || 0,
        newUsersWeek,
        newUsersMonth,
        userGrowthRate: parseFloat(userGrowthRate),
        totalEngagement: (content.data?.reduce((sum, c: any) => sum + (c.view_count || 0) + (c.like_count || 0), 0) || 0) +
                        (proposals.data?.reduce((sum, p: any) => sum + (p.view_count || 0), 0) || 0),
        verifiedUsers: users.data?.filter((p: any) => p.is_verified).length || 0,
        totalPoints: users.data?.reduce((sum: any, p: any) => sum + (p.peace_points || 0), 0) || 0,
        pendingApprovals: (content.data?.filter((c: any) => c.approval_status === 'pending_approval').length || 0) +
                         (proposals.data?.filter((p: any) => p.status === 'pending_approval').length || 0),
      };
    },
  });

  const { data: activityData } = useQuery({
    queryKey: ['activity-trends'],
    queryFn: async () => {
      const { data: contentData } = await supabase
        .from('content')
        .select('created_at, view_count, like_count')
        .order('created_at', { ascending: false })
        .limit(90);
      
      const { data: proposalData } = await supabase
        .from('proposals')
        .select('created_at, view_count')
        .order('created_at', { ascending: false })
        .limit(90);

      const { data: reportData } = await supabase
        .from('citizen_reports')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(90);
      
      // Group by day
      const dailyActivity: Record<string, any> = {};
      
      contentData?.forEach((item: any) => {
        const date = new Date(item.created_at).toLocaleDateString();
        if (!dailyActivity[date]) {
          dailyActivity[date] = { date, stories: 0, views: 0, likes: 0, proposals: 0, reports: 0 };
        }
        dailyActivity[date].stories += 1;
        dailyActivity[date].views += item.view_count || 0;
        dailyActivity[date].likes += item.like_count || 0;
      });

      proposalData?.forEach((item: any) => {
        const date = new Date(item.created_at).toLocaleDateString();
        if (!dailyActivity[date]) {
          dailyActivity[date] = { date, stories: 0, views: 0, likes: 0, proposals: 0, reports: 0 };
        }
        dailyActivity[date].proposals += 1;
        dailyActivity[date].views += item.view_count || 0;
      });

      reportData?.forEach((item: any) => {
        const date = new Date(item.created_at).toLocaleDateString();
        if (!dailyActivity[date]) {
          dailyActivity[date] = { date, stories: 0, views: 0, likes: 0, proposals: 0, reports: 0 };
        }
        dailyActivity[date].reports += 1;
      });
      
      return Object.values(dailyActivity).reverse().slice(0, 30);
    },
  });

  const { data: categoryData } = useQuery({
    queryKey: ['category-distribution'],
    queryFn: async () => {
      const { data } = await supabase.from('citizen_reports').select('category');
      const distribution: Record<string, number> = {};
      data?.forEach((item: any) => {
        distribution[item.category] = (distribution[item.category] || 0) + 1;
      });
      return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    },
  });

  const { data: userActivityData } = useQuery({
    queryKey: ['user-activity-levels'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('peace_points, current_level');
      return [
        { level: 'Beginner (1-2)', count: data?.filter((u: any) => u.current_level <= 2).length || 0 },
        { level: 'Active (3-5)', count: data?.filter((u: any) => u.current_level >= 3 && u.current_level <= 5).length || 0 },
        { level: 'Advanced (6-10)', count: data?.filter((u: any) => u.current_level >= 6 && u.current_level <= 10).length || 0 },
        { level: 'Expert (10+)', count: data?.filter((u: any) => u.current_level > 10).length || 0 },
      ];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive platform insights and data management</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Activity className="w-4 h-4 mr-2" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users || 0}</div>
            <div className="flex items-center gap-2 mt-1">
              {(stats?.userGrowthRate || 0) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <p className="text-xs text-muted-foreground">
                {stats?.userGrowthRate}% vs last month
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats?.newUsersWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Heart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.totalEngagement || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Views + Likes + Interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats?.pendingApprovals || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats?.incidents || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total reported incidents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.content || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Proposals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.proposals || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.reports || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Safe Spaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.safeSpaces || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Verified Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.verifiedUsers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
          <TabsTrigger value="categories">Report Categories</TabsTrigger>
          <TabsTrigger value="users">User Engagement</TabsTrigger>
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Activity (Last 30 Days)</CardTitle>
              <CardDescription>Daily activity across all platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={activityData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="stories" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} name="Stories" />
                  <Area type="monotone" dataKey="proposals" stackId="1" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} name="Proposals" />
                  <Area type="monotone" dataKey="reports" stackId="1" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.6} name="Reports" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>User interactions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke={COLORS[3]} strokeWidth={2} name="Views" />
                  <Line type="monotone" dataKey="likes" stroke={COLORS[4]} strokeWidth={2} name="Likes" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Report Category Distribution</CardTitle>
                <CardDescription>Breakdown of incident reports by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categoryData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(categoryData || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Report volumes by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={categoryData || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Levels</CardTitle>
              <CardDescription>Distribution of users by engagement level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={userActivityData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="level" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={COLORS[0]} name="User Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Peace Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(stats?.totalPoints || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Active Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.challenges || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gamification events
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Moderation Flags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{stats?.flags || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pending review
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">This Week</span>
                    <Badge>{stats?.newUsersWeek || 0} new</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <Badge>{stats?.newUsersMonth || 0} new</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Growth Rate</span>
                    <Badge variant={(stats?.userGrowthRate || 0) >= 0 ? 'default' : 'destructive'}>
                      {stats?.userGrowthRate}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Content Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Content</span>
                    <Badge>{stats?.content || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pending Approval</span>
                    <Badge variant="secondary">{stats?.pendingApprovals || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Proposals</span>
                    <Badge>{stats?.proposals || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Safety Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Incidents</span>
                    <Badge variant="destructive">{stats?.incidents || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Citizen Reports</span>
                    <Badge>{stats?.reports || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Safe Spaces</span>
                    <Badge variant="outline">{stats?.safeSpaces || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
