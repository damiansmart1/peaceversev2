import { Card } from '@/components/ui/card';
import { Users, MessageSquare, Globe, Award, TrendingUp, Heart } from 'lucide-react';

const metrics = [
  {
    icon: Users,
    value: '50,000+',
    label: 'Active Users',
    change: '+23% this month',
    color: 'text-blue-500',
  },
  {
    icon: MessageSquare,
    value: '125,000',
    label: 'Stories Shared',
    change: '+45% this month',
    color: 'text-green-500',
  },
  {
    icon: Globe,
    value: '45',
    label: 'Countries',
    change: '+5 this quarter',
    color: 'text-purple-500',
  },
  {
    icon: Award,
    value: '8,500',
    label: 'Challenges Completed',
    change: '+67% this month',
    color: 'text-yellow-500',
  },
  {
    icon: TrendingUp,
    value: '15,000',
    label: 'Peace Actions',
    change: '+89% this month',
    color: 'text-orange-500',
  },
  {
    icon: Heart,
    value: '95%',
    label: 'User Satisfaction',
    change: '+2% this quarter',
    color: 'text-pink-500',
  },
];

export const AboutImpactMetrics = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Our Impact</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Together, we're building a global community dedicated to peace and positive change
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-muted ${metric.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">{metric.value}</div>
                <div className="text-sm font-medium text-foreground">{metric.label}</div>
                <div className="text-xs text-muted-foreground">{metric.change}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
