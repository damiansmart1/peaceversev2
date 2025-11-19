import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { Users, FileText, MapPin, Trophy, Flag, Radio, Newspaper, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [users, content, proposals, safeSpaces, challenges, flags, incidents] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('content').select('*', { count: 'exact', head: true }),
        supabase.from('proposals').select('*', { count: 'exact', head: true }),
        supabase.from('safe_spaces').select('*', { count: 'exact', head: true }),
        supabase.from('weekly_challenges').select('*', { count: 'exact', head: true }),
        supabase.from('moderation_flags').select('*', { count: 'exact', head: true }),
        supabase.from('incidents').select('*', { count: 'exact', head: true }),
      ]);

      return {
        users: users.count || 0,
        content: content.count || 0,
        proposals: proposals.count || 0,
        safeSpaces: safeSpaces.count || 0,
        challenges: challenges.count || 0,
        flags: flags.count || 0,
        incidents: incidents.count || 0,
      };
    },
  });

  const { data: activityData } = useQuery({
    queryKey: ['activity-trends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      
      // Group by day
      const grouped = data.reduce((acc: any, item) => {
        const date = new Date(item.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(grouped).map(([date, count]) => ({ date, stories: count })).reverse();
    },
  });

  const statCards = [
    { title: 'Total Users', value: stats?.users || 0, icon: Users, color: 'text-blue-500' },
    { title: 'Voice Stories', value: stats?.content || 0, icon: Newspaper, color: 'text-green-500' },
    { title: 'Proposals', value: stats?.proposals || 0, icon: FileText, color: 'text-purple-500' },
    { title: 'Safe Spaces', value: stats?.safeSpaces || 0, icon: MapPin, color: 'text-orange-500' },
    { title: 'Challenges', value: stats?.challenges || 0, icon: Trophy, color: 'text-yellow-500' },
    { title: 'Incidents', value: stats?.incidents || 0, icon: AlertTriangle, color: 'text-orange-600' },
    { title: 'Pending Flags', value: stats?.flags || 0, icon: Flag, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Overview of platform statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Activity (Last 30 Days)</CardTitle>
          <CardDescription>Daily story submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="stories" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
