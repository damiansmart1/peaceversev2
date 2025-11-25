import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import { VerificationQueue } from '@/components/VerificationQueue';
import { useTranslationContext } from '@/components/TranslationProvider';
import { CheckCircle } from 'lucide-react';

const Verification = () => {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <SectionHeader
          badge="Verification"
          title="Content Verification"
          subtitle="Review and verify community-submitted content"
          icon={<CheckCircle className="w-4 h-4" />}
        />
        
        <div className="max-w-6xl mx-auto">
          <VerificationQueue />
        </div>
      </div>
    </div>
  );
};

export default Verification;
