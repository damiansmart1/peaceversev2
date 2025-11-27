import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Star, Users, Mic, Heart, Shield } from "lucide-react";
import { useUserGamificationProfile } from "@/hooks/useGamification";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import gamificationIcon from "@/assets/gamification-icon.jpg";
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  earned: boolean;
  category: 'storytelling' | 'community' | 'peace' | 'leadership';
}
const GamificationDashboard = () => {
  const {
    data: profile,
    isLoading: profileLoading
  } = useUserGamificationProfile();
  const {
    data: userAchievements,
    isLoading: achievementsLoading
  } = useQuery({
    queryKey: ['userAchievements'],
    queryFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return [];
      const {
        data,
        error
      } = await (supabase as any).from('user_achievements').select('achievement_id, earned_at, achievements(*)').eq('user_id', user.id);
      if (error) throw error;
      return data;
    }
  });
  if (profileLoading || achievementsLoading) {
    return <div className="py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>;
  }
  const achievements: Achievement[] = [{
    id: '1',
    title: 'First Voice',
    description: 'Share your first story with the community',
    icon: <Mic className="w-6 h-6" />,
    progress: 1,
    maxProgress: 1,
    earned: true,
    category: 'storytelling'
  }, {
    id: '2',
    title: 'Community Builder',
    description: 'Connect with 10 other peace builders',
    icon: <Users className="w-6 h-6" />,
    progress: 7,
    maxProgress: 10,
    earned: false,
    category: 'community'
  }, {
    id: '3',
    title: 'Peace Ambassador',
    description: 'Receive 50 positive reactions on your stories',
    icon: <Heart className="w-6 h-6" />,
    progress: 32,
    maxProgress: 50,
    earned: false,
    category: 'peace'
  }, {
    id: '4',
    title: 'Safe Space Guardian',
    description: 'Help moderate and maintain safe dialogue spaces',
    icon: <Shield className="w-6 h-6" />,
    progress: 0,
    maxProgress: 1,
    earned: false,
    category: 'leadership'
  }, {
    id: '5',
    title: 'Story Weaver',
    description: 'Share 10 meaningful stories',
    icon: <Star className="w-6 h-6" />,
    progress: 4,
    maxProgress: 10,
    earned: false,
    category: 'storytelling'
  }, {
    id: '6',
    title: 'Unity Champion',
    description: 'Bring together youth from different backgrounds',
    icon: <Award className="w-6 h-6" />,
    progress: 2,
    maxProgress: 5,
    earned: false,
    category: 'leadership'
  }];
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'storytelling':
        return 'bg-voice-active';
      case 'community':
        return 'bg-accent';
      case 'peace':
        return 'bg-primary';
      case 'leadership':
        return 'bg-warning';
      default:
        return 'bg-muted';
    }
  };
  const totalEarned = userAchievements?.length || achievements.filter(a => a.earned).length;
  const totalPoints = profile?.peace_points || 0;
  const livesImpacted = profile ? profile.total_stories * 10 + profile.total_actions * 5 : 127;
  return <section className="py-8">
      <div className="container px-[16px] py-0 mx-0 rounded-full shadow-md">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#e1ad40]">Your Peace Journey</h2>
          <p className="text-lg max-w-2xl mx-auto text-white">
            Track your progress and celebrate your contributions to building a more peaceful world
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="max-w-4xl mx-auto mb-10 p-6 md:p-8 bg-gradient-to-br from-card/95 to-accent-light/20 backdrop-blur-sm shadow-elevated rounded-2xl border-destructive">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 text-center">
            <div className="space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center mx-auto shadow-peace">
                <Award className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary">{totalEarned}</div>
                <div className="text-sm text-muted-foreground font-medium">Badges Earned</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-light rounded-2xl flex items-center justify-center mx-auto shadow-story">
                <Star className="w-8 h-8 text-accent-foreground" />
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-accent">{totalPoints}</div>
                <div className="text-sm text-muted-foreground font-medium">Peace Points</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-warning to-warning/70 rounded-2xl flex items-center justify-center mx-auto shadow-warm">
                <Users className="w-8 h-8 text-warning-foreground" />
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-warning">{livesImpacted}</div>
                <div className="text-sm text-muted-foreground font-medium">Lives Impacted</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Achievements Grid */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6 text-center text-foreground">Achievements & Challenges</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.map(achievement => <Card key={achievement.id} className={`p-5 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 rounded-xl ${achievement.earned ? 'bg-gradient-to-br from-success/10 to-success/5 border-success/40 shadow-peace' : 'bg-card/90 backdrop-blur-sm border-border/40 shadow-story'}`}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${achievement.earned ? 'bg-gradient-to-br from-success to-success/70' : getCategoryColor(achievement.category)}`}>
                      {achievement.earned ? <Award className="w-7 h-7 text-success-foreground" /> : <div className="text-primary-foreground">{achievement.icon}</div>}
                    </div>
                    {achievement.earned && <Badge className="bg-success text-success-foreground rounded-full px-3">
                        Earned!
                      </Badge>}
                  </div>

                  <div>
                    <h4 className="font-semibold text-card-foreground mb-2">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                  </div>

                  {!achievement.earned && <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-card-foreground font-medium">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                      <Progress value={achievement.progress / achievement.maxProgress * 100} className="h-2" />
                    </div>}
                </div>
              </Card>)}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-10">
          <Card className="max-w-2xl mx-auto p-6 md:p-8 bg-community-gradient border-none shadow-elevated rounded-2xl">
            <div className="space-y-3">
              <h3 className="text-xl md:text-2xl font-bold text-warning-foreground">Keep Building Peace!</h3>
              <p className="text-warning-foreground/90 text-base">
                Every story shared, every connection made, every voice heard brings us closer to a peaceful world.
              </p>
              <Button variant="secondary" size="lg" className="mt-3 rounded-full shadow-sm">
                <Mic className="w-5 h-5 mr-2" />
                Share Another Story
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>;
};
export default GamificationDashboard;