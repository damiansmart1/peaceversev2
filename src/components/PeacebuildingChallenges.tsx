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
      description: "Mazungumzo ya kuchukiza na maneno ya uchochezi kupitia mitandao ya kijamii",
      targets: ["Political tensions", "Ethnic stereotypes", "Religious intolerance"],
      severity: "critical",
      stats: "65% ya vijana wameona maneno ya uchukizi mtandaoni"
    },
    {
      id: "ethnic-tensions",
      icon: Users,
      title: "Ethnic & Tribal Tensions",
      description: "Mvutano wa kikabila na ugomvi wa kijamii unaozuka wakati wa uchaguzi",
      targets: ["Inter-community conflicts", "Land disputes", "Resource competition"],
      severity: "high",
      stats: "78% ya makabila makuu huko Kenya yameguswa na mvutano"
    },
    {
      id: "political-violence",
      icon: AlertTriangle,
      title: "Political Violence & Extremism",
      description: "Vurugu za kisiasa na mioyo ya kigomvi wakati wa uchaguzi",
      targets: ["Electoral violence", "Youth radicalization", "Political intimidation"],
      severity: "critical",
      stats: "23% ya vijana wameguswa na vurugu za kisiasa"
    },
    {
      id: "cyberbullying",
      icon: Shield,
      title: "Online Harassment & Cyberbullying",
      description: "Udhalilishaji mtandaoni na fitina zinazolenga vijana na makundi maalum",
      targets: ["Gender-based violence", "Youth targeting", "Minority harassment"],
      severity: "high",
      stats: "45% ya wasichana wamepata udhalilishaji mtandaoni"
    },
    {
      id: "disinformation",
      icon: Zap,
      title: "Disinformation & Fake News",
      description: "Habari za uongo na misinformation inayoeneza ghadhaba na chuki",
      targets: ["False narratives", "Manipulated media", "Conspiracy theories"],
      severity: "high",
      stats: "89% ya Wakenya wamepokea habari za uongo WhatsApp"
    },
    {
      id: "social-exclusion",
      icon: Target,
      title: "Social Marginalization",
      description: "Kutengwa kwa makundi maalum na upungufu wa ushiriki katika mazungumzo ya amani",
      targets: ["PWDs exclusion", "Rural youth isolation", "Economic marginalization"],
      severity: "medium",
      stats: "34% ya vijana vijijini wamehisi kutengwa"
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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Changamoto za Kujenga Amani | Peacebuilding Challenges
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Amani Verse inashughulikia changamoto maalum za kujenga amani Kenya kwa kutumia teknolojia ya kisasa na mbinu za kitamaduni
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {challenges.map((challenge) => {
            const IconComponent = challenge.icon;
            return (
              <Card 
                key={challenge.id}
                className="p-6 bg-card/80 backdrop-blur-sm border-accent/20 shadow-story hover:shadow-warm transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <Badge className={getSeverityColor(challenge.severity)}>
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
                    <div className="bg-accent-light/50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-accent-foreground">
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
        <Card className="max-w-4xl mx-auto mt-12 p-8 bg-peace-gradient border-0 shadow-peace">
          <div className="text-center text-primary-foreground">
            <h3 className="text-2xl font-bold mb-4">Our Targeted Response</h3>
            <p className="text-lg leading-relaxed">
              Amani Verse haijengwi tu kama jukwaa la mazungumzo - ni silaha ya teknolojia iliyoundwa kukabiliana na changamoto hizi maalum. 
              Tunatumia AI, sauti ya mtu, na ushirikiano wa jamii kujenga uongozi wa amani unaozuia na kushughilia matatizo haya ya kimsingi.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default PeacebuildingChallenges;