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

const OfflineAccessSection = () => {
  const [connectionDemo, setConnectionDemo] = useState<'online' | 'offline'>('online');

  const accessMethods = [
    {
      id: "sms-ussd",
      icon: MessageSquare,
      title: "SMS & USSD",
      description: "Accessible via basic phones without internet connectivity",
      features: [
        "Story sharing via SMS (160 chars)",
        "*555# USSD menu navigation", 
        "Voice note requests via SMS",
        "Safe space reporting",
        "Peace point balance checks"
      ],
      cost: "Ksh 5 per SMS",
      coverage: "99.8% Kenya",
      requirement: "Any mobile phone"
    },
    {
      id: "voice-calls",
      icon: Phone,
      title: "Voice Hotline",
      description: "Direct phone line for sharing stories and getting support",
      features: [
        "24/7 peace storytelling hotline",
        "Multi-language support",
        "Crisis intervention routing",
        "Story recording & transcription",
        "Community leader connections"
      ],
      cost: "Free (toll-free)",
      coverage: "National",
      requirement: "Voice calling capability"
    },
    {
      id: "radio-integration",
      icon: Radio,
      title: "Community Radio",
      description: "Integration with community radio stations for broad communication",
      features: [
        "Weekly peace dialogue broadcasts",
        "Story sharing sessions",
        "Live community Q&A",
        "Educational content",
        "Event announcements"
      ],
      cost: "Free",
      coverage: "90+ radio stations",
      requirement: "FM radio access"
    },
    {
      id: "offline-app",
      icon: WifiOff,
      title: "Offline-First App",
      description: "Programu inayofanya kazi bila mtandao na kusawazisha baadaye",
      features: [
        "Offline content creation",
        "Local story storage",
        "Background sync when online",
        "Offline gamification",
        "Community map caching"
      ],
      cost: "Free download",
      coverage: "Android 5.0+",
      requirement: "Smartphone with 50MB space"
    }
  ];

  const bridgingFeatures = [
    {
      title: "Community Hubs",
      description: "Vituo vya kijamii vilivyo na WiFi bure na kompyuta",
      locations: "50+ locations across Kenya",
      icon: MapPin
    },
    {
      title: "Mobile Sync Points", 
      description: "Madereva wa matatu na makazi ya jamii yanayotoa huduma za kusawazisha",
      frequency: "Daily sync opportunities",
      icon: RefreshCw
    },
    {
      title: "Offline Content Packages",
      description: "Content packages distributed via Bluetooth and WiFi hotspots",
      size: "Weekly 5MB packages",
      icon: Download
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Universal Access
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Peace Verse works for youth in marginalized and rural areas with limited internet access
          </p>
        </div>

        {/* Connection Demo */}
        <Card className="max-w-4xl mx-auto mb-12 p-8 bg-card/80 backdrop-blur-sm shadow-story">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-4 text-card-foreground">Demo: Platform Access Modes</h3>
            <div className="flex justify-center space-x-4">
              <Button 
                variant={connectionDemo === 'online' ? 'default' : 'outline'}
                onClick={() => setConnectionDemo('online')}
                className="space-x-2"
              >
                <Wifi className="w-4 h-4" />
                <span>Online Mode</span>
              </Button>
              <Button 
                variant={connectionDemo === 'offline' ? 'default' : 'outline'}
                onClick={() => setConnectionDemo('offline')}
                className="space-x-2"
              >
                <WifiOff className="w-4 h-4" />
                <span>Offline Mode</span>
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
                <h4 className="font-semibold text-card-foreground">Full Platform Access</h4>
                <p className="text-sm text-muted-foreground">
                  Complete app functionality: story sharing, community map, gamification, real-time interactions
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge className="bg-success text-success-foreground">HD Media</Badge>
                  <Badge className="bg-success text-success-foreground">Real-time Chat</Badge>
                  <Badge className="bg-success text-success-foreground">Live Updates</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center space-x-2 text-warning">
                  <WifiOff className="w-6 h-6" />
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-card-foreground">Alternative Access Methods</h4>
                <p className="text-sm text-muted-foreground">
                  SMS stories, voice calls, radio integration, offline app with sync capabilities
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge className="bg-warning text-warning-foreground">SMS Stories</Badge>
                  <Badge className="bg-warning text-warning-foreground">Voice Calls</Badge>
                  <Badge className="bg-warning text-warning-foreground">Radio Shows</Badge>
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
                          <span className="text-sm font-medium text-card-foreground">Cost</span>
                        </div>
                        <p className="text-lg font-bold text-primary">{method.cost}</p>
                      </div>
                      
                      <div className="bg-success/10 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-success rounded-full" />
                          <span className="text-sm font-medium text-card-foreground">Coverage</span>
                        </div>
                        <p className="text-lg font-bold text-success">{method.coverage}</p>
                      </div>
                      
                      <div className="bg-accent/10 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-accent rounded-full" />
                          <span className="text-sm font-medium text-card-foreground">Requirements</span>
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
            Madaraja ya Offline-Online | Connectivity Bridges
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
            <h3 className="text-2xl font-bold text-card-foreground mb-4">Access Promise</h3>
            <p className="text-muted-foreground leading-relaxed">
              No Kenyan youth should be excluded from peace conversations because of technology barriers. 
              Peace Verse works on basic phones, smartphones, and even without any phone at all.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default OfflineAccessSection;