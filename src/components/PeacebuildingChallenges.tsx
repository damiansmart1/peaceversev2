import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Users, MessageSquareWarning, Zap, Target } from "lucide-react";

const PeacebuildingChallenges = () => {
  const challenges = [
    {
      id: "hate-speech",
      icon: MessageSquareWarning,
      title: "Hate Speech & Incitement",
      description: "Hate speech and incitement through social media",
      targets: ["Political tensions", "Ethnic stereotypes", "Religious intolerance"],
      severity: "critical",
      stats: "65% of youth have encountered hate speech online"
    },
    {
      id: "ethnic-tensions",
      icon: Users,
      title: "Ethnic & Tribal Tensions",
      description: "Ethnic and tribal tensions that emerge during elections",
      targets: ["Inter-community conflicts", "Land disputes", "Resource competition"],
      severity: "high",
      stats: "78% of major tribes in Kenya have been affected by tensions"
    },
    {
      id: "political-violence",
      icon: AlertTriangle,
      title: "Political Violence & Extremism",
      description: "Political violence and extremism during elections",
      targets: ["Electoral violence", "Youth radicalization", "Political intimidation"],
      severity: "critical",
      stats: "23% of youth have been affected by political violence"
    },
    {
      id: "cyberbullying",
      icon: Shield,
      title: "Online Harassment & Cyberbullying",
      description: "Online harassment and slander targeting youth and specific groups",
      targets: ["Gender-based violence", "Youth targeting", "Minority harassment"],
      severity: "high",
      stats: "45% of girls have experienced online harassment"
    },
    {
      id: "disinformation",
      icon: Zap,
      title: "Disinformation & Fake News",
      description: "False news and misinformation spreading anger and hatred",
      targets: ["False narratives", "Manipulated media", "Conspiracy theories"],
      severity: "high",
      stats: "89% of Kenyans have received fake news on WhatsApp"
    },
    {
      id: "social-exclusion",
      icon: Target,
      title: "Social Marginalization",
      description: "Exclusion of specific groups and lack of participation in peace conversations",
      targets: ["PWDs exclusion", "Rural youth isolation", "Economic marginalization"],
      severity: "medium",
      stats: "34% of rural youth have felt excluded"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-warning text-warning-foreground";
      case "medium": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            Peacebuilding Challenges
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Peace Verse addresses specific peacebuilding challenges in Kenya using modern technology and traditional approaches
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
          {challenges.map((challenge) => {
            const IconComponent = challenge.icon;
            return (
              <Card 
                key={challenge.id}
                className="p-5 bg-card/90 backdrop-blur-sm border-border/40 shadow-story hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 rounded-xl"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                      <IconComponent className="w-7 h-7 text-primary" />
                    </div>
                    <Badge className={`${getSeverityColor(challenge.severity)} rounded-full px-3`}>
                      {challenge.severity}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {challenge.description}
                    </p>
                    
                    {/* Statistics */}
                    <div className="bg-gradient-to-br from-accent-light/60 to-accent-light/30 rounded-xl p-3 mb-3 border border-accent/10">
                      <p className="text-xs font-medium text-card-foreground">
                        {challenge.stats}
                      </p>
                    </div>

                    {/* Specific Targets */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-card-foreground">Key Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {challenge.targets.map((target, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="text-xs"
                          >
                            {target}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Impact Statement */}
        <Card className="max-w-4xl mx-auto mt-10 p-6 md:p-8 bg-peace-gradient border-0 shadow-elevated rounded-2xl">
          <div className="text-center text-primary-foreground">
            <h3 className="text-xl md:text-2xl font-bold mb-3">Our Targeted Response</h3>
            <p className="text-base md:text-lg leading-relaxed">
              Peace Verse is not just built as a dialogue platform - it's a technology tool designed to tackle these specific challenges. 
              We use AI, human voice, and community collaboration to build peace leadership that prevents and addresses these fundamental issues.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default PeacebuildingChallenges;