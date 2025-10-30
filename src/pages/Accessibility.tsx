import Navigation from '@/components/Navigation';
import AccessibilityPanel from '@/components/AccessibilityPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Accessibility, Eye, Ear, Keyboard, Globe, Wifi, 
  Heart, Users, Target, Award 
} from 'lucide-react';
import { useTranslationContext } from '@/components/TranslationProvider';

export default function AccessibilityPage() {
  const { t } = useTranslationContext();

  const features = [
    {
      icon: Eye,
      title: 'Visual Accessibility',
      description: 'Text sizing, high contrast mode, dyslexia-friendly fonts, and enhanced focus indicators',
      badge: 'WCAG 2.1 AAA'
    },
    {
      icon: Ear,
      title: 'Audio & Voice Support',
      description: 'Screen reader optimization, text-to-speech, audio descriptions, and voice navigation',
      badge: 'Voice-First'
    },
    {
      icon: Keyboard,
      title: 'Keyboard Navigation',
      description: 'Full keyboard support with customizable shortcuts and focus management',
      badge: 'Full Support'
    },
    {
      icon: Globe,
      title: '11 Languages',
      description: 'Platform available in English, Swahili, French, Arabic, Somali, Amharic, and more',
      badge: 'Multilingual'
    },
    {
      icon: Wifi,
      title: 'Connectivity Options',
      description: 'Low bandwidth mode, offline functionality, and data saver features',
      badge: 'Works Offline'
    },
    {
      icon: Users,
      title: 'Cognitive Accessibility',
      description: 'Simplified interface mode, reading mode, and reduced motion options',
      badge: 'Inclusive'
    }
  ];

  const commitment = [
    {
      icon: Heart,
      title: 'Commitment to Inclusion',
      description: 'We believe peace building should be accessible to everyone, regardless of ability, literacy, or technology access.'
    },
    {
      icon: Target,
      title: 'Designed for All',
      description: 'Built from the ground up with accessibility as a core principle, not an afterthought.'
    },
    {
      icon: Award,
      title: 'Standards Compliant',
      description: 'Following WCAG 2.1 Level AA guidelines and striving for AAA where possible.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navigation />
      
      <main id="main-content" className="container mx-auto px-4 py-8 space-y-12" tabIndex={-1}>
        {/* Hero Section */}
        <div className="text-center space-y-4 pt-8">
          <Badge variant="secondary" className="mb-2">
            <Accessibility className="w-4 h-4 mr-2" />
            World-Class Accessibility
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {t('accessibility.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('accessibility.subtitle')}
          </p>
        </div>

        {/* Accessibility Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="secondary">{feature.badge}</Badge>
                  </div>
                  <CardTitle className="text-xl mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Commitment Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-none shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Our Accessibility Commitment</CardTitle>
            <CardDescription className="text-base">
              Building peace requires including everyone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {commitment.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center space-y-3">
                    <div className="flex justify-center">
                      <div className="p-4 rounded-full bg-primary/10">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Settings Panel */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Customize Your Experience</h2>
            <p className="text-muted-foreground">
              Adjust these settings to create the perfect experience for you
            </p>
          </div>
          
          <AccessibilityPanel />
        </div>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-6 h-6" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If you're having trouble accessing any part of PeaceVerse or need additional 
              accommodations, please don't hesitate to reach out to our support team.
            </p>
            <div className="flex gap-4 flex-wrap">
              <a 
                href="mailto:accessibility@peaceverse.org" 
                className="text-primary hover:underline font-medium"
              >
                accessibility@peaceverse.org
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href="/help" 
                className="text-primary hover:underline font-medium"
              >
                Visit Help Center
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
