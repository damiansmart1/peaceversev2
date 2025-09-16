import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import SectionHeader from "@/components/SectionHeader";
import FeatureCard from "@/components/FeatureCard";
import VoiceRecorder from "@/components/VoiceRecorder";
import CommunityMap from "@/components/CommunityMap";
import GamificationDashboard from "@/components/GamificationDashboard";
import AccessibilityFeatures from "@/components/AccessibilityFeatures";
import DonorShowcase from "@/components/DonorShowcase";
import ContentUpload from "@/components/ContentUpload";
import ContentFeed from "@/components/ContentFeed";
import PeacebuildingChallenges from "@/components/PeacebuildingChallenges";
import ContentModerationSection from "@/components/ContentModerationSection";
import OfflineAccessSection from "@/components/OfflineAccessSection";
import SafetyProtectionSection from "@/components/SafetyProtectionSection";
import CommunityTrustSection from "@/components/CommunityTrustSection";
import RadioAccessibilityFeatures from "@/components/RadioAccessibilityFeatures";
import FunctionalRadio from "@/components/FunctionalRadio";
import { useTranslationContext } from "@/components/TranslationProvider";
import { Mic, Users, Radio, Map, Award, Shield, Globe, Heart, Upload, MessageSquare } from "lucide-react";

const Index = () => {
  const { t } = useTranslationContext();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      
      {/* Feature Overview Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge={t('features.badge')}
            title={t('features.title')}
            subtitle={t('features.subtitle')}
            icon={<Heart className="w-4 h-4" />}
          />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<div className="w-12 h-12 bg-voice-active rounded-full flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>}
              title={t('features.voice.title')}
              description={t('features.voice.description')}
              onClick={() => scrollToSection('voice')}
            />
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>}
              title={t('features.community.title')}
              description={t('features.community.description')}
              onClick={() => scrollToSection('community')}
            />
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Radio className="w-6 h-6 text-white" />
              </div>}
              title={t('features.radio.title')}
              description={t('features.radio.description')}
              onClick={() => scrollToSection('radio')}
            />
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center">
                <Map className="w-6 h-6 text-white" />
              </div>}
              title={t('features.map.title')}
              description={t('features.map.description')}
              onClick={() => scrollToSection('map')}
            />
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>}
              title={t('features.challenges.title')}
              description={t('features.challenges.description')}
              onClick={() => scrollToSection('challenges')}
            />
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>}
              title={t('features.safety.title')}
              description={t('features.safety.description')}
              onClick={() => scrollToSection('safety')}
            />
          </div>
        </div>
      </section>

      {/* Voice Recording Section */}
      <section id="voice" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge={t('voice.badge')}
            title={t('voice.title')}
            subtitle={t('voice.subtitle')}
            icon={<Mic className="w-4 h-4" />}
          />
          <div className="max-w-4xl mx-auto">
            <VoiceRecorder />
          </div>
        </div>
      </section>

      {/* Community Map Section */}
      <section id="map" className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge={t('map.badge')}
            title={t('map.title')}
            subtitle={t('map.subtitle')}
            icon={<Map className="w-4 h-4" />}
          />
          <CommunityMap />
        </div>
      </section>

      {/* Online Radio Section */}
      <section id="radio" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge={t('radio.badge')}
            title={t('radio.title')}
            subtitle={t('radio.subtitle')}
            icon={<Radio className="w-4 h-4" />}
          />
          <div className="max-w-4xl mx-auto">
            <FunctionalRadio />
          </div>
          
          {/* Radio Accessibility Features */}
          <div className="mt-16 max-w-6xl mx-auto">
            <RadioAccessibilityFeatures />
          </div>
        </div>
      </section>

      {/* Content Sharing Section */}
      <section id="content" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge={t('content.badge')}
            title={t('content.share.title')}
            subtitle={t('content.share.subtitle')}
            icon={<Upload className="w-4 h-4" />}
          />
          <div className="max-w-4xl mx-auto">
            <ContentUpload />
          </div>
        </div>
      </section>

      {/* Community Content Feed */}
      <section id="community" className="py-20 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge={t('community.badge')}
            title={t('community.stories.title')}
            subtitle={t('community.stories.subtitle')}
            icon={<MessageSquare className="w-4 h-4" />}
          />
          <div className="max-w-4xl mx-auto">
            <ContentFeed />
          </div>
        </div>
      </section>

      {/* Peacebuilding Challenges Section */}
      <section id="challenges" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge={t('challenges.badge')}
            title={t('challenges.title')}
            subtitle={t('challenges.subtitle')}
            icon={<Award className="w-4 h-4" />}
          />
          <PeacebuildingChallenges />
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section id="safety" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge={t('safety.badge')}
            title={t('safety.title')}
            subtitle={t('safety.subtitle')}
            icon={<Shield className="w-4 h-4" />}
          />
          
          <div className="space-y-16">
            <ContentModerationSection />
            <SafetyProtectionSection />
            <CommunityTrustSection />
            <OfflineAccessSection />
          </div>
        </div>
      </section>

      <GamificationDashboard />
      <AccessibilityFeatures />
      <DonorShowcase />
      
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-peace-gradient bg-clip-text text-transparent">
                {t('hero.title')}
              </h3>
              <p className="text-primary-foreground/80">
                {t('footer.tagline')}
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">{t('footer.features')}</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>{t('footer.features.voice')}</li>
                <li>{t('footer.features.mapping')}</li>
                <li>{t('footer.features.challenges')}</li>
                <li>{t('footer.features.dialogue')}</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">{t('footer.support')}</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>{t('footer.support.accessibility')}</li>
                <li>{t('footer.support.multilang')}</li>
                <li>{t('footer.support.safety')}</li>
                <li>{t('footer.support.crisis')}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 {t('hero.title')}. {t('footer.tagline')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;