import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Star, Users, Mic, Heart, Shield } from "lucide-react";
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
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Voice',
      description: 'Share your first story with the community',
      icon: <Mic className="w-6 h-6" />,
      progress: 1,
      maxProgress: 1,
      earned: true,
      category: 'storytelling'
    },
    {
      id: '2',
      title: 'Community Builder',
      description: 'Connect with 10 other peace builders',
      icon: <Users className="w-6 h-6" />,
      progress: 7,
      maxProgress: 10,
      earned: false,
      category: 'community'
    },
    {
      id: '3',
      title: 'Peace Ambassador',
      description: 'Receive 50 positive reactions on your stories',
      icon: <Heart className="w-6 h-6" />,
      progress: 32,
      maxProgress: 50,
      earned: false,
      category: 'peace'
    },
    {
      id: '4',
      title: 'Safe Space Guardian',
      description: 'Help moderate and maintain safe dialogue spaces',
      icon: <Shield className="w-6 h-6" />,
      progress: 0,
      maxProgress: 1,
      earned: false,
      category: 'leadership'
    },
    {
      id: '5',
      title: 'Story Weaver',
      description: 'Share 10 meaningful stories',
      icon: <Star className="w-6 h-6" />,
      progress: 4,
      maxProgress: 10,
      earned: false,
      category: 'storytelling'
    },
    {
      id: '6',
      title: 'Unity Champion',
      description: 'Bring together youth from different backgrounds',
      icon: <Award className="w-6 h-6" />,
      progress: 2,
      maxProgress: 5,
      earned: false,
      category: 'leadership'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'storytelling': return 'bg-voice-active';
      case 'community': return 'bg-accent';
      case 'peace': return 'bg-primary';
      case 'leadership': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  const totalEarned = achievements.filter(a => a.earned).length;
  const totalPoints = achievements.reduce((sum, a) => sum + (a.earned ? 100 : Math.floor((a.progress / a.maxProgress) * 100)), 0);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Your Peace Journey</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your progress and celebrate your contributions to building a more peaceful world
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="max-w-4xl mx-auto mb-12 p-8 bg-card/80 backdrop-blur-sm border-accent/20 shadow-warm">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{totalEarned}</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-accent-foreground" />
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">{totalPoints}</div>
                <div className="text-sm text-muted-foreground">Peace Points</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-warning-foreground" />
              </div>
              <div>
                <div className="text-3xl font-bold text-warning">127</div>
                <div className="text-sm text-muted-foreground">Lives Impacted</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Achievements Grid */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-semibold mb-8 text-center text-foreground">Achievements & Challenges</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`p-6 transition-all duration-300 hover:shadow-warm ${
                  achievement.earned
                    ? 'bg-card border-success shadow-peace'
                    : 'bg-card/80 backdrop-blur-sm border-accent/20 shadow-story'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.earned ? 'bg-success' : getCategoryColor(achievement.category)
                    }`}>
                      {achievement.earned ? (
                        <Award className="w-6 h-6 text-success-foreground" />
                      ) : (
                        <div className="text-primary-foreground">{achievement.icon}</div>
                      )}
                    </div>
                    {achievement.earned && (
                      <Badge className="bg-success text-success-foreground">
                        Earned!
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-card-foreground mb-2">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                  </div>

                  {!achievement.earned && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-card-foreground font-medium">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto p-8 bg-community-gradient border-none shadow-warm">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-warning-foreground">Keep Building Peace!</h3>
              <p className="text-warning-foreground/80">
                Every story shared, every connection made, every voice heard brings us closer to a peaceful world.
              </p>
              <Button variant="secondary" size="lg" className="mt-4">
                <Mic className="w-5 h-5" />
                Share Another Story
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default GamificationDashboard;