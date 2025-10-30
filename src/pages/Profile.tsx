import Navigation from '@/components/Navigation';
import UserProgressCard from '@/components/UserProgressCard';
import LeaderboardSection from '@/components/LeaderboardSection';
import RewardStoreSection from '@/components/RewardStoreSection';
import WeeklyChallengesSection from '@/components/WeeklyChallengesSection';
import GamificationDashboard from '@/components/GamificationDashboard';
import { ProfileActivityTimeline } from '@/components/ProfileActivityTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Trophy, ShoppingBag, Target, Activity, Settings } from 'lucide-react';

const Profile = () => {
  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Your Peace Journey
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your impact and continue building peace
            </p>
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

export default Profile;
