import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import SectionHeader from "@/components/SectionHeader";
import FeatureCard from "@/components/FeatureCard";
import SponsorsCarousel from "@/components/SponsorsCarousel";
import AfricaMap from "@/components/AfricaMap";
import { useTranslationContext } from "@/components/TranslationProvider";
import { useNavigate } from "react-router-dom";
import { Mic, Users, Radio, Award, Shield, Heart, Vote, Activity, AlertCircle, TrendingUp, MapPin, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { t } = useTranslationContext();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      
      {/* Feature Overview Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader
            badge={t('features.badge')}
            title={t('features.title')}
            subtitle={t('features.subtitle')}
            icon={<Heart className="w-4 h-4" />}
          />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
            <FeatureCard
              icon={<div className="w-12 h-12 bg-voice-active rounded-full flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>}
              title={t('features.voice.title')}
              description="Share stories through voice recording (Community Hub)"
              onClick={() => navigate('/community')}
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
              title="Peace Radio"
              description="Listen to community peace radio (Community Hub)"
              onClick={() => navigate('/community')}
            />
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>}
              title="Challenges"
              description="Complete peace challenges and earn rewards (Community Hub)"
              onClick={() => navigate('/community')}
            />
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Vote className="w-6 h-6 text-white" />
              </div>}
              title="Polls & Proposals"
              description="Participate in democratic decision-making and community polls"
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
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>}
              title="Peace Pulse"
              description="Real-time peace intelligence and analytics dashboard tracking sentiment, tension, and regional stability."
              onClick={() => navigate('/peace-pulse')}
            />
            
            <FeatureCard
              icon={<div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>}
              title="Incident Reporting"
              description="Report and track incidents anonymously with geo-location, AI analysis, and institutional response tracking."
              onClick={() => navigate('/incidents')}
            />
          </div>
        </div>
      </section>

      {/* Interactive Africa Map Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader
            badge="Multi-Jurisdiction"
            title="Africa-Wide Early Warning System"
            subtitle="Select your country to view localized incident reports and contribute to continental peace intelligence"
            icon={<Globe className="w-4 h-4" />}
          />
          
          <div className="max-w-7xl mx-auto mt-8 sm:mt-12">
            <AfricaMap />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mt-8 sm:mt-12">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="secondary">Scalable</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">Multi-Country Coverage</h3>
                <p className="text-muted-foreground">
                  Platform designed to scale across all African nations with localized incident reporting and jurisdiction-specific analytics.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <Badge variant="secondary">Real-Time</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">Early Warning System</h3>
                <p className="text-muted-foreground">
                  Advanced AI-powered detection and prediction to identify potential conflicts before they escalate across borders.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  </div>
                  <Badge variant="secondary">Intelligence</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">Cross-Border Insights</h3>
                <p className="text-muted-foreground">
                  Track trends, patterns, and correlations across different jurisdictions to inform continental peace strategies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Accountability & Transparency Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader
            badge="Transparency"
            title="Real-Time Peace Intelligence"
            subtitle="Track incidents, monitor peace metrics, and hold institutions accountable"
            icon={<TrendingUp className="w-4 h-4" />}
          />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mt-8 sm:mt-12">
            <Card className="border-2 hover:border-primary transition-all cursor-pointer" onClick={() => navigate('/peace-pulse')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-500" />
                  </div>
                  <Badge variant="secondary">Live Data</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">Peace Pulse Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Monitor real-time sentiment analysis, tension levels, risk scores, and trending topics across regions.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">Sentiment Analysis</Badge>
                  <Badge variant="outline" className="text-xs">Risk Assessment</Badge>
                  <Badge variant="outline" className="text-xs">Hotspot Tracking</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all cursor-pointer" onClick={() => navigate('/incidents')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <Badge variant="secondary">Anonymous</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">Incident Reporting</h3>
                <p className="text-muted-foreground mb-4">
                  Report incidents anonymously with geo-location, media evidence, and AI-powered verification.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">Anonymous Reporting</Badge>
                  <Badge variant="outline" className="text-xs">Geo-Location</Badge>
                  <Badge variant="outline" className="text-xs">AI Verification</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all cursor-pointer" onClick={() => navigate('/incidents')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-500" />
                  </div>
                  <Badge variant="secondary">Accountability</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">Response Tracking</h3>
                <p className="text-muted-foreground mb-4">
                  Track institutional responses, measure accountability indices, and monitor resolution progress.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">Response Time</Badge>
                  <Badge variant="outline" className="text-xs">Resolution Status</Badge>
                  <Badge variant="outline" className="text-xs">Accountability Index</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8 sm:mt-12 px-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/peace-pulse')}
              className="gap-2 w-full sm:w-auto"
            >
              <Activity className="w-5 h-5" />
              <span className="whitespace-nowrap">Explore Peace Intelligence</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Sponsors & Partners Carousel */}
      <SponsorsCarousel />
      
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