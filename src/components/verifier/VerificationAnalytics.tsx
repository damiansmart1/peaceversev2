import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { TrendingUp, Target, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AnalyticsProps {
  verificationData?: {
    byCategory: { category: string; verified: number; rejected: number; pending: number }[];
    byTimeOfDay: { hour: string; count: number }[];
    verdictDistribution: { name: string; value: number; color: string }[];
    weeklyTrend: { day: string; tasks: number; completed: number }[];
  };
}

export const VerificationAnalytics = ({ verificationData }: AnalyticsProps) => {
  // Mock data for demonstration
  const defaultData = {
    byCategory: [
      { category: 'Conflict', verified: 45, rejected: 8, pending: 12 },
      { category: 'Protest', verified: 32, rejected: 5, pending: 8 },
      { category: 'Violence', verified: 28, rejected: 12, pending: 6 },
      { category: 'Peace', verified: 52, rejected: 2, pending: 4 },
      { category: 'Other', verified: 18, rejected: 3, pending: 5 },
    ],
    byTimeOfDay: [
      { hour: '00:00', count: 5 },
      { hour: '04:00', count: 8 },
      { hour: '08:00', count: 24 },
      { hour: '12:00', count: 32 },
      { hour: '16:00', count: 28 },
      { hour: '20:00', count: 15 },
    ],
    verdictDistribution: [
      { name: 'Verified', value: 175, color: '#22c55e' },
      { name: 'Rejected', value: 30, color: '#ef4444' },
      { name: 'Needs Info', value: 25, color: '#eab308' },
      { name: 'Escalated', value: 10, color: '#f97316' },
    ],
    weeklyTrend: [
      { day: 'Mon', tasks: 45, completed: 42 },
      { day: 'Tue', tasks: 52, completed: 48 },
      { day: 'Wed', tasks: 38, completed: 35 },
      { day: 'Thu', tasks: 65, completed: 58 },
      { day: 'Fri', tasks: 48, completed: 45 },
      { day: 'Sat', tasks: 32, completed: 30 },
      { day: 'Sun', tasks: 28, completed: 25 },
    ],
  };

  const data = verificationData || defaultData;
  const totalVerified = data.verdictDistribution.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Verification by Category */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Verification by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.byCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" fontSize={10} />
              <YAxis type="category" dataKey="category" fontSize={10} width={60} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))' 
                }} 
              />
              <Bar dataKey="verified" stackId="a" fill="#22c55e" name="Verified" radius={[0, 0, 0, 0]} />
              <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
              <Bar dataKey="pending" stackId="a" fill="#eab308" name="Pending" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Verdict Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Verdict Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={150}>
              <PieChart>
                <Pie
                  data={data.verdictDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {data.verdictDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {data.verdictDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.value}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((item.value / totalVerified) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Weekly Verification Trend
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/30" />
                <span className="text-muted-foreground">Total Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Completed</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.weeklyTrend}>
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))' 
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="tasks" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorTasks)" 
                name="Total Tasks"
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="#22c55e" 
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
                name="Completed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
