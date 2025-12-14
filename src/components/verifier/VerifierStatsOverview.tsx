import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, 
  Activity, Target, Users, Zap, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

interface VerifierStatsProps {
  stats: {
    pendingTasks: number;
    completedToday: number;
    criticalAlerts: number;
    highPriority: number;
    verificationRate: number;
    avgResponseTime: string;
    activeHotspots: number;
    patternsDetected: number;
  };
}

export const VerifierStatsOverview = ({ stats }: VerifierStatsProps) => {
  const statCards = [
    {
      title: 'Pending Verification',
      value: stats.pendingTasks,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      trend: '-12%',
      trendUp: false,
    },
    {
      title: 'Critical Alerts',
      value: stats.criticalAlerts,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      trend: '+3',
      trendUp: true,
      urgent: true,
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      trend: '+18%',
      trendUp: true,
    },
    {
      title: 'High Priority',
      value: stats.highPriority,
      icon: Zap,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
    {
      title: 'Verification Rate',
      value: `${stats.verificationRate}%`,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      progress: stats.verificationRate,
    },
    {
      title: 'Avg Response Time',
      value: stats.avgResponseTime,
      icon: Activity,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
    },
    {
      title: 'Active Hotspots',
      value: stats.activeHotspots,
      icon: Globe,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
    },
    {
      title: 'Patterns Detected',
      value: stats.patternsDetected,
      icon: TrendingUp,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className={`relative overflow-hidden ${stat.borderColor} border-2 ${stat.urgent ? 'animate-pulse' : ''}`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.trend && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
              </div>
              {stat.progress && (
                <Progress value={stat.progress} className="mt-3 h-1.5" />
              )}
            </CardContent>
            {stat.urgent && (
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full m-2 animate-ping" />
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
