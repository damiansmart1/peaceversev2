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
      <div className="container mx-auto px-4 py-24">
        <AboutHeroSection />

        <Tabs defaultValue="frameworks" className="max-w-6xl mx-auto mt-16">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8">
            <TabsTrigger value="frameworks" className="gap-1.5 text-xs">
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Frameworks</span>
            </TabsTrigger>
            <TabsTrigger value="platform" className="gap-1.5 text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Platform</span>
            </TabsTrigger>
            <TabsTrigger value="elections" className="gap-1.5 text-xs">
              <Vote className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Elections</span>
            </TabsTrigger>
            <TabsTrigger value="impact" className="gap-1.5 text-xs">
              <BarChart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Impact</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="partners" className="gap-1.5 text-xs">
              <Heart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Partners</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="frameworks" className="space-y-16">
            <InternationalFrameworksSection />
          </TabsContent>

          <TabsContent value="platform" className="space-y-16">
            <PlatformArchitectureSection />
          </TabsContent>

          <TabsContent value="elections" className="space-y-16">
            <ElectionStandardsSection />
          </TabsContent>

          <TabsContent value="impact" className="space-y-16">
            <AboutImpactMetrics />
          </TabsContent>

          <TabsContent value="team" className="space-y-16">
            <TeamSection />
          </TabsContent>

          <TabsContent value="partners" className="space-y-16">
            <DonorShowcase />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default About;
