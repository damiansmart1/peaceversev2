import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Award, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Level {
  level_number: number;
  title: string;
  xp_required: number;
  icon: string;
}

interface Profile {
  display_name?: string;
  username?: string;
  peace_points: number;
  current_level: number;
  avatar_url?: string;
}

interface CitizenProgressOverviewProps {
  profile: Profile | null;
  levels: Level[] | undefined;
  isLoading: boolean;
}

const CitizenProgressOverview = ({ profile, levels, isLoading }: CitizenProgressOverviewProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!profile || !levels) return null;

  const currentLevel = levels.find(l => l.level_number === profile.current_level);
  const nextLevel = levels.find(l => l.level_number === profile.current_level + 1);
  
  const xpPoints = profile.peace_points || 0;
  const currentLevelXP = currentLevel?.xp_required || 0;
  const nextLevelXP = nextLevel?.xp_required || currentLevelXP + 100;
  const progressToNext = nextLevel 
    ? Math.min(((xpPoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, 100)
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-card via-card to-accent/5 border-border/40 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="w-5 h-5 text-accent" />
                Your Progress
              </CardTitle>
              <CardDescription>Keep growing as a peace builder</CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              Level {profile.current_level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info Row */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-3xl shadow-lg">
                {currentLevel?.icon || '🌱'}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {profile.current_level}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">
                {profile.display_name || profile.username || 'Peace Builder'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentLevel?.title || 'Peace Seedling'}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-2xl font-bold text-accent">{xpPoints}</span>
              </div>
              <p className="text-xs text-muted-foreground">Peace Points</p>
            </div>
          </div>

          {/* Progress to Next Level */}
          {nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Progress to Level {nextLevel.level_number}
                </span>
                <span className="font-medium text-foreground">
                  {xpPoints} / {nextLevelXP} XP
                </span>
              </div>
              <Progress value={Math.max(progressToNext, 0)} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentLevel?.title}</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {nextLevel.title}
                </span>
              </div>
            </div>
          )}

          {/* Milestone Indicators */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-border/40">
            {levels.slice(0, 4).map((level, index) => (
              <div
                key={level.level_number}
                className={`text-center p-2 rounded-lg transition-colors ${
                  level.level_number <= profile.current_level
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted/30 text-muted-foreground'
                }`}
              >
                <div className="text-lg">{level.icon}</div>
                <p className="text-xs font-medium mt-1">Lv.{level.level_number}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CitizenProgressOverview;
