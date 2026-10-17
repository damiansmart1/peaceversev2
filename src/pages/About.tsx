import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, BarChart, Globe, Vote, Users, Shield } from 'lucide-react';
import AboutHeroSection from '@/components/about/AboutHeroSection';
import InternationalFrameworksSection from '@/components/about/InternationalFrameworksSection';
import PlatformArchitectureSection from '@/components/about/PlatformArchitectureSection';
import ElectionStandardsSection from '@/components/about/ElectionStandardsSection';
import { AboutImpactMetrics } from '@/components/AboutImpactMetrics';
import PeopleSection from '@/components/about/PeopleSection';
import DonorShowcase from '@/components/DonorShowcase';
import { useTranslationContext } from '@/components/TranslationProvider';

const About = () => {
  const { t } = useTranslationContext();
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-20 md:py-24 max-w-7xl">
        <AboutHeroSection />

        <Tabs defaultValue="team" className="max-w-6xl mx-auto mt-12 md:mt-16">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8 h-auto">
            <TabsTrigger value="frameworks" className="gap-1.5 text-xs py-2.5">
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('about.frameworks')}</span>
            </TabsTrigger>
            <TabsTrigger value="platform" className="gap-1.5 text-xs py-2.5">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('about.platform')}</span>
            </TabsTrigger>
            <TabsTrigger value="elections" className="gap-1.5 text-xs py-2.5">
              <Vote className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('about.elections')}</span>
            </TabsTrigger>
            <TabsTrigger value="impact" className="gap-1.5 text-xs py-2.5">
              <BarChart className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('about.impact')}</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5 text-xs py-2.5">
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('about.team')}</span>
            </TabsTrigger>
            <TabsTrigger value="partners" className="gap-1.5 text-xs py-2.5">
              <Heart className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('about.partners')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="frameworks" className="space-y-12">
            <InternationalFrameworksSection />
          </TabsContent>

          <TabsContent value="platform" className="space-y-12">
            <PlatformArchitectureSection />
          </TabsContent>

          <TabsContent value="elections" className="space-y-12">
            <ElectionStandardsSection />
          </TabsContent>

          <TabsContent value="impact" className="space-y-12">
            <AboutImpactMetrics />
          </TabsContent>

          <TabsContent value="team" className="space-y-12">
            <PeopleSection />
          </TabsContent>

          <TabsContent value="partners" className="space-y-12">
            <PeopleSection category="partner" />
            <DonorShowcase />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default About;
