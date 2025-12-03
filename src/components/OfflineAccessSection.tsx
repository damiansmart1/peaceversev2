import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smartphone, 
  Radio, 
  MessageSquare, 
  Wifi, 
  WifiOff, 
  Phone,
  Users,
  MapPin,
  RefreshCw,
  Signal,
  Download,
  CheckCircle,
  AlertCircle,
  Cloud,
  HardDrive,
  FileText,
  List
} from "lucide-react";
import { useTranslationContext } from './TranslationProvider';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import SMSIntegrationSection from './SMSIntegrationSection';
import OfflineReportQueue from './OfflineReportQueue';
import EmergencyContactsManager from './EmergencyContactsManager';
import { toast } from 'sonner';

const OfflineAccessSection = () => {
  const [connectionDemo, setConnectionDemo] = useState<'online' | 'offline'>('online');
  const { t } = useTranslationContext();
  const { 
    isOnline, 
    cachedData, 
    isSyncing, 
    lastSyncTime, 
    syncData, 
    getPendingReportsCount,
    syncOfflineReports 
  } = useOfflineStatus();
  
  const [pendingReports, setPendingReports] = useState(0);

  useEffect(() => {
    setPendingReports(getPendingReportsCount());
  }, [getPendingReportsCount]);

  const handleSync = async () => {
    await syncData();
    const result = await syncOfflineReports();
    if (result.synced > 0) {
      toast.success(`Synced ${result.synced} offline reports`);
    }
    setPendingReports(getPendingReportsCount());
  };

  const accessMethods = [
    {
      id: "sms-ussd",
      icon: MessageSquare,
      title: t('safety.offline.smsUssd.title'),
      description: t('safety.offline.smsUssd.description'),
      features: [
        t('safety.offline.smsUssd.feature1'),
        t('safety.offline.smsUssd.feature2'), 
        t('safety.offline.smsUssd.feature3'),
        t('safety.offline.smsUssd.feature4'),
        t('safety.offline.smsUssd.feature5')
      ],
      cost: t('safety.offline.smsUssd.cost'),
      coverage: t('safety.offline.smsUssd.coverage'),
      requirement: t('safety.offline.smsUssd.requirement')
    },
    {
      id: "voice-calls",
      icon: Phone,
      title: t('safety.offline.voiceHotline.title'),
      description: t('safety.offline.voiceHotline.description'),
      features: [
        t('safety.offline.voiceHotline.feature1'),
        t('safety.offline.voiceHotline.feature2'),
        t('safety.offline.voiceHotline.feature3'),
        t('safety.offline.voiceHotline.feature4'),
        t('safety.offline.voiceHotline.feature5')
      ],
      cost: t('safety.offline.voiceHotline.cost'),
      coverage: t('safety.offline.voiceHotline.coverage'),
      requirement: t('safety.offline.voiceHotline.requirement')
    },
    {
      id: "radio-integration",
      icon: Radio,
      title: t('safety.offline.communityRadio.title'),
      description: t('safety.offline.communityRadio.description'),
      features: [
        t('safety.offline.communityRadio.feature1'),
        t('safety.offline.communityRadio.feature2'),
        t('safety.offline.communityRadio.feature3'),
        t('safety.offline.communityRadio.feature4'),
        t('safety.offline.communityRadio.feature5')
      ],
      cost: t('safety.offline.communityRadio.cost'),
      coverage: t('safety.offline.communityRadio.coverage'),
      requirement: t('safety.offline.communityRadio.requirement')
    },
    {
      id: "offline-app",
      icon: WifiOff,
      title: t('safety.offline.offlineApp.title'),
      description: t('safety.offline.offlineApp.description'),
      features: [
        t('safety.offline.offlineApp.feature1'),
        t('safety.offline.offlineApp.feature2'),
        t('safety.offline.offlineApp.feature3'),
        t('safety.offline.offlineApp.feature4'),
        t('safety.offline.offlineApp.feature5')
      ],
      cost: t('safety.offline.offlineApp.cost'),
      coverage: t('safety.offline.offlineApp.coverage'),
      requirement: t('safety.offline.offlineApp.requirement')
    }
  ];

  const bridgingFeatures = [
    {
      title: t('safety.offline.bridges.communityHubs.title'),
      description: t('safety.offline.bridges.communityHubs.description'),
      locations: t('safety.offline.bridges.communityHubs.locations'),
      icon: MapPin
    },
    {
      title: t('safety.offline.bridges.mobileSyncPoints.title'), 
      description: t('safety.offline.bridges.mobileSyncPoints.description'),
      frequency: t('safety.offline.bridges.mobileSyncPoints.frequency'),
      icon: RefreshCw
    },
    {
      title: t('safety.offline.bridges.offlinePackages.title'),
      description: t('safety.offline.bridges.offlinePackages.description'),
      size: t('safety.offline.bridges.offlinePackages.size'),
      icon: Download
    }
  ];

  return (
    <section className="py-6 sm:py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-foreground">
            {t('safety.offline.title')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-2">
            {t('safety.offline.subtitle')}
          </p>
        </div>

        {/* Live Connection Status */}
        <Card className="max-w-4xl mx-auto mb-6 sm:mb-8 p-4 sm:p-6 bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${
                isOnline ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}>
                {isOnline ? (
                  <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  {isOnline ? 'Connected' : 'Offline Mode'}
                  {isOnline ? (
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {lastSyncTime 
                    ? `Last synced: ${lastSyncTime.toLocaleTimeString()}`
                    : 'Not synced yet'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {pendingReports > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <HardDrive className="w-3 h-3" />
                  {pendingReports} pending
                </Badge>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleSync}
                disabled={isSyncing || !isOnline}
                className="gap-2 text-xs sm:text-sm h-9"
                size="sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync'}
              </Button>
            </div>
          </div>

          {/* Cached Data Stats */}
          {cachedData && (
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">{cachedData.alerts?.length || 0}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Cached Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">{cachedData.safeSpaces?.length || 0}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Safe Spaces</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">{cachedData.emergencyContacts?.length || 0}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Contacts</div>
              </div>
            </div>
          )}
        </Card>

        {/* PWA Install Prompt */}
        <Card className="max-w-4xl mx-auto mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <h3 className="font-semibold text-lg mb-1">Install Peaceverse App</h3>
              <p className="text-sm text-muted-foreground">
                Add to your home screen for instant access, offline support, and faster loading.
              </p>
            </div>
            <Button className="shrink-0 gap-2">
              <Download className="w-4 h-4" />
              Install App
            </Button>
          </div>
        </Card>

        {/* Offline Report Queue & Emergency Contacts */}
        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-8">
          <OfflineReportQueue />
          <EmergencyContactsManager />
        </div>

        {/* SMS/USSD Integration Section */}
        <div className="max-w-6xl mx-auto mb-8">
          <SMSIntegrationSection />
        </div>

        {/* Connection Demo */}
        <Card className="max-w-4xl mx-auto mb-8 p-6 bg-card/80 backdrop-blur-sm">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold mb-3">{t('safety.offline.demo.title')}</h3>
            <div className="flex justify-center space-x-4">
              <Button 
                variant={connectionDemo === 'online' ? 'default' : 'outline'}
                onClick={() => setConnectionDemo('online')}
                className="space-x-2"
                size="sm"
              >
                <Wifi className="w-4 h-4" />
                <span>{t('safety.offline.demo.onlineMode')}</span>
              </Button>
              <Button 
                variant={connectionDemo === 'offline' ? 'default' : 'outline'}
                onClick={() => setConnectionDemo('offline')}
                className="space-x-2"
                size="sm"
              >
                <WifiOff className="w-4 h-4" />
                <span>{t('safety.offline.demo.offlineMode')}</span>
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            {connectionDemo === 'online' ? (
              <div className="text-center space-y-3">
                <div className="flex justify-center space-x-2 text-green-500">
                  <Wifi className="w-5 h-5" />
                  <Signal className="w-5 h-5" />
                </div>
                <h4 className="font-semibold">{t('safety.offline.demo.fullAccess')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('safety.offline.demo.fullAccessDesc')}
                </p>
                <div className="flex justify-center flex-wrap gap-2">
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30">{t('safety.offline.demo.hdMedia')}</Badge>
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30">{t('safety.offline.demo.realtimeChat')}</Badge>
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30">{t('safety.offline.demo.liveUpdates')}</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="flex justify-center space-x-2 text-yellow-500">
                  <WifiOff className="w-5 h-5" />
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-semibold">{t('safety.offline.demo.alternativeAccess')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('safety.offline.demo.alternativeAccessDesc')}
                </p>
                <div className="flex justify-center flex-wrap gap-2">
                  <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">{t('safety.offline.demo.smsStories')}</Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">{t('safety.offline.demo.voiceCalls')}</Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">{t('safety.offline.demo.radioShows')}</Badge>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Access Methods */}
        <Tabs defaultValue="sms-ussd" className="max-w-6xl mx-auto mb-8">
          <TabsList className="grid w-full grid-cols-4">
            {accessMethods.map((method) => (
              <TabsTrigger key={method.id} value={method.id} className="text-xs">
                <method.icon className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{method.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {accessMethods.map((method) => (
            <TabsContent key={method.id} value={method.id}>
              <Card className="p-6 bg-card/80 backdrop-blur-sm">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                        <method.icon className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{method.title}</h3>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {method.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <span className="text-xs font-medium text-muted-foreground">{t('safety.offline.cost')}</span>
                      <p className="text-lg font-bold text-primary">{method.cost}</p>
                    </div>
                    
                    <div className="bg-green-500/10 rounded-lg p-3">
                      <span className="text-xs font-medium text-muted-foreground">{t('safety.offline.coverage')}</span>
                      <p className="text-lg font-bold text-green-600">{method.coverage}</p>
                    </div>
                    
                    <div className="bg-accent/10 rounded-lg p-3">
                      <span className="text-xs font-medium text-muted-foreground">{t('safety.offline.requirements')}</span>
                      <p className="text-sm">{method.requirement}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Offline-to-Online Bridges */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-bold text-center mb-6">
            {t('safety.offline.connectivityBridges')}
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {bridgingFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-4 bg-card/80 backdrop-blur-sm">
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {feature.locations || feature.frequency || feature.size}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Access Commitment */}
        <Card className="max-w-4xl mx-auto mt-8 p-6 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
          <div className="text-center">
            <Users className="w-12 h-12 text-accent mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">{t('safety.offline.accessPromise')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('safety.offline.accessPromiseText')}
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default OfflineAccessSection;
