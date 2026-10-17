import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslationContext } from '@/components/TranslationProvider';
import { clockSkewSeconds, correctStoredExpiry, isRefreshStorm } from '@/lib/authHealth';
import { createAuthLifecycle } from '@/lib/authLifecycle';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAnonymous: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAnonymous: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslationContext();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimes = useRef<number[]>([]);
  const warnedClock = useRef(false);
  const hadUser = useRef(false);

  useEffect(() => {
    const warnClock = () => {
      if (warnedClock.current) return;
      warnedClock.current = true;
      toast.error(t('participation.clockTitle'), { description: t('participation.clockBody'), duration: 15000 });
    };

    const lifecycle = createAuthLifecycle<Session>((nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      hadUser.current = !!nextSession?.user && !nextSession.user.is_anonymous;
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // A freshly issued token carries the server's time; a large gap means the device clock is wrong,
        // which makes sign-ins expire instantly and refresh in a loop until the account is rate-limited.
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.access_token) {
          const skew = clockSkewSeconds(session.access_token, Date.now());
          if (skew !== null && Math.abs(skew) > 300) warnClock();
          // Adjust in-memory expiry immediately; never await storage while auth holds its lock.
          if (skew !== null && Math.abs(skew) > 60) void correctStoredExpiry(supabase.auth, session, Date.now());
        }
        if (event === 'TOKEN_REFRESHED') {
          const now = Date.now();
          refreshTimes.current = [...refreshTimes.current.filter(x => now - x < 60000), now];
          if (isRefreshStorm(refreshTimes.current, now)) warnClock();
        }
        if (event === 'SIGNED_OUT' && hadUser.current) {
          toast(t('participation.signedOutTitle'), { description: t('participation.signedOutBody') });
        }
        lifecycle.event(session);
      }
    );

    supabase.auth.getSession()
      .then(({ data }) => lifecycle.initial(data.session))
      .catch(() => lifecycle.initial(null));

    return () => {
      lifecycle.dispose();
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAnonymous = user?.is_anonymous ?? false;

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAnonymous }}>
      {children}
    </AuthContext.Provider>
  );
};
