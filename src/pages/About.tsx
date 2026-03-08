import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, BarChart, Globe, Vote, Users, Shield } from 'lucide-react';
import AboutHeroSection from '@/components/about/AboutHeroSection';
import InternationalFrameworksSection from '@/components/about/InternationalFrameworksSection';
import PlatformArchitectureSection from '@/components/about/PlatformArchitectureSection';
import ElectionStandardsSection from '@/components/about/ElectionStandardsSection';
import { AboutImpactMetrics } from '@/components/AboutImpactMetrics';
import TeamSection from '@/components/TeamSection';
import DonorShowcase from '@/components/DonorShowcase';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-20 md:py-24 max-w-7xl">
        <AboutHeroSection />

        <Tabs defaultValue="frameworks" className="max-w-6xl mx-auto mt-12 md:mt-16">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8 h-auto">
            <TabsTrigger value="frameworks" className="gap-1.5 text-xs py-2.5">
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Frameworks</span>
            </TabsTrigger>
            <TabsTrigger value="platform" className="gap-1.5 text-xs py-2.5">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Platform</span>
            </TabsTrigger>
            <TabsTrigger value="elections" className="gap-1.5 text-xs py-2.5">
              <Vote className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Elections</span>
            </TabsTrigger>
            <TabsTrigger value="impact" className="gap-1.5 text-xs py-2.5">
              <BarChart className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Impact</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5 text-xs py-2.5">
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="partners" className="gap-1.5 text-xs py-2.5">
              <Heart className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Partners</span>
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
            <TeamSection />
          </TabsContent>

          <TabsContent value="partners" className="space-y-12">
            <DonorShowcase />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default About;
