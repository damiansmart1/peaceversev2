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
  const hadUser = useRef(false);

  useEffect(() => {
    // Sign-in expiry is kept on the device's own clock (see clockSafeAuth), so no date/time checks here.
    const lifecycle = createAuthLifecycle<Session>((nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      hadUser.current = !!nextSession?.user && !nextSession.user.is_anonymous;
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
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
