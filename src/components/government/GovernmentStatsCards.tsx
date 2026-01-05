import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Shield,
  Users,
  Activity
} from 'lucide-react';
import { DashboardStats } from '@/hooks/useGovernmentDashboard';
import { motion } from 'framer-motion';

interface GovernmentStatsCardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export const GovernmentStatsCards = ({ stats, isLoading }: GovernmentStatsCardsProps) => {
  const cards = [
    {
      title: 'Total Reports',
      value: stats?.totalReports || 0,
      subtitle: 'Last 30 days',
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Review',
      value: stats?.pendingReports || 0,
      subtitle: 'Requires attention',
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      badge: stats?.pendingReports && stats.pendingReports > 10 ? 'urgent' : undefined,
    },
    {
      title: 'Critical Incidents',
      value: stats?.criticalIncidents || 0,
      subtitle: 'High priority',
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      badge: stats?.criticalIncidents && stats.criticalIncidents > 5 ? 'alert' : undefined,
    },
    {
      title: 'Verified Reports',
      value: stats?.verifiedReports || 0,
      subtitle: 'Confirmed incidents',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Active Proposals',
      value: stats?.activeProposals || 0,
      subtitle: 'Community initiatives',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Resolution Rate',
      value: `${stats?.resolutionRate || 0}%`,
      subtitle: 'Reports resolved',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Avg Response Time',
      value: `${stats?.avgResponseTime || 0}h`,
      subtitle: 'Time to first response',
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Peace Index',
      value: stats?.peaceIndex?.toFixed(1) || '0.0',
      subtitle: 'Regional stability score',
      icon: Shield,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            {card.badge && (
              <Badge 
                variant="destructive" 
                className="absolute top-2 right-2 animate-pulse"
              >
                {card.badge}
              </Badge>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  card.value
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
