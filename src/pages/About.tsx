import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import AccessibilityFeatures from '@/components/AccessibilityFeatures';
import DonorShowcase from '@/components/DonorShowcase';
import TeamSection from '@/components/TeamSection';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Heart } from 'lucide-react';

const About = () => {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <SectionHeader
          badge="About Us"
          title="Building a Peaceful Future Together"
          subtitle="Learn about our mission, accessibility features, and the supporters making this platform possible"
          icon={<Heart className="w-4 h-4" />}
        />
        
        <div className="space-y-16">
          <TeamSection />
          <AccessibilityFeatures />
          <DonorShowcase />
        </div>
      </div>
    </div>
  );
};

export default About;
