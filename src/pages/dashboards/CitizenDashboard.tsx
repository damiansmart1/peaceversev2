import Navigation from '@/components/Navigation';
import UserProgressCard from '@/components/UserProgressCard';
import LeaderboardSection from '@/components/LeaderboardSection';
import RewardStoreSection from '@/components/RewardStoreSection';
import WeeklyChallengesSection from '@/components/WeeklyChallengesSection';
import GamificationDashboard from '@/components/GamificationDashboard';
import { ProfileActivityTimeline } from '@/components/ProfileActivityTimeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Trophy, ShoppingBag, Target, Activity, Settings, Heart, Mic, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CitizenDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Citizen Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your impact and continue building peace
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/voice')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-primary" />
                  Share Your Voice
                </CardTitle>
                <CardDescription>Submit stories and experiences</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/reports')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-primary" />
                  Report Incidents
                </CardTitle>
                <CardDescription>Help keep the community safe</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/challenges')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Join Challenges
                </CardTitle>
                <CardDescription>Participate in peace-building activities</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <UserProgressCard />

          <Tabs defaultValue="achievements" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="achievements">
                <Trophy className="w-4 h-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="challenges">
                <Target className="w-4 h-4 mr-2" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="leaderboard">
                <User className="w-4 h-4 mr-2" />
                Rankings
              </TabsTrigger>
              <TabsTrigger value="store">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Store
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="achievements">
              <GamificationDashboard />
            </TabsContent>

            <TabsContent value="challenges">
              <WeeklyChallengesSection />
            </TabsContent>

            <TabsContent value="activity">
              <ProfileActivityTimeline />
            </TabsContent>

            <TabsContent value="leaderboard">
              <LeaderboardSection />
            </TabsContent>

            <TabsContent value="store">
              <RewardStoreSection />
            </TabsContent>

            <TabsContent value="settings" className="text-center py-12">
              <p className="text-muted-foreground">Profile settings coming soon</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
