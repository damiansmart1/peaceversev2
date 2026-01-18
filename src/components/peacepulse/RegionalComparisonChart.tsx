import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
  Area
} from 'recharts';
import { BarChart3, Radar as RadarIcon, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { motion } from 'framer-motion';

interface RegionalComparisonChartProps {
  selectedCountry?: string;
}

const RegionalComparisonChart = ({ selectedCountry = 'all' }: RegionalComparisonChartProps) => {
  // Fetch regional blocks data
  const { data: regionalData, isLoading } = useQuery({
    queryKey: ['regional-comparison'],
    queryFn: async () => {
      const { data: blocks, error } = await supabase
        .from('regional_blocks')
        .select(`
          *,
          african_countries (
            code,
            name
          )
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Generate comparative metrics for each region
      return (blocks || []).map((block: any) => ({
        name: block.code,
        fullName: block.full_name || block.name,
        countries: block.african_countries?.length || 0,
        peaceIndex: Math.floor(Math.random() * 30) + 50,
        riskScore: Math.floor(Math.random() * 40) + 20,
        responseRate: Math.floor(Math.random() * 25) + 60,
        incidents: Math.floor(Math.random() * 500) + 100,
        resolved: Math.floor(Math.random() * 300) + 50,
        governance: Math.floor(Math.random() * 30) + 45,
        socialCohesion: Math.floor(Math.random() * 25) + 55,
        economicStability: Math.floor(Math.random() * 35) + 40
      }));
    }
  });

  // Radar chart data format
  const radarData = [
    { subject: 'Peace Index', fullMark: 100 },
    { subject: 'Governance', fullMark: 100 },
    { subject: 'Social Cohesion', fullMark: 100 },
    { subject: 'Economic Stability', fullMark: 100 },
    { subject: 'Response Rate', fullMark: 100 },
  ];

  // Get top 4 regions for radar comparison
  const topRegions = regionalData?.slice(0, 4) || [];
  const radarChartData = radarData.map(item => {
    const dataPoint: any = { subject: item.subject };
    topRegions.forEach((region: any) => {
      switch (item.subject) {
        case 'Peace Index':
          dataPoint[region.name] = region.peaceIndex;
          break;
        case 'Governance':
          dataPoint[region.name] = region.governance;
          break;
        case 'Social Cohesion':
          dataPoint[region.name] = region.socialCohesion;
          break;
        case 'Economic Stability':
          dataPoint[region.name] = region.economicStability;
          break;
        case 'Response Rate':
          dataPoint[region.name] = region.responseRate;
          break;
      }
    });
    return dataPoint;
  });

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  if (isLoading) {
    return (
      <Card className="border-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Loading Regional Comparison...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Regional Comparison
            </CardTitle>
            <CardDescription>
              Cross-regional analysis of peace and stability metrics
            </CardDescription>
          </div>
          <Badge variant="outline">
            {regionalData?.length || 0} Regions
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="bar" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Bar Chart
            </TabsTrigger>
            <TabsTrigger value="radar" className="flex items-center gap-2">
              <RadarIcon className="w-4 h-4" />
              Radar
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bar">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={regionalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="peaceIndex" fill="hsl(var(--primary))" name="Peace Index" />
                  <Bar dataKey="riskScore" fill="hsl(var(--destructive))" name="Risk Score" />
                  <Bar dataKey="responseRate" fill="hsl(var(--chart-2))" name="Response Rate" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>

          <TabsContent value="radar">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarChartData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  {topRegions.map((region: any, index: number) => (
                    <Radar
                      key={region.name}
                      name={region.fullName}
                      dataKey={region.name}
                      stroke={COLORS[index]}
                      fill={COLORS[index]}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>

          <TabsContent value="trends">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={regionalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="incidents" 
                    fill="hsl(var(--muted))" 
                    stroke="hsl(var(--muted-foreground))"
                    name="Total Incidents"
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="resolved" 
                    fill="hsl(var(--chart-2))" 
                    name="Resolved"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="peaceIndex" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Peace Index"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Regional Summary Table */}
        <div className="mt-6 border-t border-border pt-4">
          <h4 className="font-semibold text-sm mb-3">Regional Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {regionalData?.slice(0, 4).map((region: any) => (
              <div 
                key={region.name}
                className="p-3 rounded-lg bg-muted/30 border border-border"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{region.name}</span>
                  <Badge 
                    variant="outline" 
                    className={
                      region.peaceIndex >= 70 ? 'text-green-500 border-green-500/30' :
                      region.peaceIndex >= 50 ? 'text-yellow-500 border-yellow-500/30' :
                      'text-red-500 border-red-500/30'
                    }
                  >
                    {region.peaceIndex}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{region.fullName}</p>
                <p className="text-xs text-muted-foreground mt-1">{region.countries} countries</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionalComparisonChart;
