import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, Download, X, Wifi, WifiOff, 
  CheckCircle, Share, MoreVertical, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
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

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Store dismissal in localStorage for 7 days
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  // Check if recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) {
        setIsDismissed(true);
      }
    }
  }, []);

  if (isInstalled || isDismissed) return null;

  // iOS specific instructions
  if (isIOS) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-[5.5rem] lg:bottom-4 left-3 right-3 lg:left-auto lg:right-4 z-50 lg:max-w-sm"
        >
          <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">Install Peaceverse</h3>
                      <p className="text-sm text-muted-foreground">
                        Add to your home screen for offline access
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleDismiss} className="-mt-1 -mr-2">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    className="w-full mt-3 gap-2" 
                    onClick={() => setShowIOSInstructions(!showIOSInstructions)}
                  >
                    <Share className="w-4 h-4" />
                    Show Instructions
                  </Button>

                  <AnimatePresence>
                    {showIOSInstructions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 p-3 rounded-lg bg-muted text-sm space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className="w-6 h-6 flex items-center justify-center p-0">1</Badge>
                            <span>Tap the <Share className="w-4 h-4 inline" /> Share button</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="w-6 h-6 flex items-center justify-center p-0">2</Badge>
                            <span>Scroll and tap "Add to Home Screen"</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="w-6 h-6 flex items-center justify-center p-0">3</Badge>
                            <span>Tap "Add" to confirm</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Android/Desktop prompt
  if (!isInstallable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-[5.5rem] lg:bottom-4 left-3 right-3 lg:left-auto lg:right-4 z-50 lg:max-w-sm"
      >
        <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">Install Peaceverse</h3>
                    <p className="text-sm text-muted-foreground">
                      Works offline • Faster loading • Home screen access
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleDismiss} className="-mt-1 -mr-2">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={handleDismiss} className="flex-1">
                    Not Now
                  </Button>
                  <Button size="sm" onClick={handleInstall} className="flex-1 gap-1">
                    <Download className="w-4 h-4" />
                    Install
                  </Button>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> Offline Ready
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Free
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
