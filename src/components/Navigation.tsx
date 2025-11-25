import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, X, Mic, Users, Radio, Map, Award, Shield, Globe, User, LogOut, Settings, Search, HelpCircle } from "lucide-react";
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

const Navigation = () => {
  const { t } = useTranslationContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAnonymous, isLoading } = useAuth();
  const { toast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: isAdmin } = useAdminCheck();
  const { data: userProfile } = useUserProfile();
  const safeProfile: any = userProfile as any;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });
    navigate('/');
  };
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Base navigation items (alphabetically ordered)
  const baseNavItems = [
    { path: '/about', label: 'About', icon: Heart },
    { path: '/community', label: t('nav.community'), icon: Users },
    { path: '/incidents', label: 'Incident Reporting', icon: Shield },
    { path: '/peace-pulse', label: 'PeacePulse', icon: Globe },
    { path: '/proposals', label: 'Polls & Proposals', icon: Map },
    { path: '/safety', label: 'Safety Portal', icon: Shield },
    { path: '/verification', label: 'Verification', icon: Award },
  ];

  // Add profile only if user is logged in
  const navItems = user && !isAnonymous
    ? [...baseNavItems, { path: '/dashboard', label: 'Dashboard', icon: User }].sort((a, b) => a.label.localeCompare(b.label))
    : baseNavItems;

  return (
    <>
      <KeyboardShortcuts onSearchOpen={() => setSearchOpen(true)} />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <img 
              src={peaceverselogo} 
              alt="PeaceVerse Logo" 
              className="h-10 sm:h-12 w-auto"
            />
            <Badge variant="secondary" className="text-xs hidden lg:inline-flex">
              v2.0
            </Badge>
          </Link>

          {/* Desktop Navigation - Scrollable horizontal layout */}
          <div className="hidden lg:flex items-center overflow-x-auto max-w-xl xl:max-w-3xl scrollbar-hide">
            <div className="flex items-center space-x-1 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    asChild
                    className={`flex items-center space-x-1.5 transition-all duration-200 whitespace-nowrap flex-shrink-0 text-xs xl:text-sm px-2 xl:px-3 ${
                      isActive 
                        ? 'text-primary bg-primary/10 font-medium' 
                        : 'text-foreground hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    <Link to={item.path}>
                      <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="gap-2 hidden xl:flex"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs text-muted-foreground">⌘K</span>
            </Button>
            <NotificationCenter />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/help')}
              className="gap-2 hidden xl:flex"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>
            
            {/* Authentication Section */}
            <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2 pl-1 sm:pl-2 border-l border-border">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : user ? (
                <>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/admin')}
                      className="gap-1.5 bg-primary/10 hover:bg-primary/20 border-primary/30 hidden xl:flex text-xs"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="gap-1.5 text-xs sm:text-sm h-8 px-2 sm:px-3"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="gap-1.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold text-xs sm:text-sm h-8 px-2 sm:px-3"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">Sign In</span>
                </Button>
              )}
            </div>
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden h-8 w-8 p-0">
                  <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm bg-background z-[60]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <img 
                      src={peaceverselogo} 
                      alt="PeaceVerse Logo" 
                      className="h-8 w-auto"
                    />
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </SheetClose>
                </div>
                
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <SheetClose key={item.path} asChild>
                        <Button
                          variant="ghost"
                          asChild
                          className={`w-full justify-start gap-3 h-12 text-left text-sm ${
                            isActive ? 'bg-primary/10 text-primary font-medium' : ''
                          }`}
                        >
                          <Link to={item.path}>
                            <Icon className="w-4.5 h-4.5" />
                            <span>{item.label}</span>
                          </Link>
                        </Button>
                      </SheetClose>
                    );
                  })}
                </div>
                
                 <div className="mt-6 pt-6 border-t border-border space-y-3">
                   <div className="flex items-center justify-between px-1 py-2">
                     <span className="text-sm font-medium">Language</span>
                     <LanguageToggle />
                   </div>
                   
                   {isLoading ? (
                     <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
                       <div className="w-4.5 h-4.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                       <span className="text-sm">Loading...</span>
                     </div>
                   ) : user ? (
                    <>
                      {/* User Welcome Section */}
                      <div className="px-3 py-2.5 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {isAnonymous ? 'Guest User' : `Welcome, ${safeProfile?.display_name || safeProfile?.username || 'User'}!`}
                        </p>
                        {!isAnonymous && safeProfile?.user_type && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {safeProfile.user_type}
                          </p>
                        )}
                      </div>
                      
                      {isAdmin && (
                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            onClick={() => navigate('/admin')}
                            className="w-full justify-start gap-2 bg-primary/10 border-primary/30 h-11 text-sm"
                          >
                            <Settings className="w-4 h-4" />
                            Admin Portal
                          </Button>
                        </SheetClose>
                      )}
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start gap-2 h-11 text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        {isAnonymous ? 'Sign Out (Guest)' : 'Sign Out'}
                      </Button>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Button
                        variant="default"
                        onClick={() => navigate('/auth')}
                        className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 font-semibold h-11"
                      >
                        <User className="w-4 h-4" />
                        Sign In
                      </Button>
                     </SheetClose>
                   )}
                 </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navigation;