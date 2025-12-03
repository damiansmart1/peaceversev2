import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Crown, 
  Award, 
  Handshake, 
  Eye, 
  Star,
  CheckCircle2,
  MessageSquare,
  UserCheck,
  Heart,
  Globe,
  TrendingUp
} from "lucide-react";
import { useTranslationContext } from './TranslationProvider';

const CommunityTrustSection = () => {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const { t } = useTranslationContext();

  const trustBuilders = [
    {
      id: "elder-partnership",
      icon: Crown,
      title: t('safety.trust.elderPartnership.title'),
      description: t('safety.trust.elderPartnership.description'),
      features: [
        t('safety.trust.elderPartnership.feature1'),
        t('safety.trust.elderPartnership.feature2'), 
        t('safety.trust.elderPartnership.feature3'),
        t('safety.trust.elderPartnership.feature4')
      ],
      impact: t('safety.trust.elderPartnership.impact'),
      participants: t('safety.trust.elderPartnership.participants')
    },
    {
      id: "transparency-system", 
      icon: Eye,
      title: t('safety.trust.transparency.title'),
      description: t('safety.trust.transparency.description'),
      features: [
        t('safety.trust.transparency.feature1'),
        t('safety.trust.transparency.feature2'),
        t('safety.trust.transparency.feature3'), 
        t('safety.trust.transparency.feature4')
      ],
      impact: t('safety.trust.transparency.impact'),
      participants: t('safety.trust.transparency.participants')
    },
    {
      id: "diverse-voices",
      icon: Users,
      title: t('safety.trust.diverseVoices.title'),
      description: t('safety.trust.diverseVoices.description'),
      features: [
        t('safety.trust.diverseVoices.feature1'),
        t('safety.trust.diverseVoices.feature2'),
        t('safety.trust.diverseVoices.feature3'),
        t('safety.trust.diverseVoices.feature4')
      ],
      impact: t('safety.trust.diverseVoices.impact'),
      participants: t('safety.trust.diverseVoices.participants')
    },
    {
      id: "proven-results",
      icon: TrendingUp,
      title: t('safety.trust.provenResults.title'),
      description: t('safety.trust.provenResults.description'),
      features: [
        t('safety.trust.provenResults.feature1'),
        t('safety.trust.provenResults.feature2'), 
        t('safety.trust.provenResults.feature3'),
        t('safety.trust.provenResults.feature4')
      ],
      impact: t('safety.trust.provenResults.impact'),
      participants: t('safety.trust.provenResults.participants')
    }
  ];

  const trustMetrics = [
    { label: t('safety.trust.metrics.leadersEndorsing'), value: "340+", icon: UserCheck },
    { label: t('safety.trust.metrics.trustScore'), value: "94/100", icon: Star },
    { label: t('safety.trust.metrics.partnerships'), value: "67", icon: Handshake },
    { label: t('safety.trust.metrics.successStories'), value: "1,200+", icon: CheckCircle2 }
  ];

  const verificationProcess = [
    {
      step: 1,
      title: t('safety.trust.verification.step1.title'),
      description: t('safety.trust.verification.step1.description'),
      icon: Users,
      duration: t('safety.trust.verification.step1.duration')
    },
    {
      step: 2, 
      title: t('safety.trust.verification.step2.title'),
      description: t('safety.trust.verification.step2.description'),
      icon: Crown,
      duration: t('safety.trust.verification.step2.duration')
    },
    {
      step: 3,
      title: t('safety.trust.verification.step3.title'), 
      description: t('safety.trust.verification.step3.description'),
      icon: Globe,
      duration: t('safety.trust.verification.step3.duration')
    },
    {
      step: 4,
      title: t('safety.trust.verification.step4.title'),
      description: t('safety.trust.verification.step4.description'),
      icon: Award,
      duration: t('safety.trust.verification.step4.duration')
    }
  ];

  const successStories = [
    {
      id: "kibera-peace",
      title: t('safety.trust.stories.kibera.title'),
      description: t('safety.trust.stories.kibera.description'),
      impact: t('safety.trust.stories.kibera.impact'),
      verified: true,
      endorsers: [t('safety.trust.stories.kibera.endorser1'), t('safety.trust.stories.kibera.endorser2'), t('safety.trust.stories.kibera.endorser3')],
      quote: t('safety.trust.stories.kibera.quote')
    },
    {
      id: "nakuru-harmony",
      title: t('safety.trust.stories.nakuru.title'), 
      description: t('safety.trust.stories.nakuru.description'),
      impact: t('safety.trust.stories.nakuru.impact'),
      verified: true,
      endorsers: [t('safety.trust.stories.nakuru.endorser1'), t('safety.trust.stories.nakuru.endorser2'), t('safety.trust.stories.nakuru.endorser3')],
      quote: t('safety.trust.stories.nakuru.quote')
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            {t('safety.trust.title')}  
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('safety.trust.subtitle')}
          </p>
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {trustMetrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <Card key={metric.label} className="p-6 text-center bg-card/80 backdrop-blur-sm shadow-story">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-card-foreground mb-1">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </Card>
            );
          })}
        </div>

        {/* Trust Building Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {trustBuilders.map((builder) => {
            const IconComponent = builder.icon;
            return (
              <Card key={builder.id} className="p-6 bg-card/80 backdrop-blur-sm shadow-story">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-card-foreground">{builder.title}</h3>
                      <p className="text-sm text-muted-foreground">{builder.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {builder.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-sm text-card-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{builder.impact}</div>
                      <div className="text-xs text-muted-foreground">{t('safety.trust.impactAchieved')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-accent">{builder.participants}</div>
                      <div className="text-xs text-muted-foreground">{t('safety.trust.activeParticipants')}</div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Verification Process */}
        <Card className="max-w-5xl mx-auto mb-12 p-8 bg-card/80 backdrop-blur-sm shadow-story">
          <h3 className="text-2xl font-bold text-center mb-8 text-card-foreground">
            {t('safety.trust.verificationProcess')}
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            {verificationProcess.map((process) => {
              const IconComponent = process.icon;
              return (
                <div key={process.step} className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                      <IconComponent className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-accent-foreground">{process.step}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-card-foreground mb-2">{process.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{process.description}</p>
                    <Badge variant="secondary">{process.duration}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Success Stories */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
            {t('safety.trust.verifiedSuccessStories')}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {successStories.map((story) => (
              <Card 
                key={story.id} 
                className={`p-6 bg-card/80 backdrop-blur-sm shadow-story cursor-pointer transition-all duration-300 ${
                  selectedStory === story.id ? 'ring-2 ring-primary shadow-peace' : ''
                }`}
                onClick={() => setSelectedStory(selectedStory === story.id ? null : story.id)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-card-foreground mb-2">{story.title}</h4>
                      <p className="text-sm text-muted-foreground">{story.description}</p>
                    </div>
                    {story.verified && (
                      <Badge className="bg-success text-success-foreground ml-3">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t('safety.trust.verified')}
                      </Badge>
                    )}
                  </div>

                  <div className="bg-primary/10 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">{story.impact}</span>
                    </div>
                  </div>

                  {selectedStory === story.id && (
                    <div className="space-y-3 pt-3 border-t border-border">
                      <div>
                        <p className="text-sm font-medium text-card-foreground mb-2">{t('safety.trust.communityEndorsers')}:</p>
                        <div className="flex flex-wrap gap-1">
                          {story.endorsers.map((endorser, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {endorser}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-accent-light/30 rounded p-3">
                        <MessageSquare className="w-4 h-4 text-accent mb-2" />
                        <p className="text-sm italic text-accent-foreground">"{story.quote}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Commitment */}
        <Card className="max-w-4xl mx-auto mt-12 p-8 bg-gradient-to-r from-success/10 to-primary/10 border-success/20">
          <div className="text-center">
            <Handshake className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-card-foreground mb-4">{t('safety.trust.trustCommitment')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('safety.trust.trustCommitmentText')}
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CommunityTrustSection;
