import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, CheckCircle2, TrendingUp, Users, MapPin } from 'lucide-react';
import { Incident } from '@/hooks/useIncidents';

interface IncidentStatsCardsProps {
  incidents?: Incident[];
}

export const IncidentStatsCards = ({ incidents = [] }: IncidentStatsCardsProps) => {
  const totalIncidents = incidents.length;
  const reportedCount = incidents.filter(i => i.status === 'reported').length;
  const verifiedCount = incidents.filter(i => i.status === 'verified').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;
  const criticalCount = incidents.filter(i => i.severity === 'critical').length;
  const avgResponseTime = incidents.filter(i => i.verified_at).length > 0
    ? Math.round(incidents.filter(i => i.verified_at).reduce((acc, i) => {
        const created = new Date(i.created_at).getTime();
        const verified = new Date(i.verified_at!).getTime();
        return acc + (verified - created) / (1000 * 60 * 60); // hours
      }, 0) / incidents.filter(i => i.verified_at).length)
    : 0;

  const stats = [
    {
      title: 'Total Incidents',
      value: totalIncidents,
      icon: AlertCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Review',
      value: reportedCount,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Verified',
      value: verifiedCount,
      icon: CheckCircle2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Resolved',
      value: resolvedCount,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Critical Cases',
      value: criticalCount,
      icon: TrendingUp,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Avg Response Time',
      value: `${avgResponseTime}h`,
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};