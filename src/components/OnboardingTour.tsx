import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingStep {
  title: string;
  description: string;
  illustration: string;
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to PeaceVerse',
    description: 'A safe space for youth to share stories, build peace, and create positive change together.',
    illustration: '🌍',
  },
  {
    title: 'Share Your Voice',
    description: 'Record voice stories, participate in discussions, and contribute to meaningful dialogue.',
    illustration: '🎙️',
  },
  {
    title: 'Join the Community',
    description: 'Connect with others, find safe spaces, and be part of peacebuilding initiatives.',
    illustration: '🤝',
  },
  {
    title: 'Earn & Grow',
    description: 'Complete challenges, earn points, level up, and unlock rewards as you make an impact.',
    illustration: '⭐',
  },
  {
    title: 'Stay Safe',
    description: 'Our AI-powered moderation and community guidelines ensure a safe, respectful environment.',
    illustration: '🛡️',
  },
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <Card className="max-w-lg w-full relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={handleSkip}
          >
            <X className="w-4 h-4" />
          </Button>

          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg">
              {step.illustration}
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {step.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <CardDescription className="text-base leading-relaxed">
              {step.description}
            </CardDescription>

            <div className="flex justify-center gap-2 pt-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button onClick={handleNext} className="gap-2">
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
