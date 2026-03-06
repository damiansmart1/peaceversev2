import { useState } from 'react';
import Navigation from '@/components/Navigation';
import LeaderboardSection from '@/components/LeaderboardSection';
import RewardStoreSection from '@/components/RewardStoreSection';
import WeeklyChallengesSection from '@/components/WeeklyChallengesSection';
import GamificationDashboard from '@/components/GamificationDashboard';
import { ProfileActivityTimeline } from '@/components/ProfileActivityTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeroBanner from '@/components/DashboardHeroBanner';
import { 
  Crosshair, 
  ShoppingBag, 
  Users2,
  LayoutGrid,
  History
} from 'lucide-react';
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

  const challengesCompleted = submissions?.filter(s => s.status === 'approved').length || 0;
  const reportsSubmitted = myReports?.length || 0;
  const proposalsVoted = 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Hero Banner */}
          <DashboardHeroBanner
            icon={<Users2 className="h-8 w-8 text-primary" />}
            title="Citizen Dashboard"
            subtitle="Track your impact and continue building peace across Africa"
            onRefresh={handleRefresh}
            accentColor="primary"
          />

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
            <TabsList className="bg-card/80 backdrop-blur-sm border border-border/50 p-1 rounded-xl grid w-full md:w-auto md:inline-grid grid-cols-4 gap-1">
              <TabsTrigger value="overview" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              {hasFeature('challenges') && (
                <TabsTrigger value="challenges" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                  <Crosshair className="h-4 w-4" />
                  <span className="hidden sm:inline">Challenges</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="activity" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="store" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Rewards</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <CitizenProgressOverview 
                profile={profile}
                levels={levels}
                isLoading={profileLoading || levelsLoading}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GamificationDashboard />
                <LeaderboardSection />
              </div>
            </TabsContent>

            {hasFeature('challenges') && (
              <TabsContent value="challenges" className="space-y-6">
                <WeeklyChallengesSection />
              </TabsContent>
            )}

            <TabsContent value="activity" className="space-y-6">
              <ProfileActivityTimeline />
            </TabsContent>

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
