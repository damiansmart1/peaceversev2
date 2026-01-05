import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslationContext } from '@/components/TranslationProvider';
import { z } from 'zod';
import { Globe, UserX, Eye, EyeOff, User } from 'lucide-react';
import peaceLogo from '@/assets/peaceverse-logo.png';

const emailSchema = z.string().trim().email('Invalid email address').max(255);
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export default function Auth() {
  const { t } = useTranslationContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
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
      nameSchema.parse(firstName);
      if (lastName) nameSchema.parse(lastName);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('auth.validationError'),
          description: error.errors[0].message,
          variant: 'destructive'
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
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          display_name: `${firstName.trim()} ${lastName.trim()}`.trim()
        }
      }
    });
    setIsLoading(false);
    if (error) {
      toast({
        title: t('auth.signUpFailed'),
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('auth.success'),
        description: t('auth.accountCreated')
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
          title: t('auth.validationError'),
          description: error.errors[0].message,
          variant: 'destructive'
        });
        return;
      }
    }
    setIsLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setIsLoading(false);
    if (error) {
      toast({
        title: t('auth.signInFailed'),
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('auth.welcomeBack'),
        description: t('auth.signedIn')
      });
      navigate('/dashboard');
    }
  };
  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    const {
      error
    } = await supabase.auth.signInAnonymously();
    setIsLoading(false);
    if (error) {
      toast({
        title: t('auth.signInFailed'),
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('auth.welcomeGuest'),
        description: t('auth.guestSignedIn')
      });
      navigate('/dashboard');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('auth.validationError'),
          description: error.errors[0].message,
          variant: 'destructive'
        });
        return;
      }
    }
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`
    });
    setIsLoading(false);
    if (error) {
      toast({
        title: t('auth.resetFailed'),
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('auth.resetEmailSent'),
        description: t('auth.checkEmail')
      });
      setIsForgotPassword(false);
    }
  };

  return <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10">
          <Globe className="w-full h-full animate-spin-slow text-primary-foreground" style={{
          animationDuration: '60s'
        }} />
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <img src={peaceLogo} alt="Peaceverse Logo" className="h-12 w-12" />
          <span className="text-2xl font-bold text-primary-foreground">Peaceverse</span>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl tracking-wider mb-6 text-[#e1ad40] font-serif font-bold">PeaceVerse</h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 tracking-wide font-light">
            {t('auth.tagline')}
          </p>
        </div>

        {/* Login form */}
        <div className="w-full max-w-md bg-muted/40 backdrop-blur-lg rounded-lg border border-primary-foreground/20 p-8">
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-primary-foreground">{t('auth.resetPassword')}</h2>
                <p className="text-sm text-primary-foreground/70 mt-2">{t('auth.resetInstructions')}</p>
              </div>
              
              <div className="space-y-2">
                <Input type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required className="h-12 bg-background/50 border-primary-foreground/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary" />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-primary font-semibold text-lg transition-all duration-300">
                {isLoading ? t('auth.pleaseWait') : t('auth.sendResetLink')}
              </Button>

              <div className="text-center pt-4">
                <button type="button" onClick={() => setIsForgotPassword(false)} className="text-sm transition-colors text-[#0c3f75]">
                  {t('auth.backToLogin')}
                </button>
              </div>
            </form>
          ) : (
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Input 
                      type="text" 
                      placeholder={t('auth.firstName')} 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      required 
                      className="h-12 bg-background/50 border-primary-foreground/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Input 
                      type="text" 
                      placeholder={t('auth.lastName')} 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      className="h-12 bg-background/50 border-primary-foreground/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary" 
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Input type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required className="h-12 bg-background/50 border-primary-foreground/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary" />
              </div>
              
              <div className="space-y-2 relative">
                <Input type={showPassword ? "text" : "password"} placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} required className="h-12 bg-background/50 border-primary-foreground/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary pr-12" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {!isSignUp && (
                <div className="text-right">
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="text-sm text-[#0c3f75] hover:underline">
                    {t('auth.forgotPassword')}
                  </button>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-primary font-semibold text-lg transition-all duration-300">
                {isLoading ? t('auth.pleaseWait') : isSignUp ? t('auth.signUp') : t('auth.enter')}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary-foreground/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-muted/40 px-2 text-primary-foreground/60">{t('auth.or')}</span>
                </div>
              </div>

              <Button type="button" variant="outline" disabled={isLoading} onClick={handleAnonymousSignIn} className="w-full h-12 border-primary-foreground/30 font-medium transition-all duration-300 text-[#125298] bg-[#e6ae47]">
                <UserX className="w-5 h-5 mr-2" />
                {t('auth.continueAsGuest')}
              </Button>

              <p className="text-xs text-center mt-2 text-[#0f4681]">
                {t('auth.guestPrivacyNote')}
              </p>

              <div className="text-center pt-4">
                <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm transition-colors text-[#0c3f75]">
                  {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>;
}