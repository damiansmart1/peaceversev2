import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, Users, Heart, Handshake, Shield, Award, ExternalLink, Mail } from "lucide-react";
const DonorShowcase = () => {
  const partnerCategories = [{
    title: "International Organizations",
    icon: Globe,
    partners: [{
      name: "African Union",
      type: "Strategic Partner",
      description: "Continental coordination and policy alignment"
    }, {
      name: "United Nations",
      type: "Technical Partner",
      description: "Integration with UN early warning mechanisms"
    }, {
      name: "ECOWAS",
      type: "Regional Partner",
      description: "West African conflict prevention collaboration"
    }, {
      name: "IGAD",
      type: "Regional Partner",
      description: "Horn of Africa security coordination"
    }]
  }, {
    title: "Government Partners",
    icon: Building2,
    partners: [{
      name: "Kenya Ministry of Interior",
      type: "National Partner",
      description: "Pilot country implementation"
    }, {
      name: "Rwanda Peace Commission",
      type: "National Partner",
      description: "Community reconciliation integration"
    }, {
      name: "Ghana National Peace Council",
      type: "National Partner",
      description: "Election monitoring support"
    }, {
      name: "South Africa DPCI",
      type: "National Partner",
      description: "Cross-border crime intelligence"
    }]
  }, {
    title: "Technology & Research",
    icon: Shield,
    partners: [{
      name: "African Leadership University",
      type: "Research Partner",
      description: "Data analysis and academic research"
    }, {
      name: "iHub Kenya",
      type: "Tech Partner",
      description: "Innovation and product development"
    }, {
      name: "Andela",
      type: "Tech Partner",
      description: "Engineering talent and capacity building"
    }, {
      name: "Google.org",
      type: "Funding Partner",
      description: "AI and machine learning support"
    }]
  }];
  const supportTiers = [{
    name: "Community Partner",
    amount: "$1,000 - $10,000",
    benefits: ["Recognition on platform", "Quarterly impact reports", "Partner network access"],
    color: "bg-accent"
  }, {
    name: "Regional Partner",
    amount: "$10,000 - $50,000",
    benefits: ["All Community benefits", "Regional implementation support", "Custom data dashboards", "Priority feature requests"],
    color: "bg-primary"
  }, {
    name: "Strategic Partner",
    amount: "$50,000+",
    benefits: ["All Regional benefits", "Advisory board seat", "White-label deployment option", "Dedicated account manager", "API integration support"],
    color: "bg-success"
  }];
  const impactStats = [{
    value: "47",
    label: "Active Countries"
  }, {
    value: "$2.4M",
    label: "Funds Deployed"
  }, {
    value: "340+",
    label: "Conflicts Prevented"
  }, {
    value: "156K",
    label: "Users Protected"
  }];
  return <section className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">Partners & Supporters</Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-peace-gradient bg-clip-text text-transparent">
            Building Peace Together
          </span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Peaceverse is powered by a coalition of governments, international organizations, 
          tech partners, and civil society working together for African peace and security.
        </p>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {impactStats.map((stat, index) => <Card key={index} className="p-6 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
            <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>)}
      </div>

      {/* Partner Categories */}
      <div className="space-y-8">
        {partnerCategories.map((category, catIndex) => {
        const Icon = category.icon;
        return <Card key={catIndex} className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {category.partners.map((partner, partnerIndex) => <div key={partnerIndex} className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{partner.name}</h4>
                      <Badge variant="outline" className="text-xs">{partner.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{partner.description}</p>
                  </div>)}
              </div>
            </Card>;
      })}
      </div>

      {/* Partnership Tiers */}
      <div>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-2">Become a Partner</h3>
          <p className="text-muted-foreground">Join our mission to build Africa's premier early warning system</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {supportTiers.map((tier, index) => <Card key={index} className="p-6 hover:shadow-elevated transition-all duration-300 border-2 hover:border-primary/20">
              <div className={`w-12 h-12 ${tier.color} rounded-full flex items-center justify-center mb-4`}>
                <Award className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-2">{tier.name}</h4>
              <div className="text-2xl font-bold text-primary mb-4">{tier.amount}</div>
              <ul className="space-y-2 mb-6">
                {tier.benefits.map((benefit, benefitIndex) => <li key={benefitIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Handshake className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    {benefit}
                  </li>)}
              </ul>
              <Button variant="outline" className="w-full">
                Learn More
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Card>)}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">Partner with Peaceverse</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join leading organizations in supporting Africa's most comprehensive early warning platform. 
            Your partnership directly contributes to preventing conflicts and protecting communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="peace" size="lg">
              <Handshake className="w-5 h-5 mr-2" />
              Become a Partner
            </Button>
            <Button variant="outline" size="lg">
              <Mail className="w-5 h-5 mr-2" />
              Contact Us
            </Button>
          </div>
        </div>
      </Card>

      {/* Recognition */}
      <Card className="p-6 bg-muted/50">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">Recognition</Badge>
          <p className="text-muted-foreground mb-6">
            Peaceverse has been recognized by leading organizations for innovation in peacebuilding technology
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-primary/10 text-primary px-4 py-2">​NURU TRUST  NETWORK </Badge>
            <Badge className="bg-accent/10 text-accent px-4 py-2">UN Peace Tech Finalist</Badge>
            <Badge className="bg-success/10 text-success px-4 py-2">Google.org Grantee</Badge>
            <Badge className="bg-warning/10 text-warning px-4 py-2">Forbes 30 Under 30 Africa</Badge>
          </div>
        </div>
      </Card>
    </section>;
};
export default DonorShowcase;