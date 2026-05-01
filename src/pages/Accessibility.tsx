import Navigation from '@/components/Navigation';
import AccessibilityPanel from '@/components/AccessibilityPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accessibility, Eye, Ear, Keyboard, Globe, Wifi,
  Heart, Users, Target, Award, Smartphone, MessageSquare,
  Languages, Brain, Volume2, ShieldCheck, BookOpen, Phone,
  Mail, ExternalLink, CheckCircle2, Signal, HandHeart
} from 'lucide-react';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Link } from 'react-router-dom';

export default function AccessibilityPage() {
  const { t } = useTranslationContext();

  const impactStats = [
    { value: '11', label: 'Languages supported', icon: Languages },
    { value: 'WCAG 2.1 AA', label: 'Compliance standard', icon: ShieldCheck },
    { value: '< 50KB', label: 'Low-bandwidth payload', icon: Signal },
    { value: '100%', label: 'Keyboard navigable', icon: Keyboard },
  ];

  const features = [
    {
      icon: Eye,
      title: 'Visual Accessibility',
      description: 'Adjustable text up to 200%, high-contrast mode, dyslexia-friendly OpenDyslexic font, reduced motion, and enhanced focus indicators for low-vision users.',
      badge: 'WCAG 2.1 AA'
    },
    {
      icon: Ear,
      title: 'Audio & Voice Support',
      description: 'Screen reader optimization (NVDA, JAWS, VoiceOver, TalkBack), text-to-speech for any content, audio descriptions, and hands-free voice navigation.',
      badge: 'Voice-First'
    },
    {
      icon: Keyboard,
      title: 'Keyboard & Motor Support',
      description: 'Every action reachable without a mouse. Skip-navigation links, customizable shortcuts, sticky focus, and large touch targets (≥44px) for motor impairments.',
      badge: 'Full Support'
    },
    {
      icon: Languages,
      title: '11 Languages',
      description: 'English, Swahili, French, Arabic, Somali, Amharic, Hausa, Yoruba, Zulu, Portuguese, and Kinyarwanda — with right-to-left layout support.',
      badge: 'Multilingual'
    },
    {
      icon: Wifi,
      title: 'Low-Bandwidth & Offline',
      description: 'Works on 2G networks, caches alerts and safe-space data for offline use, and queues citizen reports until you reconnect.',
      badge: 'Works Offline'
    },
    {
      icon: Brain,
      title: 'Cognitive Accessibility',
      description: 'Simplified interface, plain-language reading mode, predictable layouts, and reduced motion for users with cognitive disabilities or low literacy.',
      badge: 'Inclusive'
    },
    {
      icon: Smartphone,
      title: 'USSD & SMS Access',
      description: 'Report incidents and receive early-warning alerts on any feature phone — no smartphone, no internet, no app required.',
      badge: 'Feature Phone'
    },
    {
      icon: HandHeart,
      title: 'Sign Language & Captions',
      description: 'Captions on all video content and on-demand sign language interpretation overlays for deaf and hard-of-hearing users.',
      badge: 'Premium'
    },
    {
      icon: ShieldCheck,
      title: 'Safe & Anonymous',
      description: 'Anonymous reporting, encrypted submissions, and a Reporter Safety system that protects vulnerable users in conflict zones.',
      badge: 'Protected'
    },
  ];

  const standards = [
    { label: 'WCAG 2.1 Level AA conformance across all pages' },
    { label: 'Section 508 (US Rehabilitation Act) aligned' },
    { label: 'EN 301 549 (European accessibility standard) aligned' },
    { label: 'ARIA 1.2 landmarks, roles, and live regions' },
    { label: 'Color contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text' },
    { label: 'All interactive elements operable by keyboard alone' },
    { label: 'Respects prefers-reduced-motion and prefers-contrast OS settings' },
    { label: 'Tested with NVDA, JAWS, VoiceOver, and TalkBack screen readers' },
  ];

  const shortcuts = [
    { keys: 'Alt + /', action: 'Open keyboard shortcuts' },
    { keys: 'Alt + S', action: 'Skip to main content' },
    { keys: 'Alt + A', action: 'Open accessibility menu' },
    { keys: 'Alt + H', action: 'Go to home' },
    { keys: 'Alt + R', action: 'Report an incident' },
    { keys: 'Esc', action: 'Close any open dialog' },
  ];

  const commitment = [
    {
      icon: Heart,
      title: 'Inclusion is a Right',
      description: 'Peace building must include everyone — survivors, persons with disabilities, low-literacy users, and citizens in remote areas alike.'
    },
    {
      icon: Target,
      title: 'Designed for All',
      description: 'Accessibility is built into every feature from day one, not bolted on later. Co-designed with disabled users and rural communities across Africa.'
    },
    {
      icon: Award,
      title: 'Standards Compliant',
      description: 'We meet WCAG 2.1 Level AA today and are working toward Level AAA, with quarterly third-party audits and a public conformance report.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navigation />

      <main id="main-content" className="container mx-auto px-4 py-8 space-y-12" tabIndex={-1}>
        {/* Hero Section */}
        <section className="text-center space-y-4 pt-8 max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-2">
            <Accessibility className="w-4 h-4 mr-2" />
            Universal Access
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Peace for Everyone, Accessible by Everyone
          </h1>
          <p className="text-xl text-muted-foreground">
            PeaceVerse is engineered so that disability, language, literacy, geography, or device
            never become barriers to safety, voice, and participation.
          </p>
        </section>

        {/* Impact Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {impactStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="text-center">
                <CardContent className="pt-6 space-y-2">
                  <Icon className="w-6 h-6 mx-auto text-primary" />
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Accessibility Features Grid */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">What Makes PeaceVerse Accessible</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nine pillars of universal access — each tested with real users across Africa.
            </p>
          </div>
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
        </section>

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

        {/* Standards & Conformance */}
        <section className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                Standards & Conformance
              </CardTitle>
              <CardDescription>
                The international standards we meet — and how we measure ourselves.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {standards.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{s.label}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="w-6 h-6 text-primary" />
                Keyboard Shortcuts
              </CardTitle>
              <CardDescription>
                Get anywhere on PeaceVerse without touching a mouse.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {shortcuts.map((s, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{s.action}</span>
                    <kbd className="px-2 py-1 bg-muted rounded border text-xs font-mono">{s.keys}</kbd>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Settings Panel */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Customize Your Experience</h2>
            <p className="text-muted-foreground">
              Adjust these settings now — they'll be saved to your device automatically.
            </p>
          </div>
          <AccessibilityPanel />
        </section>

        {/* Offline & Low-Tech Access */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-primary" />
              No Smartphone? No Internet? No Problem.
            </CardTitle>
            <CardDescription>
              PeaceVerse reaches the last mile through low-tech channels.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <Phone className="w-5 h-5 text-primary" /> USSD
              </div>
              <p className="text-sm text-muted-foreground">
                Dial a short code on any feature phone to report incidents or check alerts. No data charges.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <MessageSquare className="w-5 h-5 text-primary" /> SMS
              </div>
              <p className="text-sm text-muted-foreground">
                Submit reports and receive early-warning alerts via text message in your local language.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <Wifi className="w-5 h-5 text-primary" /> Offline PWA
              </div>
              <p className="text-sm text-muted-foreground">
                Install PeaceVerse as an app. It caches data and queues your reports until connectivity returns.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feedback & Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandHeart className="w-6 h-6 text-primary" />
              Found a Barrier? Tell Us.
            </CardTitle>
            <CardDescription>
              Your feedback shapes the next release. We respond to every accessibility report within 5 business days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If any part of PeaceVerse is hard to use, or you need an accommodation we don't yet
              offer, reach out. We'll work with you to find an alternative right away and add a
              permanent fix to our roadmap.
            </p>
            <Separator />
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="default" size="sm">
                <a href="mailto:accessibility@peaceverse.org">
                  <Mail className="w-4 h-4 mr-2" />
                  accessibility@peaceverse.org
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/help">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Help Center
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/install">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Install the App
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
