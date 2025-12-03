import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Shield, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Zap,
  Clock,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useTranslationContext } from './TranslationProvider';
import { useSafetyStats } from '@/hooks/useSafetyStats';

const ContentModerationSection = () => {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const { t } = useTranslationContext();
  const { data: stats, isLoading } = useSafetyStats();

  const moderationFeatures = [
    {
      id: "ai-detection",
      icon: Brain,
      title: t('safety.moderation.aiDetection.title'),
      description: t('safety.moderation.aiDetection.description'),
      features: [
        t('safety.moderation.aiDetection.feature1'),
        t('safety.moderation.aiDetection.feature2'),
        t('safety.moderation.aiDetection.feature3'),
        t('safety.moderation.aiDetection.feature4')
      ],
      accuracy: "94%",
      speed: t('safety.moderation.speed.twoSeconds')
    },
    {
      id: "community-moderation",
      icon: Users,
      title: t('safety.moderation.communityVerification.title'),
      description: t('safety.moderation.communityVerification.description'),
      features: [
        t('safety.moderation.communityVerification.feature1'),
        t('safety.moderation.communityVerification.feature2'),
        t('safety.moderation.communityVerification.feature3'),
        t('safety.moderation.communityVerification.feature4')
      ],
      accuracy: "87%",
      speed: t('safety.moderation.speed.twoHours')
    },
    {
      id: "prevention-system",
      icon: Shield,
      title: t('safety.moderation.proactivePrevention.title'),
      description: t('safety.moderation.proactivePrevention.description'),
      features: [
        t('safety.moderation.proactivePrevention.feature1'),
        t('safety.moderation.proactivePrevention.feature2'),
        t('safety.moderation.proactivePrevention.feature3'),
        t('safety.moderation.proactivePrevention.feature4')
      ],
      accuracy: "91%",
      speed: t('safety.moderation.speed.realtime')
    }
  ];

  const moderationStats = [
    { label: t('safety.moderation.stats.contentReviewed'), value: stats?.moderation.contentReviewed?.toLocaleString() || '0', icon: Eye },
    { label: t('safety.moderation.stats.harmfulBlocked'), value: stats?.moderation.harmfulBlocked || '0%', icon: XCircle },
    { label: t('safety.moderation.stats.falsePositives'), value: stats?.moderation.falsePositives || '<3%', icon: AlertTriangle },
    { label: t('safety.moderation.stats.appealsResolved'), value: stats?.moderation.appealsResolved || '0%', icon: CheckCircle2 }
  ];

  const demoContent = [
    {
      id: "hate-speech",
      text: t('safety.moderation.demo.hateSpeech.text'),
      result: "blocked",
      confidence: 96,
      reason: t('safety.moderation.demo.hateSpeech.reason'),
      alternative: t('safety.moderation.demo.hateSpeech.alternative')
    },
    {
      id: "peaceful-story",
      text: t('safety.moderation.demo.peacefulStory.text'),
      result: "approved",
      confidence: 99,
      reason: t('safety.moderation.demo.peacefulStory.reason'),
      boost: t('safety.moderation.demo.peacefulStory.boost')
    }
  ];

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
            {t('safety.moderation.title')}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            {t('safety.moderation.subtitle')}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
          {isLoading ? (
            <div className="col-span-2 lg:col-span-4 flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            moderationStats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <Card key={stat.label} className="p-4 sm:p-6 text-center bg-card/80 backdrop-blur-sm shadow-story">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-card-foreground mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{stat.label}</div>
                </Card>
              );
            })
          )}
        </div>

        {/* Moderation Features */}
        <Tabs defaultValue="ai-detection" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 mb-4">
            {moderationFeatures.map((feature) => (
              <TabsTrigger key={feature.id} value={feature.id} className="text-xs sm:text-sm py-2 px-2 sm:px-3 flex items-center gap-1 sm:gap-2">
                <feature.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline truncate">{feature.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {moderationFeatures.map((feature) => (
            <TabsContent key={feature.id} value={feature.id}>
              <Card className="p-8 bg-card/80 backdrop-blur-sm shadow-story">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-card-foreground">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {feature.features.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <span className="text-sm text-card-foreground">{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-success-light rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-success-foreground">{feature.accuracy}</div>
                        <div className="text-xs text-success-foreground/80">{t('safety.moderation.accuracyRate')}</div>
                      </div>
                      <div className="bg-primary-light rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-primary-foreground">{feature.speed}</div>
                        <div className="text-xs text-primary-foreground/80">{t('safety.moderation.responseTime')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-card-foreground">{t('safety.moderation.liveDemo')}</h4>
                    
                    {demoContent.map((demo) => (
                      <Card 
                        key={demo.id}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedDemo === demo.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedDemo(selectedDemo === demo.id ? null : demo.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm text-card-foreground flex-1">{demo.text}</p>
                          <Badge 
                            className={demo.result === 'approved' 
                              ? 'bg-success text-success-foreground' 
                              : 'bg-destructive text-destructive-foreground'
                            }
                          >
                            {demo.result === 'approved' ? t('safety.moderation.approved') : t('safety.moderation.blocked')}
                          </Badge>
                        </div>
                        
                        {selectedDemo === demo.id && (
                          <div className="mt-3 pt-3 border-t border-border space-y-2">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              <span className="text-xs text-muted-foreground">
                                {t('safety.moderation.confidence')}: {demo.confidence}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{demo.reason}</p>
                            {demo.alternative && (
                              <div className="bg-accent-light/50 rounded p-2">
                                <p className="text-xs font-medium text-accent-foreground">{t('safety.moderation.suggestedAlternative')}:</p>
                                <p className="text-xs text-accent-foreground/80">{demo.alternative}</p>
                              </div>
                            )}
                            {demo.boost && (
                              <div className="bg-success-light/50 rounded p-2">
                                <p className="text-xs font-medium text-success-foreground">{t('safety.moderation.platformBoost')}:</p>
                                <p className="text-xs text-success-foreground/80">{demo.boost}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Safety Guarantee */}
        <Card className="max-w-4xl mx-auto mt-12 p-8 bg-gradient-to-r from-success/10 to-primary/10 border-success/20">
          <div className="text-center">
            <Shield className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-card-foreground mb-4">{t('safety.moderation.safetyGuarantee')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('safety.moderation.safetyGuaranteeText')}
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ContentModerationSection;
