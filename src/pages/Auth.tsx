import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { Globe } from 'lucide-react';

const emailSchema = z.string().trim().email('Invalid email address').max(255);
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(100).regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  'Password must contain at least one uppercase letter, one lowercase letter, and one number'
);

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && !user.is_anonymous) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Sign Up Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: 'Account created successfully. You can now sign in.',
      });
      setIsSignUp(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Sign In Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome Back!',
        description: 'You have successfully signed in.',
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10">
          <Globe className="w-full h-full animate-spin-slow text-primary-foreground" style={{ animationDuration: '60s' }} />
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <img src="/src/assets/peaceverse-logo.png" alt="Peaceverse Logo" className="h-12 w-12" />
          <span className="text-2xl font-bold text-primary-foreground">Peaceverse</span>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-light tracking-wider text-primary-foreground mb-6">
            Peaceverse
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 tracking-wide font-light">
            Observation. Prediction. Prevention.
          </p>
        </div>

        {/* Login form */}
        <div className="w-full max-w-md bg-muted/40 backdrop-blur-lg rounded-lg border border-primary-foreground/20 p-8">
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-background/50 border-primary-foreground/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-background/50 border-primary-foreground/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-primary font-semibold text-lg transition-all duration-300"
            >
              {isLoading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Enter'}
            </Button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
