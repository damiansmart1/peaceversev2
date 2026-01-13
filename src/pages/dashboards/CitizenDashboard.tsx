import { useState } from 'react';
import Navigation from '@/components/Navigation';
import LeaderboardSection from '@/components/LeaderboardSection';
import RewardStoreSection from '@/components/RewardStoreSection';
import WeeklyChallengesSection from '@/components/WeeklyChallengesSection';
import GamificationDashboard from '@/components/GamificationDashboard';
import { ProfileActivityTimeline } from '@/components/ProfileActivityTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Medal, 
  ShoppingBag, 
  Crosshair, 
  Activity, 
  RefreshCw,
  Users2,
  LayoutGrid,
  History
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccessibleFeatures } from '@/hooks/useRoleFeatureAccess';
import { useLevels, useUserGamificationProfile, useUserChallengeSubmissions } from '@/hooks/useGamification';
import { useMyReports } from '@/hooks/useMyReports';
import CitizenStatsCards from '@/components/citizen/CitizenStatsCards';
import CitizenQuickActions from '@/components/citizen/CitizenQuickActions';
import CitizenProgressOverview from '@/components/citizen/CitizenProgressOverview';
import { toast } from 'sonner';

const CitizenDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { features: accessibleFeatures } = useAccessibleFeatures();
  
  // Fetch dashboard data
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useUserGamificationProfile();
  const { data: levels, isLoading: levelsLoading } = useLevels();
  const { data: submissions } = useUserChallengeSubmissions();
  const { reports: myReports } = useMyReports();
  
  const currentLevel = levels?.find(l => l.level_number === profile?.current_level);
  const hasFeature = (featureKey: string) => accessibleFeatures.includes(featureKey);

  const handleRefresh = () => {
    refetchProfile();
    toast.success('Dashboard refreshed');
  };

  // Calculate stats
  const challengesCompleted = submissions?.filter(s => s.status === 'approved').length || 0;
  const reportsSubmitted = myReports?.length || 0;
  const proposalsVoted = 0; // Would need to implement voting tracking

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Citizen Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your impact and continue building peace
                </p>
              </div>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <CitizenStatsCards
            profile={profile}
            currentLevel={currentLevel}
            challengesCompleted={challengesCompleted}
            reportsSubmitted={reportsSubmitted}
            proposalsVoted={proposalsVoted}
            isLoading={profileLoading || levelsLoading}
          />

          {/* Quick Actions */}
          <CitizenQuickActions accessibleFeatures={accessibleFeatures} />

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 gap-2">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              {hasFeature('challenges') && (
                <TabsTrigger value="challenges" className="gap-2">
                  <Crosshair className="h-4 w-4" />
                  <span className="hidden sm:inline">Challenges</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="activity" className="gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="store" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Rewards</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Progress Overview */}
              <CitizenProgressOverview 
                profile={profile}
                levels={levels}
                isLoading={profileLoading || levelsLoading}
              />
              
              {/* Gamification & Leaderboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GamificationDashboard />
                <LeaderboardSection />
              </div>
            </TabsContent>

            {/* Challenges Tab */}
            {hasFeature('challenges') && (
              <TabsContent value="challenges" className="space-y-6">
                <WeeklyChallengesSection />
              </TabsContent>
            )}

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <ProfileActivityTimeline />
            </TabsContent>

            {/* Store Tab */}
            <TabsContent value="store" className="space-y-6">
              <RewardStoreSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
