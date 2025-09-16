import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, X, Mic, Users, Radio, Map, Award, Shield, Globe, Heart } from "lucide-react";
import { useTranslationContext } from "@/components/TranslationProvider";
import LanguageToggle from "@/components/LanguageToggle";

const Navigation = () => {
  const { t } = useTranslationContext();
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    { id: 'voice', label: t('nav.voice'), icon: Mic },
    { id: 'community', label: t('nav.community'), icon: Users },
    { id: 'radio', label: t('nav.radio'), icon: Radio },
    { id: 'map', label: t('nav.map'), icon: Map },
    { id: 'challenges', label: t('nav.challenges'), icon: Award },
    { id: 'safety', label: t('nav.safety'), icon: Shield },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-peace-gradient rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl bg-peace-gradient bg-clip-text text-transparent">
              {t('hero.title')}
            </span>
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
              v2.0
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center space-x-1 text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
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
                    return (
                      <SheetClose key={item.id} asChild>
                        <Button
                          variant="ghost"
                          onClick={() => scrollToSection(item.id)}
                          className="w-full justify-start space-x-3 h-12 text-left"
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Button>
                      </SheetClose>
                    );
                  })}
                </div>
                
                <div className="mt-8 pt-8 border-t border-border">
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
  );
};

export default Navigation;