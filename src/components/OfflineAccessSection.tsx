import React, { useState } from 'react';
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
  Volume2,
  Download
} from "lucide-react";
import { useTranslationContext } from './TranslationProvider';

const OfflineAccessSection = () => {
  const [connectionDemo, setConnectionDemo] = useState<'online' | 'offline'>('online');
  const { t } = useTranslationContext();

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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            {t('safety.offline.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('safety.offline.subtitle')}
          </p>
        </div>

        {/* Connection Demo */}
        <Card className="max-w-4xl mx-auto mb-12 p-8 bg-card/80 backdrop-blur-sm shadow-story">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-4 text-card-foreground">{t('safety.offline.demo.title')}</h3>
            <div className="flex justify-center space-x-4">
              <Button 
                variant={connectionDemo === 'online' ? 'default' : 'outline'}
                onClick={() => setConnectionDemo('online')}
                className="space-x-2"
              >
                <Wifi className="w-4 h-4" />
                <span>{t('safety.offline.demo.onlineMode')}</span>
              </Button>
              <Button 
                variant={connectionDemo === 'offline' ? 'default' : 'outline'}
                onClick={() => setConnectionDemo('offline')}
                className="space-x-2"
              >
                <WifiOff className="w-4 h-4" />
                <span>{t('safety.offline.demo.offlineMode')}</span>
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-6">
            {connectionDemo === 'online' ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center space-x-2 text-success">
                  <Wifi className="w-6 h-6" />
                  <Signal className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-card-foreground">{t('safety.offline.demo.fullAccess')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('safety.offline.demo.fullAccessDesc')}
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge className="bg-success text-success-foreground">{t('safety.offline.demo.hdMedia')}</Badge>
                  <Badge className="bg-success text-success-foreground">{t('safety.offline.demo.realtimeChat')}</Badge>
                  <Badge className="bg-success text-success-foreground">{t('safety.offline.demo.liveUpdates')}</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center space-x-2 text-warning">
                  <WifiOff className="w-6 h-6" />
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-card-foreground">{t('safety.offline.demo.alternativeAccess')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('safety.offline.demo.alternativeAccessDesc')}
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge className="bg-warning text-warning-foreground">{t('safety.offline.demo.smsStories')}</Badge>
                  <Badge className="bg-warning text-warning-foreground">{t('safety.offline.demo.voiceCalls')}</Badge>
                  <Badge className="bg-warning text-warning-foreground">{t('safety.offline.demo.radioShows')}</Badge>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Access Methods */}
        <Tabs defaultValue="sms-ussd" className="max-w-6xl mx-auto mb-12">
          <TabsList className="grid w-full grid-cols-4">
            {accessMethods.map((method) => (
              <TabsTrigger key={method.id} value={method.id} className="text-xs">
                <method.icon className="w-4 h-4 mr-1" />
                {method.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {accessMethods.map((method) => (
            <TabsContent key={method.id} value={method.id}>
              <Card className="p-8 bg-card/80 backdrop-blur-sm shadow-story">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <method.icon className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-card-foreground">{method.title}</h3>
                        <p className="text-muted-foreground">{method.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {method.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span className="text-sm text-card-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-primary/10 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-primary rounded-full" />
                          <span className="text-sm font-medium text-card-foreground">{t('safety.offline.cost')}</span>
                        </div>
                        <p className="text-lg font-bold text-primary">{method.cost}</p>
                      </div>
                      
                      <div className="bg-success/10 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-success rounded-full" />
                          <span className="text-sm font-medium text-card-foreground">{t('safety.offline.coverage')}</span>
                        </div>
                        <p className="text-lg font-bold text-success">{method.coverage}</p>
                      </div>
                      
                      <div className="bg-accent/10 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-accent rounded-full" />
                          <span className="text-sm font-medium text-card-foreground">{t('safety.offline.requirements')}</span>
                        </div>
                        <p className="text-sm text-accent-foreground">{method.requirement}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Offline-to-Online Bridges */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
            {t('safety.offline.connectivityBridges')}
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {bridgingFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-6 bg-card/80 backdrop-blur-sm shadow-story">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-community-gradient rounded-full flex items-center justify-center mx-auto">
                      <IconComponent className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h4 className="font-semibold text-card-foreground">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <Badge variant="secondary">
                      {feature.locations || feature.frequency || feature.size}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Access Commitment */}
        <Card className="max-w-4xl mx-auto mt-12 p-8 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
          <div className="text-center">
            <Users className="w-16 h-16 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-card-foreground mb-4">{t('safety.offline.accessPromise')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('safety.offline.accessPromiseText')}
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default OfflineAccessSection;
