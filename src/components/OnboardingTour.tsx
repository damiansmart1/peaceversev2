import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Sparkles, UsersRound, ShieldCheck, Globe2, Radio, Vote, AlertTriangle, Brain, Landmark, BarChart3, FileSearch, Building2, Handshake, MapPin, Megaphone, ClipboardCheck, Gauge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserRoles } from '@/hooks/useRoleCheck';
import { Progress } from '@/components/ui/progress';
import type { AppRole } from '@/types/database';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  action?: string;
}

type RoleKey = 'citizen' | 'verifier' | 'partner' | 'government' | 'admin';

const welcomeStep = (label: string, mission: string): OnboardingStep => ({
  title: `Welcome to PeaceVerse — ${label}`,
  description: mission,
  icon: <Globe2 className="w-12 h-12" />,
  color: 'from-primary to-primary/60',
  features: ['Detect.', 'Verify.', 'Prevent.'],
  action: "Let's begin",
});

const tours: Record<RoleKey, { label: string; steps: OnboardingStep[] }> = {
  citizen: {
    label: 'Citizen',
    steps: [
      welcomeStep('Citizen', 'Your civic voice, amplified. Report, learn, vote, and shape the future of your community across Africa.'),
      {
        title: 'Report incidents safely',
        description: 'Submit incidents anonymously via web, SMS or USSD. Track verification status in real time and stay protected with our reporter safety system.',
        icon: <AlertTriangle className="w-12 h-12" />,
        color: 'from-earth to-earth/60',
        features: ['Anonymous reporting', 'SMS / USSD offline', 'Real-time tracking', 'Reporter safety'],
        action: 'Got it',
      },
      {
        title: 'Ask NuruAI anything',
        description: 'Plain-language answers about budgets, bills and policies — every response cited and fact-checked against IFCN standards.',
        icon: <Brain className="w-12 h-12" />,
        color: 'from-primary to-secondary',
        features: ['Policy Q&A', 'Fact-check', 'Source citations'],
        action: 'Explore NuruAI',
      },
      {
        title: 'Join the conversation',
        description: 'Connect with peacebuilders, share stories, vote on proposals, and earn peace points by completing weekly challenges.',
        icon: <UsersRound className="w-12 h-12" />,
        color: 'from-forest to-forest/60',
        features: ['Community feed', 'Polls & proposals', 'Challenges', 'Leaderboard'],
        action: 'Join in',
      },
      {
        title: 'Safety first',
        description: 'Find safe spaces near you, save emergency contacts for offline access, and tune into peace radio for verified updates.',
        icon: <ShieldCheck className="w-12 h-12" />,
        color: 'from-forest to-primary',
        features: ['Safe spaces map', 'Emergency contacts', 'Peace radio'],
        action: "I'm ready",
      },
    ],
  },
  verifier: {
    label: 'Verifier',
    steps: [
      welcomeStep('Verifier', 'You are the integrity layer. Triage incoming reports, verify evidence and uphold information quality across the platform.'),
      {
        title: 'Your verification queue',
        description: 'New citizen reports are assigned to you based on jurisdiction and severity. Open the Verification Hub to see what needs attention now.',
        icon: <ClipboardCheck className="w-12 h-12" />,
        color: 'from-primary to-secondary',
        features: ['Assigned tasks', 'Severity sorted', 'SLAs visible'],
        action: 'Open queue',
      },
      {
        title: 'AI-assisted analysis',
        description: 'Every report ships with AI risk scoring, source credibility, sentiment and correlation hints. Use them — never replace your judgement.',
        icon: <Brain className="w-12 h-12" />,
        color: 'from-primary to-forest',
        features: ['Risk score', 'Credibility check', 'Pattern detection'],
        action: 'Understood',
      },
      {
        title: 'Evidence standards',
        description: 'Cross-check against news intelligence, prior incidents and OCHA-aligned thresholds before confirming or rejecting a report.',
        icon: <FileSearch className="w-12 h-12" />,
        color: 'from-earth to-gold',
        features: ['News intel', 'Historical context', 'OCHA standards'],
        action: 'Got it',
      },
      {
        title: 'Protect the reporter',
        description: 'Treat every report as sensitive. Mask PII using citizen_reports_safe views and escalate threats through the reporter safety system.',
        icon: <ShieldCheck className="w-12 h-12" />,
        color: 'from-forest to-primary',
        features: ['PII masking', 'Threat escalation', 'Audit trail'],
        action: "Start verifying",
      },
    ],
  },
  partner: {
    label: 'Partner / Observer',
    steps: [
      welcomeStep('Partner', 'Analytics, watchlists and field intelligence for civil society, INGOs and research partners working across Africa.'),
      {
        title: 'Analytical dashboard',
        description: 'Heatmaps, regional comparisons, conflict indicators and cross-border analysis — all OCHA-aligned and exportable.',
        icon: <BarChart3 className="w-12 h-12" />,
        color: 'from-primary to-secondary',
        features: ['Heatmap filters', 'Regional compare', 'Cross-border'],
        action: 'Open dashboard',
      },
      {
        title: 'Peace Pulse intelligence',
        description: 'SITREPs, 3W matrices, Flash Updates and a configurable escalation matrix — generate PDFs and CSVs in one click.',
        icon: <Gauge className="w-12 h-12" />,
        color: 'from-forest to-primary',
        features: ['SITREP / 3W', 'Flash updates', 'Structured exports'],
        action: 'Explore Peace Pulse',
      },
      {
        title: 'Election monitoring',
        description: 'Observer accreditation, AI OCR result capture, statistical PVT and blockchain audit trails for transparent elections.',
        icon: <Landmark className="w-12 h-12" />,
        color: 'from-gold to-earth',
        features: ['Accreditation', 'PVT statistics', 'Blockchain audit'],
        action: 'Got it',
      },
      {
        title: 'Integrations & API',
        description: 'Pull GeoJSON, CAP 1.2 alerts and JSON feeds into your own systems. Webhooks notify you the moment thresholds trigger.',
        icon: <Handshake className="w-12 h-12" />,
        color: 'from-primary to-gold',
        features: ['REST / GeoJSON', 'CAP 1.2', 'Webhooks'],
        action: 'Start working',
      },
    ],
  },
  government: {
    label: 'Government',
    steps: [
      welcomeStep('Government', 'A trusted channel between citizens and the state — respond, publish and demonstrate accountability in real time.'),
      {
        title: 'Government response queue',
        description: 'See proposals, citizen incidents and verified threats routed to your ministry. Respond officially and track your SLA.',
        icon: <Building2 className="w-12 h-12" />,
        color: 'from-primary to-secondary',
        features: ['Official replies', 'SLA tracking', 'Public ledger'],
        action: 'Open queue',
      },
      {
        title: 'Early warning & action',
        description: '50km proximity alerts, predictive hotspots and OCHA-aligned recommended actions — coordinate response before escalation.',
        icon: <AlertTriangle className="w-12 h-12" />,
        color: 'from-earth to-gold',
        features: ['Proximity alerts', 'Predictive hotspots', 'Recommended actions'],
        action: 'Understood',
      },
      {
        title: 'Publish & inform',
        description: 'Push verified bulletins to citizens via app, SMS and radio. Every publication is signed, timestamped and auditable.',
        icon: <Megaphone className="w-12 h-12" />,
        color: 'from-gold to-primary',
        features: ['Multi-channel', 'Signed bulletins', 'Audit log'],
        action: 'Got it',
      },
      {
        title: 'Accountability dashboard',
        description: 'Show your work. Response times, proposals enacted and incident resolution rates are visible to the citizens you serve.',
        icon: <BarChart3 className="w-12 h-12" />,
        color: 'from-forest to-primary',
        features: ['Response metrics', 'Public proposals', 'Resolution rate'],
        action: 'Start serving',
      },
    ],
  },
  admin: {
    label: 'Administrator',
    steps: [
      welcomeStep('Administrator', 'Platform-wide controls: roles, feature flags, integrations, AI governance, content moderation and security.'),
      {
        title: 'Roles & access',
        description: 'Manage granular roles (Citizen, Verifier, Partner, Government, Admin) and per-user feature visibility from one console.',
        icon: <UsersRound className="w-12 h-12" />,
        color: 'from-primary to-secondary',
        features: ['Granular roles', 'Feature toggles', 'Audit history'],
        action: 'Open admin',
      },
      {
        title: 'Integrations hub',
        description: 'API keys, webhooks, OCR, payment gateways and the news intelligence pipeline — all centrally managed.',
        icon: <Handshake className="w-12 h-12" />,
        color: 'from-primary to-gold',
        features: ['API keys', 'Webhooks', 'AI pipelines'],
        action: 'Got it',
      },
      {
        title: 'AI governance',
        description: 'NuruAI token caps, hallucination flagging, risk register and fact-check governance — keep the AI accountable.',
        icon: <Brain className="w-12 h-12" />,
        color: 'from-forest to-primary',
        features: ['Token caps', 'Risk register', 'Fact-check log'],
        action: 'Understood',
      },
      {
        title: 'Security & RLS',
        description: 'Every public table is RLS-enforced. Review security memory, masked views and JWT scopes before each release.',
        icon: <ShieldCheck className="w-12 h-12" />,
        color: 'from-forest to-primary',
        features: ['RLS enforced', 'Masked views', 'Security memory'],
        action: 'Start managing',
      },
    ],
  },
};

const pickRole = (roles: string[]): RoleKey => {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('government')) return 'government';
  if (roles.includes('partner')) return 'partner';
  if (roles.includes('verifier')) return 'verifier';
  return 'citizen';
};

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { data: profile } = useUserProfile();
  const { data: userRoles } = useUserRoles();

  const firstName = profile?.display_name?.split(' ')[0] || 'Friend';
  const roleKey = useMemo<RoleKey>(
    () => pickRole((userRoles || []).map((r: any) => r.role)),
    [userRoles]
  );
  const tour = tours[roleKey];
  const steps = tour.steps;
  const storageKey = `hasSeenOnboarding:${roleKey}`;

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      const t = setTimeout(() => {
        setCurrentStep(0);
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [storageKey]);

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setIsOpen(false);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep < steps.length - 1) setCurrentStep((p) => p + 1);
    else handleComplete();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleComplete();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full relative overflow-hidden border-2 shadow-2xl">
        <motion.div
          key={`bg-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          className={`absolute inset-0 bg-gradient-to-br ${step.color}`}
        />

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-20 hover:bg-destructive/10"
          onClick={handleSkip}
          type="button"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="absolute top-0 left-0 right-0 h-1 z-10">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>

        <CardHeader className="text-center pt-8 pb-4 relative z-10">
          <div className="mx-auto mb-3">
            <span className="pill pill-primary text-[10px] uppercase tracking-wider">
              {tour.label} tour
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`icon-${currentStep}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={`mx-auto w-24 h-24 rounded-2xl flex items-center justify-center mb-4 shadow-lg bg-gradient-to-br ${step.color} text-white`}
            >
              {step.icon}
            </motion.div>
          </AnimatePresence>

          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            {currentStep === 0 ? (
              <>
                <span>Hey {firstName}!</span>
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                >
                  👋
                </motion.span>
              </>
            ) : (
              <AnimatePresence mode="wait">
                <motion.span
                  key={`title-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {step.title}
                </motion.span>
              </AnimatePresence>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-6 relative z-10 px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`desc-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CardDescription className="text-base leading-relaxed text-muted-foreground">
                {step.description}
              </CardDescription>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap justify-center gap-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={`features-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap justify-center gap-2"
              >
                {step.features.map((feature, i) => (
                  <motion.span
                    key={`${currentStep}-${feature}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${step.color} text-white shadow-sm`}
                  >
                    {feature}
                  </motion.span>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 pt-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                type="button"
                aria-label={`Go to step ${index + 1}`}
                className={`h-2.5 rounded-full transition-all cursor-pointer hover:opacity-80 ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'w-2.5 bg-primary/50'
                    : 'w-2.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pb-6 px-6 relative z-20">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-2"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            type="button"
            className={`gap-2 bg-gradient-to-r ${step.color} hover:opacity-90 text-white shadow-lg`}
          >
            {step.action || (currentStep === steps.length - 1 ? 'Get Started' : 'Next')}
            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            {currentStep === steps.length - 1 && <Sparkles className="w-4 h-4" />}
          </Button>
        </CardFooter>

        <motion.div
          className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-gold/20 pointer-events-none"
          animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-primary/20 pointer-events-none"
          animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </Card>
    </div>
  );
}

export function resetOnboardingTours() {
  ['citizen', 'verifier', 'partner', 'government', 'admin'].forEach((r) =>
    localStorage.removeItem(`hasSeenOnboarding:${r}`)
  );
  localStorage.removeItem('hasSeenOnboarding');
}
