import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, X, Users, Map, Award, Shield, Globe, Heart, User, LogOut, Settings, Search, HelpCircle, AlertTriangle, Plug, Sparkles } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
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
  const publicNavItems = [{
    path: '/about',
    label: t('nav.about'),
    icon: Heart
  }, {
    path: '/community',
    label: t('nav.community'),
    icon: Users
  }, {
    path: '/incidents',
    label: t('nav.incidents'),
    icon: Shield
  }, {
    path: '/peace-pulse',
    label: t('nav.peacePulse'),
    icon: Globe
  }, {
    path: '/proposals',
    label: t('nav.pollsProposals'),
    icon: Map
  }, {
    path: '/safety',
    label: t('nav.safetyPortal'),
    icon: Shield
  }];
  const roleBasedItems = [];
  if (user && !isAnonymous) {
    roleBasedItems.push({
      path: '/dashboard',
      label: t('nav.dashboard'),
      icon: User
    });
  }
  if (roleStrings.includes('verifier') || roleStrings.includes('admin') || roleStrings.includes('government')) {
    roleBasedItems.push({
      path: '/verification',
      label: t('nav.verification'),
      icon: Award
    });
  }
  if (roleStrings.includes('admin') || roleStrings.includes('government') || roleStrings.includes('partner')) {
    roleBasedItems.push({
      path: '/early-warning',
      label: t('nav.earlyWarning'),
      icon: AlertTriangle
    });
    roleBasedItems.push({
      path: '/integrations',
      label: 'Integrations',
      icon: Plug
    });
  }
  const navItems = [...publicNavItems, ...roleBasedItems].sort((a, b) => a.label.localeCompare(b.label));
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
    }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-card/95 backdrop-blur-xl border-b border-gold/20 shadow-warm' : 'bg-transparent'}`}>
        {/* Gold accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group relative">
              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} className="relative">
                <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src={peaceverselogo} alt="PeaceVerse Logo" className="h-10 sm:h-12 w-auto relative z-10" />
              </motion.div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-primary">Peace</span>
                <span className="text-lg font-bold text-gold">Verse</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center flex-1 justify-center">
              <div className="flex items-center gap-1">
                {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return <motion.div key={item.path} initial={{
                  opacity: 0,
                  y: -20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: index * 0.05
                }}>
                      <Link to={item.path}>
                        <Button variant="ghost" size="sm" className={`relative flex items-center gap-1.5 px-3 py-2 h-9 rounded-lg transition-all duration-300 group overflow-hidden ${isActive ? 'text-primary bg-primary/10' : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'}`}>
                          {/* Active indicator */}
                          {isActive && <motion.div layoutId="navIndicator" className="absolute inset-0 bg-gradient-to-r from-primary/15 via-gold/10 to-secondary/15 rounded-lg" transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6
                      }} />}
                          <Icon className={`w-4 h-4 relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-gold/70 group-hover:text-gold'}`} />
                          <span className="font-medium text-xs relative z-10 hidden xl:inline">{item.label}</span>
                          
                          {/* Hover underline */}
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gold group-hover:w-3/4 transition-all duration-300" />
                        </Button>
                      </Link>
                    </motion.div>;
              })}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button */}
              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                
              </motion.div>

              <NotificationCenter />
              
              <Button variant="ghost" size="sm" onClick={() => navigate('/help')} className="hidden xl:flex h-9 w-9 p-0 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted/50">
                <HelpCircle className="w-4 h-4" />
              </Button>
              
              <div className="hidden sm:block">
                <LanguageToggle />
              </div>
              
              {/* Authentication Section */}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border/30">
                {isLoading ? <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  </div> : user ? <>
                    {isAdmin && <motion.div whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.95
                }}>
                        <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="hidden xl:flex items-center gap-2 h-9 px-4 rounded-lg bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/50 text-primary transition-all">
                          <Settings className="w-4 h-4" />
                          <span className="font-semibold text-xs">Admin</span>
                        </Button>
                      </motion.div>}
                    
                    <motion.div whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.95
                }}>
                      <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-2 h-9 px-3 rounded-lg bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground transition-all">
                        <LogOut className="w-4 h-4" />
                        <span className="hidden lg:inline text-xs font-medium">Sign Out</span>
                      </Button>
                    </motion.div>
                  </> : <motion.div whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                    <Button size="sm" onClick={() => navigate('/auth')} className="relative flex items-center gap-2 h-9 px-4 rounded-lg overflow-hidden group bg-primary hover:bg-primary-dark text-primary-foreground shadow-peace">
                      <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Sparkles className="w-4 h-4 relative z-10" />
                      <span className="font-semibold text-xs relative z-10">Sign In</span>
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
                <SheetContent side="right" className="w-[85vw] max-w-sm bg-card/98 backdrop-blur-xl border-l border-gold/20 z-[60]">
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
                    {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return <motion.div key={item.path} initial={{
                      opacity: 0,
                      x: 20
                    }} animate={{
                      opacity: 1,
                      x: 0
                    }} transition={{
                      delay: index * 0.05
                    }}>
                          <SheetClose asChild>
                            <Button variant="ghost" asChild className={`w-full justify-start gap-3 h-12 rounded-lg text-left ${isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'}`}>
                              <Link to={item.path}>
                                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gold/70'}`} />
                                <span className="font-medium">{item.label}</span>
                              </Link>
                            </Button>
                          </SheetClose>
                        </motion.div>;
                  })}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border/30 space-y-4">
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
                              <Settings className="w-4 h-4" />
                              Admin Portal
                            </Button>
                          </SheetClose>}
                        
                        <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-2 h-11 rounded-lg bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground">
                          <LogOut className="w-4 h-4" />
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