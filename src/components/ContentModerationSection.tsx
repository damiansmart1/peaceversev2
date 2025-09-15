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
  TrendingUp
} from "lucide-react";

const ContentModerationSection = () => {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const moderationFeatures = [
    {
      id: "ai-detection",
      icon: Brain,
      title: "AI Content Analysis",
      description: "Utambuzi wa haraka wa maneno ya uchukizi na propaganda",
      features: [
        "Real-time hate speech detection in Swahili & English",
        "Political violence incitement analysis",
        "Ethnic slur and stereotype identification",
        "Context-aware sentiment analysis"
      ],
      accuracy: "94%",
      speed: "<2 seconds"
    },
    {
      id: "community-moderation",
      icon: Users,
      title: "Community-Led Verification",
      description: "Ujumbe unahakikiwa na viongozi wa jamii na akina mama",
      features: [
        "Trusted community leader review panel",
        "Elder and women leader verification",
        "Local context validation",
        "Cultural sensitivity checks"
      ],
      accuracy: "87%",
      speed: "<2 hours"
    },
    {
      id: "prevention-system",
      icon: Shield,
      title: "Proactive Prevention",
      description: "Kuzuia kabla maudhui mbaya hayajatolewa",
      features: [
        "Pre-publication content screening",
        "User education on harmful content",
        "Alternative phrasing suggestions",
        "Positive storytelling prompts"
      ],
      accuracy: "91%",
      speed: "Real-time"
    }
  ];

  const moderationStats = [
    { label: "Content Reviewed Daily", value: "2,500+", icon: Eye },
    { label: "Harmful Content Blocked", value: "12%", icon: XCircle },
    { label: "False Positives", value: "<3%", icon: AlertTriangle },
    { label: "Community Appeals Resolved", value: "96%", icon: CheckCircle2 }
  ];

  const demoContent = [
    {
      id: "hate-speech",
      text: "Hawa watu wa kabila la X ni waongo tu, hawafikii kitu...",
      result: "blocked",
      confidence: 96,
      reason: "Ethnic stereotyping and hate speech detected",
      alternative: "Nataka kuelewa mtazamo tofauti kuhusu suala hili..."
    },
    {
      id: "peaceful-story",
      text: "Nilikutana na jirani yangu wa kabila tofauti, tukaanza biashara pamoja...",
      result: "approved",
      confidence: 99,
      reason: "Positive peacebuilding narrative",
      boost: "Recommended for community highlights"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Mfumo wa Udhibiti na Kuzuia | Detection & Prevention System
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Teknolojia ya kisasa na uwelekevu wa kitamaduni kuhifadhi mazingira salama ya mazungumzo ya amani
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {moderationStats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.label} className="p-6 text-center bg-card/80 backdrop-blur-sm shadow-story">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-card-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        {/* Moderation Features */}
        <Tabs defaultValue="ai-detection" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            {moderationFeatures.map((feature) => (
              <TabsTrigger key={feature.id} value={feature.id} className="text-sm">
                <feature.icon className="w-4 h-4 mr-2" />
                {feature.title}
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
                        <div className="text-xs text-success-foreground/80">Accuracy Rate</div>
                      </div>
                      <div className="bg-primary-light rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-primary-foreground">{feature.speed}</div>
                        <div className="text-xs text-primary-foreground/80">Response Time</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-card-foreground">Live Demo: Content Analysis</h4>
                    
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
                            {demo.result === 'approved' ? 'Approved' : 'Blocked'}
                          </Badge>
                        </div>
                        
                        {selectedDemo === demo.id && (
                          <div className="mt-3 pt-3 border-t border-border space-y-2">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              <span className="text-xs text-muted-foreground">
                                Confidence: {demo.confidence}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{demo.reason}</p>
                            {demo.alternative && (
                              <div className="bg-accent-light/50 rounded p-2">
                                <p className="text-xs font-medium text-accent-foreground">Suggested alternative:</p>
                                <p className="text-xs text-accent-foreground/80">{demo.alternative}</p>
                              </div>
                            )}
                            {demo.boost && (
                              <div className="bg-success-light/50 rounded p-2">
                                <p className="text-xs font-medium text-success-foreground">Platform boost:</p>
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
            <h3 className="text-2xl font-bold text-card-foreground mb-4">Ahadi ya Usalama | Safety Guarantee</h3>
            <p className="text-muted-foreground leading-relaxed">
              Kila ujumbe, picha, na sauti inayoshirikiwa kwenye Peace Verse inapita katika mfumo wa uchunguzi mkali. 
              Tunahakikisha mazingira salama ya mazungumzo ya amani kwa vijana wa Kenya wote.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ContentModerationSection;