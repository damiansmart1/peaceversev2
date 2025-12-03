import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Sparkles, Mic, Users, Trophy, Shield, Globe, Heart, Zap, Target, MessageCircle } from 'lucide-react';
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
    description: 'Your gateway to building peace, sharing stories, and making a real impact across Africa. Ready to be part of something amazing?',
    icon: <Globe className="w-12 h-12" />,
    color: 'from-primary to-primary/60',
    features: ['Connect with peacebuilders', 'Share your voice', 'Make a difference'],
    action: "Let's explore!"
  },
  {
    title: 'Your Voice Matters 🎙️',
    description: 'Record voice stories, write posts, share videos - your perspective is unique and valuable. Be heard by thousands!',
    icon: <Mic className="w-12 h-12" />,
    color: 'from-gold to-gold/60',
    features: ['Voice recordings', 'Photo & video posts', 'Written stories'],
    action: 'Express yourself'
  },
  {
    title: 'Join the Community 🤝',
    description: 'Connect with like-minded people in chatrooms, follow inspiring creators, and find safe spaces near you.',
    icon: <Users className="w-12 h-12" />,
    color: 'from-forest to-forest/60',
    features: ['Topic-based chatrooms', 'Direct messaging', 'Safe spaces map'],
    action: 'Find your tribe'
  },
  {
    title: 'Earn While You Impact 💰',
    description: 'Create content, receive tips from fans, and grow your earnings. Turn your passion into rewards!',
    icon: <Zap className="w-12 h-12" />,
    color: 'from-earth to-earth/60',
    features: ['Receive tips in your currency', 'Withdraw to Paystack/M-Pesa', 'Track your earnings'],
    action: 'Start earning'
  },
  {
    title: 'Level Up & Win 🏆',
    description: 'Complete challenges, earn Peace Points, unlock badges, and climb the leaderboard. Every action counts!',
    icon: <Trophy className="w-12 h-12" />,
    color: 'from-accent to-accent/60',
    features: ['Daily & weekly challenges', 'Exclusive rewards', 'Leaderboard rankings'],
    action: 'Accept the challenge'
  },
  {
    title: 'Stay Safe & Protected 🛡️',
    description: 'AI-powered moderation, anonymous reporting, and community guidelines ensure everyone feels welcome and secure.',
    icon: <Shield className="w-12 h-12" />,
    color: 'from-primary to-secondary',
    features: ['Anonymous reporting', '24/7 AI moderation', 'Safe spaces network'],
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/98 backdrop-blur-lg z-50 flex items-center justify-center p-4"
      >
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Card className="max-w-lg w-full relative overflow-hidden border-2 shadow-2xl">
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-10`} />
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 hover:bg-destructive/10"
              onClick={handleSkip}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1">
              <Progress value={progress} className="h-1 rounded-none" />
            </div>

            <CardHeader className="text-center pt-8 pb-4 relative">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className={`mx-auto w-24 h-24 rounded-2xl flex items-center justify-center mb-4 shadow-lg bg-gradient-to-br ${step.color} text-white`}
              >
                {step.icon}
              </motion.div>
              
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
                  step.title
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="text-center space-y-6 relative px-8">
              <CardDescription className="text-base leading-relaxed text-muted-foreground">
                {step.description}
              </CardDescription>

              {/* Feature pills */}
              <motion.div 
                className="flex flex-wrap justify-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {step.features.map((feature, i) => (
                  <motion.span
                    key={feature}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${step.color} text-white shadow-sm`}
                  >
                    {feature}
                  </motion.span>
                ))}
              </motion.div>

              {/* Step indicators */}
              <div className="flex justify-center gap-2 pt-4">
                {steps.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
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

            <CardFooter className="flex justify-between pb-6 px-6">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleNext} 
                  className={`gap-2 bg-gradient-to-r ${step.color} hover:opacity-90 text-white shadow-lg`}
                >
                  {step.action || (currentStep === steps.length - 1 ? "Get Started" : "Next")}
                  {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                  {currentStep === steps.length - 1 && <Sparkles className="w-4 h-4" />}
                </Button>
              </motion.div>
            </CardFooter>

            {/* Fun floating elements */}
            <motion.div
              className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-gold/20"
              animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-primary/20"
              animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
