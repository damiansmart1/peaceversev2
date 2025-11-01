import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { PeaceMetrics, AccountabilityMetrics } from '@/hooks/usePeaceMetrics';

interface PeacePulseChartsProps {
  pulseMetrics?: PeaceMetrics[];
  accountabilityMetrics?: AccountabilityMetrics[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const PeacePulseCharts = ({ pulseMetrics, accountabilityMetrics }: PeacePulseChartsProps) => {
  // Sentiment Trend Data
  const sentimentData = pulseMetrics?.slice(0, 10).reverse().map(m => ({
    date: new Date(m.calculated_at).toLocaleDateString(),
    sentiment: m.sentiment_average ? (m.sentiment_average * 100) : 0,
    risk: m.risk_score ? (m.risk_score * 100) : 0,
  })) || [];

  // Activity Distribution
  const activityData = pulseMetrics?.slice(0, 7).reverse().map(m => ({
    date: new Date(m.calculated_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    activity: m.activity_count || 0,
  })) || [];

  // Tension Level Distribution
  const tensionDistribution = pulseMetrics?.reduce((acc: any[], m) => {
    const level = m.tension_level || 'unknown';
    const existing = acc.find(item => item.name === level);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: level, value: 1 });
    }
    return acc;
  }, []) || [];

  // Accountability Metrics
  const accountabilityData = accountabilityMetrics?.slice(0, 5).reverse().map((m, idx) => ({
    date: `Day ${idx + 1}`,
    reported: m.incidents_reported || 0,
    verified: m.incidents_verified || 0,
    resolved: m.incidents_resolved || 0,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Sentiment & Risk Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Peace Sentiment & Risk Trends</CardTitle>
          <CardDescription>Historical sentiment and risk scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="sentiment" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.6}
                name="Peace Sentiment"
              />
              <Area 
                type="monotone" 
                dataKey="risk" 
                stroke="hsl(var(--destructive))" 
                fill="hsl(var(--destructive))" 
                fillOpacity={0.4}
                name="Risk Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Levels</CardTitle>
            <CardDescription>Daily peace activity reports</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activity" fill="hsl(var(--primary))" name="Reports" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tension Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tension Level Distribution</CardTitle>
            <CardDescription>Current regional tension breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tensionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {tensionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Accountability Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Response Performance</CardTitle>
          <CardDescription>Tracking from report to resolution</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accountabilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="reported" 
                stroke="hsl(var(--muted-foreground))" 
                name="Reported"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="verified" 
                stroke="hsl(var(--primary))" 
                name="Verified"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="resolved" 
                stroke="hsl(var(--chart-2))" 
                name="Resolved"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};