import Navigation from '@/components/Navigation';
import UserProgressCard from '@/components/UserProgressCard';
import LeaderboardSection from '@/components/LeaderboardSection';
import RewardStoreSection from '@/components/RewardStoreSection';
import WeeklyChallengesSection from '@/components/WeeklyChallengesSection';
import GamificationDashboard from '@/components/GamificationDashboard';
import { ProfileActivityTimeline } from '@/components/ProfileActivityTimeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, ShoppingBag, Target, Activity, Heart, Mic, Flag, Radio, Globe, Map, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAccessibleFeatures } from '@/hooks/useRoleFeatureAccess';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { features: accessibleFeatures } = useAccessibleFeatures();

  // Helper to check if a feature is accessible
  const hasFeature = (featureKey: string) => accessibleFeatures.includes(featureKey);

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-[#e1ad40]">
              Citizen Dashboard
            </h1>
            <p className="text-lg text-white">
              Track your impact and continue building peace
            </p>
          </div>

          {/* Quick Actions - Only show accessible features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {hasFeature('community') && (
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/community')}>
                <CardHeader className="border-none">
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-primary" />
                    Share Your Voice
                  </CardTitle>
                  <CardDescription>Submit stories through Community Hub</CardDescription>
                </CardHeader>
              </Card>
            )}
            {hasFeature('incidents') && (
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/incidents')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="w-5 h-5 text-primary" />
                    Report Incidents
                  </CardTitle>
                  <CardDescription>Help keep the community safe</CardDescription>
                </CardHeader>
              </Card>
            )}
            {hasFeature('challenges') && (
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/challenges')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Join Challenges
                  </CardTitle>
                  <CardDescription>Participate in peace-building activities</CardDescription>
                </CardHeader>
              </Card>
            )}
            {hasFeature('proposals') && (
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/proposals')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-primary" />
                    Polls & Proposals
                  </CardTitle>
                  <CardDescription>Vote on community decisions</CardDescription>
                </CardHeader>
              </Card>
            )}
            {hasFeature('peace-pulse') && (
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/peace-pulse')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Peace Pulse
                  </CardTitle>
                  <CardDescription>View peace metrics and trends</CardDescription>
                </CardHeader>
              </Card>
            )}
            {hasFeature('radio') && (
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/radio')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-primary" />
                    Peace Radio
                  </CardTitle>
                  <CardDescription>Listen to community broadcasts</CardDescription>
                </CardHeader>
              </Card>
            )}
            {hasFeature('safety') && (
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/safety')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Safety Portal
                  </CardTitle>
                  <CardDescription>Access safety resources</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>

          <UserProgressCard />

          <Tabs defaultValue="progress" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="progress">
                <Trophy className="w-4 h-4 mr-2" />
                Progress & Rankings
              </TabsTrigger>
              {hasFeature('challenges') && (
                <TabsTrigger value="challenges">
                  <Target className="w-4 h-4 mr-2" />
                  Challenges
                </TabsTrigger>
              )}
              <TabsTrigger value="activity">
                <Activity className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="store">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Store
              </TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="space-y-8">
              <GamificationDashboard />
              <LeaderboardSection />
            </TabsContent>

            {hasFeature('challenges') && (
              <TabsContent value="challenges">
                <WeeklyChallengesSection />
              </TabsContent>
            )}

            <TabsContent value="activity">
              <ProfileActivityTimeline />
            </TabsContent>

            <TabsContent value="store">
              <RewardStoreSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;