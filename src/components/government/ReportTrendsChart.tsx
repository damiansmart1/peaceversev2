import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { TrendData } from '@/hooks/useGovernmentDashboard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ReportTrendsChartProps {
  data: TrendData[] | undefined;
  isLoading: boolean;
}

export const ReportTrendsChart = ({ data, isLoading }: ReportTrendsChartProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Report Trends</CardTitle>
            <CardDescription>Daily report submissions and resolutions (30 days)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
        ) : !data || data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No trend data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="reports"
                name="Total Reports"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorReports)"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="hsl(142, 76%, 36%)"
                fillOpacity={1}
                fill="url(#colorResolved)"
              />
              <Area
                type="monotone"
                dataKey="critical"
                name="Critical"
                stroke="hsl(0, 84%, 60%)"
                fillOpacity={1}
                fill="url(#colorCritical)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
