import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Radio, 
  Users, 
  Download, 
  Wifi, 
  MessageSquare, 
  MapPin,
  Zap,
  HardDrive,
  Share2
} from "lucide-react";

const OfflineAccess = () => {
  const offlineStrategies = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "SMS Integration | Ujumbe wa SMS",
      description: "Share stories and participate via SMS text messages, even without internet connectivity",
      details: "Send voice recordings via WhatsApp when internet is available, or use SMS for text-based participation",
      availability: "Available Now"
    },
    {
      icon: <Radio className="w-6 h-6" />,
      title: "Community Radio | Redio ya Kijamii",
      description: "Partner with local radio stations to broadcast selected peace stories and community updates",
      details: "Weekly radio shows featuring youth voices, call-in segments, and community announcements",
      availability: "Rolling Out"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Offline App Mode | Programu Nje ya Mtandao",
      description: "Download content when internet is available, access and create content offline",
      details: "Cache stories, record offline, sync when connection returns",
      availability: "In Development"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Ambassadors | Wabalozi wa Kijamii",
      description: "Trained local youth collect and share stories from their communities",
      details: "Digital storytelling workshops, community recording sessions, and story collection drives",
      availability: "Active Program"
    }
  ];

  const accessPoints = [
    {
      type: "Internet Cafes",
      locations: "Urban Centers",
      cost: "KSh 20-50/hour",
      features: ["Full platform access", "Story upload", "Community interaction"]
    },
    {
      type: "Community Centers",
      locations: "Rural Areas",
      cost: "Free",
      features: ["Scheduled access", "Group sessions", "Digital literacy training"]
    },
    {
      type: "Schools",
      locations: "Educational Institutions",
      cost: "Free for students",
      features: ["Educational programs", "Peace curriculum", "Youth workshops"]
    },
    {
      type: "Mobile Clinics",
      locations: "Remote Villages",
      cost: "Free",
      features: ["Traveling tech support", "Story collection", "Community events"]
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Kufikia Bila Mtandao | Reaching Beyond Internet Access
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tunajua kuwa watu wengi huko Kenya hawana upatikanaji wa mtandao wa kila wakati. 
            Hapa kuna njia zetu za kuhakikisha kila sauti inasikika.
          </p>
        </div>

        {/* Offline Strategies */}
        <div className="max-w-6xl mx-auto mb-16">
          <h3 className="text-2xl font-semibold mb-8 text-center text-foreground">
            Mikakati ya Ufikivu | Access Strategies
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {offlineStrategies.map((strategy, index) => (
              <Card key={index} className="p-6 bg-card/80 backdrop-blur-sm border-accent/20 shadow-story hover:shadow-warm transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="text-primary-foreground">{strategy.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-card-foreground mb-2">{strategy.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                      <p className="text-xs text-muted-foreground mb-3">{strategy.details}</p>
                      <Badge className={
                        strategy.availability === "Available Now" ? "bg-success text-success-foreground" :
                        strategy.availability === "Active Program" ? "bg-primary text-primary-foreground" :
                        strategy.availability === "Rolling Out" ? "bg-warning text-warning-foreground" :
                        "bg-accent text-accent-foreground"
                      }>
                        {strategy.availability}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Access Points */}
        <div className="max-w-6xl mx-auto mb-16">
          <h3 className="text-2xl font-semibold mb-8 text-center text-foreground">
            Mahali pa Kufikia | Access Points Across Kenya
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {accessPoints.map((point, index) => (
              <Card key={index} className="p-6 bg-card/80 backdrop-blur-sm border-accent/20 shadow-story hover:shadow-warm transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <h4 className="font-semibold text-card-foreground">{point.type}</h4>
                    <p className="text-sm text-muted-foreground">{point.locations}</p>
                    <Badge className="bg-success/10 text-success mt-2">{point.cost}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {point.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                        <Zap className="w-3 h-3 mr-2 text-warning" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Solutions */}
        <Card className="max-w-4xl mx-auto mb-12 p-8 bg-card/80 backdrop-blur-sm border-accent/20 shadow-story">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
              <HardDrive className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-card-foreground">
              Suluhisho la Kiteknolojia | Technical Solutions
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-accent" />
                  <h4 className="font-medium">Progressive Web App</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Works like a mobile app, stores content locally, syncs when online
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <h4 className="font-medium">SMS Gateway</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Two-way SMS communication for story sharing and community updates
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Share2 className="w-5 h-5 text-accent" />
                  <h4 className="font-medium">Mesh Networking</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Device-to-device sharing in areas with limited connectivity
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Partnership Model */}
        <Card className="max-w-4xl mx-auto p-8 bg-community-gradient border-none shadow-warm text-warning-foreground">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold">Ushirikiano wa Kijamii | Community Partnerships</h3>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Tunashirikiana na mashirika ya kijamii, mashule, na vikundi vya kidini ili kuhakikisha 
              hakuna mtu aliyeachwa nyuma katika harakati za amani.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="text-left space-y-2">
                <h4 className="font-semibold">Local Partners:</h4>
                <ul className="space-y-1 text-sm opacity-90">
                  <li>• Community-Based Organizations (CBOs)</li>
                  <li>• Religious institutions</li>
                  <li>• Youth groups and cooperatives</li>
                  <li>• Local government offices</li>
                </ul>
              </div>
              
              <div className="text-left space-y-2">
                <h4 className="font-semibold">Services Provided:</h4>
                <ul className="space-y-1 text-sm opacity-90">
                  <li>• Digital literacy training</li>
                  <li>• Story collection workshops</li>
                  <li>• Equipment access and support</li>
                  <li>• Community dialogue facilitation</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button variant="secondary" size="lg">
                <Users className="w-5 h-5" />
                Partner with Us
              </Button>
              <Button variant="outline" size="lg" className="border-warning-foreground text-warning-foreground hover:bg-warning-foreground hover:text-warning">
                <Download className="w-5 h-5" />
                Download Partnership Guide
              </Button>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold mb-4 text-foreground">
            Kila Sauti Ina Maana | Every Voice Matters
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Mtandao au hakuna mtandao, tunahakikisha kila kijana ana njia ya kushiriki hadithi yake na kujenga amani.
          </p>
          <Button variant="peace" size="lg">
            <MessageSquare className="w-5 h-5" />
            Start Sharing Your Story Today
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OfflineAccess;