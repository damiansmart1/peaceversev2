import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, X, CircleUserRound, Power, Bolt, Info, CircleHelp, Sparkles } from "lucide-react";
import HubMenu from "@/components/nav/HubMenu";
import HubMobileList from "@/components/nav/HubMobileList";
import { HUBS } from "@/lib/hubs";
import peaceverselogo from "@/assets/peaceverse-logo.png";
import GlobalSearch from '@/components/GlobalSearch';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import NotificationCenter from '@/components/NotificationCenter';
import { useTranslationContext } from "@/components/TranslationProvider";
import LanguageToggle from "@/components/LanguageToggle";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserRoles } from "@/hooks/useRoleCheck";
import { useAccessibleFeatures, PLATFORM_FEATURES } from "@/hooks/useRoleFeatureAccess";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
const Navigation = () => {
  const {
    t
  } = useTranslationContext();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    isAnonymous,
    isLoading
  } = useAuth();
  const {
    toast
  } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const {
    data: isAdmin
  } = useAdminCheck();
  const {
    data: userProfile
  } = useUserProfile();
  const {
    data: userRoles
  } = useUserRoles();
  const safeProfile: any = userProfile as any;
  const roleStrings = userRoles?.map((r: any) => r.role) || [];
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: t('auth.signedOut'),
      description: t('auth.signedOutDesc')
    });
    navigate('/');
  };
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // 4-hub simplified navigation. All previous routes remain available
  // inside their hub dropdown — nothing was deleted.
  return <>
      <KeyboardShortcuts onSearchOpen={() => setSearchOpen(true)} />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      
      <motion.nav initial={{
      y: -100
    }} animate={{
      y: 0
    }} transition={{
      duration: 0.5,
      ease: "easeOut"
    }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-card/95 backdrop-blur-xl border-b border-border/60 shadow-sm' : 'bg-transparent'}`}>
        {/* Gold accent line - desktop only to reduce mobile visual noise */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent hidden lg:block" />
        
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group relative">
              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} className="relative">
                <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden sm:block" />
                <img src={peaceverselogo} alt="PeaceVerse Logo" className="h-8 sm:h-12 w-auto relative z-10" />
              </motion.div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-primary">Peace</span>
                <span className="text-lg font-bold text-gold">Verse</span>
              </div>
            </Link>

            {/* Desktop Navigation — 4 hubs + About + Dashboard */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-2">
              <div className="flex items-center gap-1">
                {HUBS.map((hub) => (
                  <HubMenu
                    key={hub.key}
                    hub={hub}
                    isActive={location.pathname === hub.primaryPath}
                  />
                ))}
                <Link to="/about">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-md text-sm font-medium ${location.pathname === '/about' ? 'text-primary bg-primary/10' : 'text-foreground/80 hover:text-foreground hover:bg-muted/50'}`}
                  >
                    <Info className="w-4 h-4" />
                    About
                  </Button>
                </Link>
                {user && !isAnonymous && (
                  <Link to="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-md text-sm font-medium ${location.pathname === '/dashboard' ? 'text-primary bg-primary/10' : 'text-foreground/80 hover:text-foreground hover:bg-muted/50'}`}
                    >
                      <CircleUserRound className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <NotificationCenter />
              
              <Button variant="ghost" size="sm" onClick={() => navigate('/help')} className="hidden xl:flex h-8 w-8 p-0 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted/50">
                <CircleHelp className="w-4 h-4" />
              </Button>
              
              <ThemeToggle />
              
              <div className="hidden md:block">
                <LanguageToggle />
              </div>
              
              {/* Authentication Section */}
              <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2 pl-1 sm:pl-2 border-l border-border/30">
                {isLoading ? <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  </div> : user ? <>
                    {isAdmin && <motion.div whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.95
                }}>
                        <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="hidden xl:flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/50 text-primary transition-all">
                          <Bolt className="w-3.5 h-3.5" />
                          <span className="font-semibold text-xs">Admin</span>
                        </Button>
                      </motion.div>}
                    
                    <motion.div whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.95
                }}>
                      <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 rounded-lg bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground transition-all">
                        <Power className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs font-medium whitespace-nowrap">Sign Out</span>
                      </Button>
                    </motion.div>
                  </> : <motion.div whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                    <Button size="sm" onClick={() => navigate('/auth')} className="relative flex items-center gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 rounded-lg overflow-hidden group bg-primary hover:bg-primary-dark text-primary-foreground shadow-peace">
                      <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Sparkles className="w-3.5 h-3.5 relative z-10 flex-shrink-0" />
                      <span className="font-semibold text-xs relative z-10 whitespace-nowrap">Sign In</span>
                    </Button>
                  </motion.div>}
              </div>
              
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden h-9 w-9 p-0 rounded-lg hover:bg-muted/50">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[88vw] max-w-sm bg-card/98 backdrop-blur-xl border-l border-border/60 z-[60] overflow-y-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <img src={peaceverselogo} alt="PeaceVerse Logo" className="h-8 w-auto" />
                      <div>
                        <span className="text-lg font-bold text-primary">Peace</span>
                        <span className="text-lg font-bold text-gold">Verse</span>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                        <X className="w-4 h-4" />
                      </Button>
                    </SheetClose>
                  </div>
                  
                  <div className="space-y-1">
                    <SheetClose asChild>
                      <Link to="/about" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:bg-muted/50">
                        <Info className="w-5 h-5 text-gold/70" />
                        About
                      </Link>
                    </SheetClose>
                    {user && !isAnonymous && (
                      <SheetClose asChild>
                        <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:bg-muted/50">
                          <CircleUserRound className="w-5 h-5 text-gold/70" />
                          My Dashboard
                        </Link>
                      </SheetClose>
                    )}
                    <div className="pt-2">
                      <SheetClose asChild>
                        <div>
                          <HubMobileList />
                        </div>
                      </SheetClose>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border/30 space-y-4">
                    <div className="flex items-center justify-between px-1 py-2">
                      <span className="text-sm font-medium text-foreground/70">Theme</span>
                      <ThemeToggle />
                    </div>
                    <div className="flex items-center justify-between px-1 py-2">
                      <span className="text-sm font-medium text-foreground/70">Language</span>
                      <LanguageToggle />
                    </div>
                    
                    {isLoading ? <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
                        <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div> : user ? <>
                        <div className="px-3 py-3 bg-muted/50 rounded-xl border border-border/50">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {isAnonymous ? 'Guest User' : `Welcome, ${safeProfile?.display_name || safeProfile?.username || 'User'}!`}
                          </p>
                          {!isAnonymous && safeProfile?.user_type && <p className="text-xs text-muted-foreground mt-1 truncate">
                              {safeProfile.user_type}
                            </p>}
                        </div>
                        
                        {isAdmin && <SheetClose asChild>
                            <Button variant="outline" onClick={() => navigate('/admin')} className="w-full justify-start gap-2 h-11 rounded-lg bg-primary/10 border-primary/30">
                              <Bolt className="w-4 h-4" />
                              Admin Portal
                            </Button>
                          </SheetClose>}
                        
                        <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-2 h-11 rounded-lg bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground">
                          <Power className="w-4 h-4" />
                          {isAnonymous ? 'Sign Out (Guest)' : 'Sign Out'}
                        </Button>
                      </> : <SheetClose asChild>
                        <Button onClick={() => navigate('/auth')} className="w-full gap-2 h-11 rounded-lg font-semibold bg-primary hover:bg-primary-dark text-primary-foreground">
                          <Sparkles className="w-4 h-4" />
                          Sign In
                        </Button>
                      </SheetClose>}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>
    </>;
};
export default Navigation;