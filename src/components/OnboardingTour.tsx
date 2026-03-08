import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Sparkles, Mic2, UsersRound, Trophy, ShieldCheck, Globe2, Radio, Vote, AlertTriangle, Brain, BarChart3, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Progress } from '@/components/ui/progress';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  action?: string;
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to PeaceVerse! 🎉',
    description: 'Africa\'s premier civic intelligence and peacebuilding platform — powered by AI, built for accountability, and designed for every citizen.',
    icon: <Globe2 className="w-12 h-12" />,
    color: 'from-primary to-primary/60',
    features: ['10+ integrated modules', 'AI-powered insights', 'Pan-African coverage'],
    action: "Let's explore!"
  },
  {
    title: 'NuruAI Civic Intelligence 🧠',
    description: 'Upload government budgets, legislation, and policy documents. Ask questions in plain language and get AI-verified, evidence-based answers with source citations.',
    icon: <Brain className="w-12 h-12" />,
    color: 'from-primary to-secondary',
    features: ['Document Q&A', 'Fact-checking (IFCN standard)', 'Policy comparison', 'Constitutional cross-reference'],
    action: 'Explore NuruAI'
  },
  {
    title: 'Community Hub & Social Network 🤝',
    description: 'Connect with peacebuilders, join chatrooms, share stories, follow creators, and send direct messages. Your voice matters — amplify it!',
    icon: <UsersRound className="w-12 h-12" />,
    color: 'from-forest to-forest/60',
    features: ['Social feed & profiles', 'Topic-based chatrooms', 'Voice & video stories', 'Direct messaging'],
    action: 'Join the community'
  },
  {
    title: 'Incident Reporting & Early Warning ⚠️',
    description: 'Report incidents anonymously, track verification status in real-time, and access AI-powered risk analysis with predictive hotspot mapping.',
    icon: <AlertTriangle className="w-12 h-12" />,
    color: 'from-earth to-earth/60',
    features: ['Anonymous reporting', 'AI threat analysis', 'Predictive hotspots', 'Real-time tracking'],
    action: 'Stay informed'
  },
  {
    title: 'Polls, Proposals & Democracy 🗳️',
    description: 'Create and vote on community proposals, participate in polls, and drive real policy change through structured democratic engagement.',
    icon: <Vote className="w-12 h-12" />,
    color: 'from-gold to-gold/60',
    features: ['Community proposals', 'Live polls', 'Voting & comments', 'Impact tracking'],
    action: 'Have your say'
  },
  {
    title: 'Election Monitoring & PeacePulse 📊',
    description: 'Monitor elections with observer accreditation, real-time dashboards, and statistical anomaly detection. Track peace indices across the continent with PeacePulse.',
    icon: <Landmark className="w-12 h-12" />,
    color: 'from-primary to-forest',
    features: ['Observer accreditation', 'Result collation', 'Peace index tracking', 'Cross-border analysis'],
    action: 'Monitor & track'
  },
  {
    title: 'Peace Radio & Challenges 📻',
    description: 'Tune into live peace radio streams, explore the podcast library, and complete weekly peacebuilding challenges to earn points and climb the leaderboard.',
    icon: <Radio className="w-12 h-12" />,
    color: 'from-accent to-accent/60',
    features: ['Live radio streams', 'Podcast library', 'Weekly challenges', 'Leaderboard & rewards'],
    action: 'Tune in & compete'
  },
  {
    title: 'Safety & Verification 🛡️',
    description: 'Access safety resources, emergency contacts, and safe spaces. Our multi-layered verification system ensures information integrity with AI-assisted analysis.',
    icon: <ShieldCheck className="w-12 h-12" />,
    color: 'from-forest to-primary',
    features: ['Safety resource library', 'Emergency contacts', 'AI-assisted verification', 'Source credibility scoring'],
    action: "I'm ready!"
  },
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { data: profile } = useUserProfile();

  const firstName = profile?.display_name?.split(' ')[0] || 'Friend';

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsOpen(false);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleComplete();
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full relative overflow-hidden border-2 shadow-2xl">
        {/* Animated background gradient */}
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

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 z-10">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>

        <CardHeader className="text-center pt-8 pb-4 relative z-10">
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

          {/* Feature pills */}
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

          {/* Step indicators */}
          <div className="flex justify-center gap-2 pt-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                type="button"
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
            {step.action || (currentStep === steps.length - 1 ? "Get Started" : "Next")}
            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            {currentStep === steps.length - 1 && <Sparkles className="w-4 h-4" />}
          </Button>
        </CardFooter>

        {/* Fun floating elements */}
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
