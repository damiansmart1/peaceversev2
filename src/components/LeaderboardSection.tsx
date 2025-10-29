import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLeaderboard, useUserGamificationProfile } from '@/hooks/useGamification';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const LeaderboardSection = () => {
  const [filter, setFilter] = useState<'global' | 'regional' | 'weekly'>('global');
  const { data: profile } = useUserGamificationProfile();
  const { data: leaderboard, isLoading } = useLeaderboard(filter, profile?.region);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-warning" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-96 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-accent/5 border-border/40 shadow-elevated">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-peace">
          <Trophy className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
          <p className="text-sm text-muted-foreground">Top peace builders</p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="global">🌍 Global</TabsTrigger>
          <TabsTrigger value="regional">📍 Regional</TabsTrigger>
          <TabsTrigger value="weekly">📅 Weekly</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-3">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.slice(0, 10).map((entry) => {
              const isCurrentUser = entry.user_id === profile?.user_id;
              
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                    isCurrentUser 
                      ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30 shadow-story' 
                      : 'bg-card/50 hover:bg-card/80 border border-border/40'
                  }`}
                >
                  <div className="flex items-center justify-center w-10">
                    {getRankIcon(entry.rank_global)}
                  </div>

                  <Avatar className="w-12 h-12 border-2 border-border">
                    <AvatarImage src={entry.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {entry.display_name?.[0] || entry.username?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground truncate">
                        {entry.display_name || entry.username}
                      </h4>
                      {isCurrentUser && (
                        <Badge variant="secondary" className="text-xs rounded-full">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Level {entry.current_level}</span>
                      {entry.region && <span>• {entry.region}</span>}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="text-lg font-bold text-accent">{entry.xp_points}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No rankings available yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default LeaderboardSection;
