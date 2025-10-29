import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import FunctionalRadio from '@/components/FunctionalRadio';
import RadioAccessibilityFeatures from '@/components/RadioAccessibilityFeatures';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Radio as RadioIcon } from 'lucide-react';

const Radio = () => {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <SectionHeader
          badge={t('radio.badge')}
          title={t('radio.title')}
          subtitle={t('radio.subtitle')}
          icon={<RadioIcon className="w-4 h-4" />}
        />
        
        <div className="max-w-4xl mx-auto space-y-12">
          <FunctionalRadio />
          <RadioAccessibilityFeatures />
        </div>
      </div>
    </div>
  );
};

export default Radio;
