import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import AccessibilityFeatures from '@/components/AccessibilityFeatures';
import DonorShowcase from '@/components/DonorShowcase';
import TeamSection from '@/components/TeamSection';
import { AboutImpactMetrics } from '@/components/AboutImpactMetrics';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Users, BarChart, Accessibility, Gift } from 'lucide-react';

const About = () => {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <SectionHeader
          badge="About Us"
          title="Building a Peaceful Future Together"
          subtitle="Learn about our mission, team, impact, and the supporters making this possible"
          icon={<Heart className="w-4 h-4" />}
        />
        
        <Tabs defaultValue="mission" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="mission" className="gap-2">
              <Heart className="w-4 h-4" />
              Mission
            </TabsTrigger>
            <TabsTrigger value="impact" className="gap-2">
              <BarChart className="w-4 h-4" />
              Impact
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="gap-2">
              <Accessibility className="w-4 h-4" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger value="supporters" className="gap-2">
              <Gift className="w-4 h-4" />
              Supporters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mission" className="space-y-16">
            <TeamSection />
          </TabsContent>

          <TabsContent value="impact" className="space-y-16">
            <AboutImpactMetrics />
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-16">
            <AccessibilityFeatures />
          </TabsContent>

          <TabsContent value="supporters" className="space-y-16">
            <DonorShowcase />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default About;
