import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import PeacebuildingChallenges from '@/components/PeacebuildingChallenges';
import GamificationDashboard from '@/components/GamificationDashboard';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Award } from 'lucide-react';

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
          icon={<Award className="w-4 h-4" />}
        />
        
        <div className="space-y-16">
          <PeacebuildingChallenges />
          <GamificationDashboard />
        </div>
      </div>
    </div>
  );
};

export default Challenges;
