import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  UserX, 
  AlertTriangle,
  Fingerprint,
  Globe,
  MessageCircle,
  Phone,
  Heart,
  Crown
} from "lucide-react";

const SafetyProtectionSection = () => {
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);
  const [secureMode, setSecureMode] = useState(true);

  const safetyFeatures = [
    {
      id: "anonymous-participation",
      icon: EyeOff,
      title: "Anonymous Participation",
      description: "Shiriki hadithi bila kutambulika",
      details: [
        "Voice modification technology",
        "No personal data collection", 
        "Untraceable story submissions",
        "Anonymous voting & commenting"
      ],
      riskLevel: "low",
      userControl: "full"
    },
    {
      id: "secure-encryption",
      icon: Lock,
      title: "End-to-End Encryption",
      description: "Mawasiliano yote yamehifadhiwa",
      details: [
        "Military-grade encryption",
        "Encrypted voice messages",
        "Secure file transfers",
        "Zero-knowledge architecture"
      ],
      riskLevel: "minimal", 
      userControl: "automatic"
    },
    {
      id: "anti-surveillance",
      icon: Shield,
      title: "Anti-Surveillance Protection",
      description: "Kujificha na mifumo ya ufuatiliaji",
      details: [
        "VPN integration",
        "Traffic obfuscation",
        "Metadata scrubbing",
        "Decentralized hosting"
      ],
      riskLevel: "low",
      userControl: "enabled"
    },
    {
      id: "identity-protection",
      icon: UserX,
      title: "Identity Shielding",
      description: "Kulinda utambulisho wa kibinafsi",
      details: [
        "Temporary user IDs",
        "Location masking",
        "Device fingerprint blocking",
        "Social graph protection"
      ],
      riskLevel: "minimal",
      userControl: "full"
    }
  ];

  const crisisProtocols = [
    {
      title: "Immediate Threat Response",
      description: "Hatua za haraka kwa mazingira ya hatari",
      actions: [
        "Panic button for instant deletion",
        "Emergency contact alerts", 
        "Safe house directory access",
        "Legal aid connections"
      ],
      response: "<5 minutes"
    },
    {
      title: "Digital Security Training",
      description: "Mafunzo ya usalama wa kidijitali",
      actions: [
        "Security awareness workshops",
        "Safe communication practices",
        "Privacy protection guides",
        "Threat assessment tools"
      ],
      response: "Ongoing"
    },
    {
      title: "Psychosocial Support",
      description: "Msaada wa kisaikolojia na kijamii",
      actions: [
        "Trauma counseling referrals",
        "Peer support networks",
        "Mental health resources",
        "Community healing circles"
      ],
      response: "24/7 access"
    }
  ];

  const threatMitigation = [
    {
      threat: "Online Harassment",
      mitigation: "Advanced blocking, community moderation, quick reporting",
      success: "94%"
    },
    {
      threat: "Political Targeting", 
      mitigation: "Anonymous modes, encryption, identity protection",
      success: "98%"
    },
    {
      threat: "Surveillance Risks",
      mitigation: "VPN, metadata scrubbing, decentralized architecture", 
      success: "96%"
    },
    {
      threat: "Social Pressure",
      mitigation: "Peer networks, community support, safe spaces",
      success: "89%"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Usalama na Ulinzi | Safety & Protection
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Kulinda vijana walio kwenye hatari za kisiasa, ujamii, na za kimfumo
          </p>
        </div>

        {/* Safety Controls Demo */}
        <Card className="max-w-4xl mx-auto mb-12 p-8 bg-card/80 backdrop-blur-sm shadow-story">
          <h3 className="text-xl font-semibold mb-6 text-card-foreground text-center">
            Personal Safety Controls | Udhibiti wa Usalama
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-card-foreground">Anonymous Mode</div>
                  <div className="text-xs text-muted-foreground">Hide your identity completely</div>
                </div>
                <Switch 
                  checked={anonymousMode} 
                  onCheckedChange={setAnonymousMode}
                />
              </div>
              {anonymousMode && (
                <div className="bg-success/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <EyeOff className="w-4 h-4 text-success" />
                    <span className="text-xs text-success-foreground">Identity protected</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-card-foreground">Location Sharing</div>
                  <div className="text-xs text-muted-foreground">Share your general location</div>
                </div>
                <Switch 
                  checked={locationSharing} 
                  onCheckedChange={setLocationSharing}
                />
              </div>
              {!locationSharing && (
                <div className="bg-primary/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="text-xs text-primary-foreground">Location hidden</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-card-foreground">Secure Mode</div>
                  <div className="text-xs text-muted-foreground">Maximum security enabled</div>
                </div>
                <Switch 
                  checked={secureMode} 
                  onCheckedChange={setSecureMode}
                />
              </div>
              {secureMode && (
                <div className="bg-warning/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-warning" />
                    <span className="text-xs text-warning-foreground">Full protection active</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Safety Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {safetyFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card key={feature.id} className="p-6 bg-card/80 backdrop-blur-sm shadow-story">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <Badge 
                      className={
                        feature.riskLevel === 'minimal' ? 'bg-success text-success-foreground' :
                        feature.riskLevel === 'low' ? 'bg-primary text-primary-foreground' :
                        'bg-warning text-warning-foreground'
                      }
                    >
                      {feature.riskLevel}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1 text-card-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                    
                    <div className="space-y-2">
                      {feature.details.map((detail, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                          <span className="text-xs text-card-foreground">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-accent-light/30 rounded p-2">
                    <p className="text-xs text-accent-foreground">
                      <span className="font-medium">User Control:</span> {feature.userControl}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Crisis Response Protocols */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
            Mipango ya Dharura | Crisis Response Protocols
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {crisisProtocols.map((protocol, index) => (
              <Card key={index} className="p-6 bg-card/80 backdrop-blur-sm shadow-story">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                    <h4 className="font-semibold text-card-foreground">{protocol.title}</h4>
                    <p className="text-sm text-muted-foreground">{protocol.description}</p>
                  </div>

                  <div className="space-y-2">
                    {protocol.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-center space-x-2">
                        <Heart className="w-3 h-3 text-destructive" />
                        <span className="text-xs text-card-foreground">{action}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-destructive/10 rounded p-3 text-center">
                    <p className="text-sm font-medium text-destructive">
                      Response Time: {protocol.response}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Threat Mitigation Stats */}
        <Card className="max-w-4xl mx-auto p-8 bg-card/80 backdrop-blur-sm shadow-story">
          <h3 className="text-xl font-semibold mb-6 text-card-foreground text-center">
            Kuzuia Hatari | Threat Mitigation Effectiveness
          </h3>
          
          <div className="space-y-4">
            {threatMitigation.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-card-foreground">{item.threat}</h4>
                  <p className="text-sm text-muted-foreground">{item.mitigation}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-success">{item.success}</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Safety Guarantee */}
        <Card className="max-w-4xl mx-auto mt-12 p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="text-center">
            <Crown className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-card-foreground mb-4">Ahadi ya Ulinzi | Protection Guarantee</h3>
            <p className="text-muted-foreground leading-relaxed">
              Kila kijana kwenye Amani Verse ana haki ya kujisikia salama wakati wa kushiriki mazungumzo ya amani. 
              Hatutoi ahadi za uwongo - tunatoa ulinzi wa kweli kupitia teknolojia ya kisasa na mkakati wa jamii.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default SafetyProtectionSection;