import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import SectionHeader from "@/components/SectionHeader";
import FeatureCard from "@/components/FeatureCard";
import { useTranslationContext } from "@/components/TranslationProvider";
import { useNavigate } from "react-router-dom";
import { Mic, Users, Radio, Award, Shield, Heart, Vote } from "lucide-react";

const Index = () => {
  const { t } = useTranslationContext();
  const navigate = useNavigate();
  
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <FeatureCard
              icon={<div className="w-12 h-12 bg-voice-active rounded-full flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>}
              title={t('features.voice.title')}
              description={t('features.voice.description')}
              onClick={() => navigate('/voice')}
            />
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>}
              title={t('features.community.title')}
              description={t('features.community.description')}
              onClick={() => navigate('/community')}
            />
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Radio className="w-6 h-6 text-white" />
              </div>}
              title={t('features.radio.title')}
              description={t('features.radio.description')}
              onClick={() => navigate('/radio')}
            />
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>}
              title={t('features.challenges.title')}
              description={t('features.challenges.description')}
              onClick={() => navigate('/challenges')}
            />
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Vote className="w-6 h-6 text-white" />
              </div>}
              title={t('proposals.publicParticipation')}
              description={t('proposals.publicParticipationDesc')}
              onClick={() => navigate('/proposals')}
            />
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>}
              title={t('features.safety.title')}
              description={t('features.safety.description')}
              onClick={() => navigate('/safety')}
            />
          </div>
        </div>
      </section>
      
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