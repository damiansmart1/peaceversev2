import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, X, Mic, Users, Radio, Map, Award, Shield, Globe, Heart, User, LogOut, Settings, Search, HelpCircle } from "lucide-react";
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

const Navigation = () => {
  const { t } = useTranslationContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAnonymous } = useAuth();
  const { toast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: isAdmin } = useAdminCheck();

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

  const navItems = [
    { path: '/voice', label: t('nav.voice'), icon: Mic },
    { path: '/community', label: t('nav.community'), icon: Users },
    { path: '/radio', label: t('nav.radio'), icon: Radio },
    { path: '/challenges', label: t('nav.challenges'), icon: Award },
    { path: '/peace-pulse', label: 'PeacePulse', icon: Globe },
    { path: '/incidents', label: 'Incidents', icon: Shield },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/proposals', label: 'Proposals', icon: Map },
    { path: '/safety', label: t('nav.safety'), icon: Shield },
    { path: '/about', label: 'About', icon: Heart },
  ];

  return (
    <>
      <KeyboardShortcuts onSearchOpen={() => setSearchOpen(true)} />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-peace-gradient rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl bg-peace-gradient bg-clip-text text-transparent">
              {t('hero.title')}
            </span>
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
              v2.0
            </Badge>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={`flex items-center space-x-1 transition-all duration-200 ${
                    isActive 
                      ? 'text-primary bg-primary/10 font-medium' 
                      : 'text-foreground hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  <Link to={item.path}>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              );
            })}
            
            {/* Authentication Section */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
              {user ? (
                <>
                  {isAnonymous && (
                    <span className="text-xs text-muted-foreground">Guest</span>
                  )}
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/admin')}
                      className="gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Admin
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="gap-2"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="gap-2 hidden md:flex"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs text-muted-foreground">⌘K</span>
            </Button>
            <NotificationCenter />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/help')}
              className="gap-2 hidden md:flex"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            <LanguageToggle />
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-peace-gradient rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-bold bg-peace-gradient bg-clip-text text-transparent">
                      {t('hero.title')}
                    </span>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </SheetClose>
                </div>
                
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <SheetClose key={item.path} asChild>
                        <Button
                          variant="ghost"
                          asChild
                          className={`w-full justify-start space-x-3 h-12 text-left ${
                            isActive ? 'bg-primary/10 text-primary font-medium' : ''
                          }`}
                        >
                          <Link to={item.path}>
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </Link>
                        </Button>
                      </SheetClose>
                    );
                  })}
                </div>
                
                <div className="mt-8 pt-8 border-t border-border space-y-4">
                  {user ? (
                    <>
                      {isAdmin && (
                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            onClick={() => navigate('/admin')}
                            className="w-full justify-start gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Admin Portal
                          </Button>
                        </SheetClose>
                      )}
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start gap-2"
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
                        className="w-full gap-2"
                      >
                        <User className="w-4 h-4" />
                        Sign In
                      </Button>
                    </SheetClose>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    <span>{t('nav.footer.global')}</span>
                  </div>
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