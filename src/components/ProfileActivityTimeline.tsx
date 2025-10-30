import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  FileText, 
  Award, 
  Heart, 
  Upload,
  TrendingUp 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const mockActivities = [
  {
    id: '1',
    type: 'story',
    icon: Upload,
    title: 'Shared a new story',
    description: 'My journey to peace through community dialogue',
    timestamp: new Date(Date.now() - 3600000),
    points: 10,
  },
  {
    id: '2',
    type: 'proposal',
    icon: FileText,
    title: 'Created a proposal',
    description: 'Youth Education Reform Initiative',
    timestamp: new Date(Date.now() - 86400000),
    points: 25,
  },
  {
    id: '3',
    type: 'achievement',
    icon: Award,
    title: 'Earned an achievement',
    description: 'First Voice - Shared your first story',
    timestamp: new Date(Date.now() - 172800000),
    points: 50,
  },
  {
    id: '4',
    type: 'comment',
    icon: MessageSquare,
    title: 'Commented on a proposal',
    description: 'Healthcare Access for Rural Communities',
    timestamp: new Date(Date.now() - 259200000),
    points: 5,
  },
  {
    id: '5',
    type: 'level',
    icon: TrendingUp,
    title: 'Leveled up',
    description: 'Reached Level 3 - Peace Ambassador',
    timestamp: new Date(Date.now() - 432000000),
    points: 100,
  },
];

const iconColors: Record<string, string> = {
  story: 'bg-blue-500/10 text-blue-500',
  proposal: 'bg-purple-500/10 text-purple-500',
  achievement: 'bg-yellow-500/10 text-yellow-500',
  comment: 'bg-green-500/10 text-green-500',
  level: 'bg-orange-500/10 text-orange-500',
};

export const ProfileActivityTimeline = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Recent Activity</h2>
      
      <div className="space-y-6">
        {mockActivities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="relative">
              {index !== mockActivities.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
              )}
              
              <div className="flex gap-4">
                <div className={`p-2 rounded-lg ${iconColors[activity.type]} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-foreground">{activity.title}</h4>
                    <Badge variant="secondary" className="shrink-0">
                      +{activity.points} pts
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
