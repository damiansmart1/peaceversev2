import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLevels, useUserGamificationProfile } from '@/hooks/useGamification';
import { Flame, Star, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const UserProgressCard = () => {
  const { data: profile, isLoading: profileLoading } = useUserGamificationProfile();
  const { data: levels, isLoading: levelsLoading } = useLevels();

  if (profileLoading || levelsLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  if (!profile || !levels) return null;

  const currentLevel = levels.find(l => l.level_number === profile.current_level);
  const nextLevel = levels.find(l => l.level_number === profile.current_level + 1);
  
  // Use peace_points as XP equivalent
  const xpPoints = profile.peace_points || 0;
  const progressToNext = nextLevel 
    ? ((xpPoints - (currentLevel?.xp_required || 0)) / (nextLevel.xp_required - (currentLevel?.xp_required || 0))) * 100
    : 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-card via-card to-accent/5 border-border/40 shadow-elevated">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-4xl shadow-peace">
            {currentLevel?.icon || '🌱'}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-foreground truncate">
              {profile.display_name || profile.username || 'Peace Builder'}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full px-3">
              Level {profile.current_level}: {currentLevel?.title || 'Peace Seedling'}
            </Badge>
          </div>

          {/* Progress Bar */}
          {nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to Level {nextLevel.level_number}</span>
                <span className="text-foreground font-medium">
                  {xpPoints} / {nextLevel.xp_required} XP
                </span>
              </div>
              <Progress value={Math.min(Math.max(progressToNext, 0), 100)} className="h-3" />
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/40">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-2xl font-bold text-accent">{profile.peace_points || 0}</span>
          </div>
          <p className="text-xs text-muted-foreground">Peace Points</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-2xl font-bold text-primary">{profile.current_level || 1}</span>
          </div>
          <p className="text-xs text-muted-foreground">Current Level</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-4 h-4 text-warning" />
            <span className="text-2xl font-bold text-warning">{profile.is_verified ? '✓' : '—'}</span>
          </div>
          <p className="text-xs text-muted-foreground">Verified</p>
        </div>
      </div>
    </Card>
  );
};

export default UserProgressCard;