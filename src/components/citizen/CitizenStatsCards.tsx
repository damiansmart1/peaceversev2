import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Medal, 
  Flame, 
  Target, 
  Sparkles, 
  TrendingUp,
  CheckCircle 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CitizenStatsCardsProps {
  profile: {
    peace_points: number;
    current_level: number;
    is_verified: boolean;
  } | null;
  currentLevel: {
    title: string;
  } | null;
  challengesCompleted: number;
  reportsSubmitted: number;
  proposalsVoted: number;
  isLoading: boolean;
}

const CitizenStatsCards = ({
  profile,
  currentLevel,
  challengesCompleted,
  reportsSubmitted,
  proposalsVoted,
  isLoading
}: CitizenStatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-l-4 border-l-primary/20">
            <CardContent className="p-4">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      icon: Sparkles,
      label: 'Peace Points',
      value: profile?.peace_points || 0,
      color: 'text-accent',
      borderColor: 'border-l-accent',
      badge: 'XP',
    },
    {
      icon: TrendingUp,
      label: 'Current Level',
      value: profile?.current_level || 1,
      color: 'text-primary',
      borderColor: 'border-l-primary',
      badge: currentLevel?.title || 'Beginner',
    },
    {
      icon: Target,
      label: 'Challenges Done',
      value: challengesCompleted,
      color: 'text-green-500',
      borderColor: 'border-l-green-500',
    },
    {
      icon: Flame,
      label: 'Reports Filed',
      value: reportsSubmitted,
      color: 'text-orange-500',
      borderColor: 'border-l-orange-500',
    },
    {
      icon: Medal,
      label: 'Votes Cast',
      value: proposalsVoted,
      color: 'text-blue-500',
      borderColor: 'border-l-blue-500',
    },
    {
      icon: CheckCircle,
      label: 'Verified Status',
      value: profile?.is_verified ? 'Yes' : 'No',
      color: profile?.is_verified ? 'text-green-500' : 'text-muted-foreground',
      borderColor: profile?.is_verified ? 'border-l-green-500' : 'border-l-muted',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className={`border-l-4 ${stat.borderColor} hover:shadow-md transition-shadow`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                {stat.badge && (
                  <Badge variant="outline" className="text-xs">
                    {stat.badge}
                  </Badge>
                )}
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default CitizenStatsCards;
