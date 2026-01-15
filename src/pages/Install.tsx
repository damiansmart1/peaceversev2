import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Share, Plus, Check, ArrowRight, Shield, Wifi, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslationContext } from '@/components/TranslationProvider';
import peaceverselogo from '@/assets/peaceverse-logo.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const { t } = useTranslationContext();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: Wifi, title: t('install.worksOffline'), description: t('install.worksOfflineDesc') },
    { icon: Bell, title: t('install.pushNotifications'), description: t('install.pushNotificationsDesc') },
    { icon: Shield, title: t('install.securePrivate'), description: t('install.securePrivateDesc') },
  ];

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('install.appInstalled')}</h1>
          <p className="text-muted-foreground mb-6">{t('install.readyToUse')}</p>
          <Button asChild>
            <a href="/">{t('install.openApp')} <ArrowRight className="ml-2 w-4 h-4" /></a>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <img 
            src={peaceverselogo} 
            alt="Peaceverse" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('install.title')}</h1>
          <p className="text-muted-foreground">{t('install.subtitle')}</p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 mb-8"
        >
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Install Instructions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {deferredPrompt ? (
            <Card className="border-accent/50 bg-accent/5">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Download className="w-5 h-5 text-accent" />
                  {t('install.readyToInstall')}
                </CardTitle>
                <CardDescription>{t('install.tapToAdd')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleInstall} 
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  <Download className="mr-2 w-5 h-5" />
                  {t('install.installButton')}
                </Button>
              </CardContent>
            </Card>
          ) : isIOS ? (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-accent" />
                  {t('install.iosTitle')}
                </CardTitle>
                <CardDescription>{t('install.followSteps')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium text-foreground">{t('install.ios.step1')}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {t('install.ios.step1Desc')} <Share className="w-4 h-4" />
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium text-foreground">{t('install.ios.step2')}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {t('install.ios.step2Desc')} <Plus className="w-4 h-4" />
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium text-foreground">{t('install.ios.step3')}</p>
                    <p className="text-sm text-muted-foreground">{t('install.ios.step3Desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : isAndroid ? (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-accent" />
                  {t('install.androidTitle')}
                </CardTitle>
                <CardDescription>{t('install.followSteps')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium text-foreground">{t('install.android.step1')}</p>
                    <p className="text-sm text-muted-foreground">{t('install.android.step1Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium text-foreground">{t('install.android.step2')}</p>
                    <p className="text-sm text-muted-foreground">{t('install.android.step2Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium text-foreground">{t('install.android.step3')}</p>
                    <p className="text-sm text-muted-foreground">{t('install.android.step3Desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-accent" />
                  {t('install.desktopTitle')}
                </CardTitle>
                <CardDescription>{t('install.addToComputer')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium text-foreground">{t('install.desktop.step1')}</p>
                    <p className="text-sm text-muted-foreground">{t('install.desktop.step1Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium text-foreground">{t('install.desktop.step2')}</p>
                    <p className="text-sm text-muted-foreground">{t('install.desktop.step2Desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <Button variant="ghost" asChild>
            <a href="/">← {t('install.backToPeaceverse')}</a>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Install;