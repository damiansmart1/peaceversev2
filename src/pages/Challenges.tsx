import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import PeacebuildingChallenges from '@/components/PeacebuildingChallenges';
import GamificationDashboard from '@/components/GamificationDashboard';
import ChallengeLeaderboard from '@/components/ChallengeLeaderboard';
import WeeklyChallengesSection from '@/components/WeeklyChallengesSection';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Flame } from 'lucide-react';

const Challenges = () => {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <SectionHeader
          badge={t('challenges.badge')}
          title={t('challenges.title')}
          subtitle={t('challenges.subtitle')}
          icon={<Flame className="w-4 h-4" />}
        />
        
        <div className="space-y-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <WeeklyChallengesSection />
            <ChallengeLeaderboard />
          </div>
          <PeacebuildingChallenges />
          <GamificationDashboard />
        </div>
      </div>
    </div>
  );
};

export default Challenges;
