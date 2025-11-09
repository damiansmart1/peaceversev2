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

const CommunityTrustSection = () => {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);

  const trustBuilders = [
    {
      id: "elder-partnership",
      icon: Crown,
      title: "Elder Partnership",
      description: "Collaborative leadership with community elders and religious leaders",
      features: [
        "Elder council advisory board",
        "Traditional wisdom integration", 
        "Cultural protocol guidance",
        "Intergenerational dialogue facilitation"
      ],
      impact: "87% community approval",
      participants: "200+ community elders"
    },
    {
      id: "transparency-system", 
      icon: Eye,
      title: "Uwazi wa Shughuli",
      description: "Ufichuzi kamili wa shughuli, fedha, na maamuzi",
      features: [
        "Public impact dashboards",
        "Financial transparency reports",
        "Decision-making process visibility", 
        "Regular community updates"
      ],
      impact: "95% trust rating",
      participants: "Open to all"
    },
    {
      id: "diverse-voices",
      icon: Users,
      title: "Sauti Mbalimbali",
      description: "Kuhakikisha uwakilishi wa makundi yote ya jamii",
      features: [
        "Gender-balanced leadership",
        "Disability inclusion programs",
        "Multi-ethnic representation",
        "Youth-adult collaboration"
      ],
      impact: "78% participation across groups",
      participants: "50+ community groups"
    },
    {
      id: "proven-results",
      icon: TrendingUp,
      title: "Proven Results",
      description: "Evidence of success in peace building",
      features: [
        "Documented conflict reduction",
        "Successful mediation cases", 
        "Community healing stories",
        "Long-term impact tracking"
      ],
      impact: "23% reduction in local conflicts",
      participants: "5000+ community members"
    }
  ];

  const trustMetrics = [
    { label: "Community Leaders Endorsing", value: "340+", icon: UserCheck },
    { label: "Trust Score", value: "94/100", icon: Star },
    { label: "Cross-Community Partnerships", value: "67", icon: Handshake },
    { label: "Success Stories Verified", value: "1,200+", icon: CheckCircle2 }
  ];

  const verificationProcess = [
    {
      step: 1,
      title: "Community Nomination",
      description: "Wanajamii wanapendekeza mashindano ya amani",
      icon: Users,
      duration: "Ongoing"
    },
    {
      step: 2, 
      title: "Elder Council Review",
      description: "Wazee wanahakiki na kuthibitisha hadithi",
      icon: Crown,
      duration: "2-3 days"
    },
    {
      step: 3,
      title: "Cross-Community Validation", 
      description: "Jamii mbalimbali zinahakiki ukweli wa hadithi",
      icon: Globe,
      duration: "1 week"
    },
    {
      step: 4,
      title: "Platform Recognition",
      description: "Hadithi zilizothibitishwa zinapewa umaarufu",
      icon: Award,
      duration: "Immediate"
    }
  ];

  const successStories = [
    {
      id: "kibera-peace",
      title: "Kibera Youth Peace Initiative",
      description: "Kibera youth united to resolve community conflicts",
      impact: "40% reduction in youth conflicts",
      verified: true,
      endorsers: ["Area Chief", "Religious Leaders", "Women's Groups"],
      quote: "Peace Verse helped us speak and share without fear"
    },
    {
      id: "nakuru-harmony",
      title: "Nakuru Ethnic Harmony Project", 
      description: "Different tribes came together after conflicts",
      impact: "35 families reconciled",
      verified: true,
      endorsers: ["County Commissioner", "Traditional Elders", "Youth Leaders"],
      quote: "We got the opportunity to understand and forgive each other"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Building Community Trust  
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Bridging youth voices with cultural leadership for respected peace guidance
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
                      <div className="text-xs text-muted-foreground">Impact Achieved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-accent">{builder.participants}</div>
                      <div className="text-xs text-muted-foreground">Active Participants</div>
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
            Mchakato wa Uthibitisho | Verification Process
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
            Hadithi za Mafanikio Zilizothibitishwa | Verified Success Stories
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
                        Verified
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
                        <p className="text-sm font-medium text-card-foreground mb-2">Community Endorsers:</p>
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
            <h3 className="text-2xl font-bold text-card-foreground mb-4">Trust Commitment</h3>
            <p className="text-muted-foreground leading-relaxed">
              Peace Verse is not just a youth project - it's a partnership between youth and cultural leadership. 
              We respect culture, lead with transparency, and deliver on our commitments to the community.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CommunityTrustSection;