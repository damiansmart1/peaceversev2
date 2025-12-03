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
import { useTranslationContext } from './TranslationProvider';

const SafetyProtectionSection = () => {
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);
  const [secureMode, setSecureMode] = useState(true);
  const { t } = useTranslationContext();

  const safetyFeatures = [
    {
      id: "anonymous-participation",
      icon: EyeOff,
      title: t('safety.protection.anonymousParticipation.title'),
      description: t('safety.protection.anonymousParticipation.description'),
      details: [
        t('safety.protection.anonymousParticipation.detail1'),
        t('safety.protection.anonymousParticipation.detail2'), 
        t('safety.protection.anonymousParticipation.detail3'),
        t('safety.protection.anonymousParticipation.detail4')
      ],
      riskLevel: "low",
      userControl: t('safety.protection.userControl.full')
    },
    {
      id: "secure-encryption",
      icon: Lock,
      title: t('safety.protection.encryption.title'),
      description: t('safety.protection.encryption.description'),
      details: [
        t('safety.protection.encryption.detail1'),
        t('safety.protection.encryption.detail2'),
        t('safety.protection.encryption.detail3'),
        t('safety.protection.encryption.detail4')
      ],
      riskLevel: "minimal", 
      userControl: t('safety.protection.userControl.automatic')
    },
    {
      id: "anti-surveillance",
      icon: Shield,
      title: t('safety.protection.antiSurveillance.title'),
      description: t('safety.protection.antiSurveillance.description'),
      details: [
        t('safety.protection.antiSurveillance.detail1'),
        t('safety.protection.antiSurveillance.detail2'),
        t('safety.protection.antiSurveillance.detail3'),
        t('safety.protection.antiSurveillance.detail4')
      ],
      riskLevel: "low",
      userControl: t('safety.protection.userControl.enabled')
    },
    {
      id: "identity-protection",
      icon: UserX,
      title: t('safety.protection.identityShielding.title'),
      description: t('safety.protection.identityShielding.description'),
      details: [
        t('safety.protection.identityShielding.detail1'),
        t('safety.protection.identityShielding.detail2'),
        t('safety.protection.identityShielding.detail3'),
        t('safety.protection.identityShielding.detail4')
      ],
      riskLevel: "minimal",
      userControl: t('safety.protection.userControl.full')
    }
  ];

  const crisisProtocols = [
    {
      title: t('safety.protection.crisis.immediateResponse.title'),
      description: t('safety.protection.crisis.immediateResponse.description'),
      actions: [
        t('safety.protection.crisis.immediateResponse.action1'),
        t('safety.protection.crisis.immediateResponse.action2'), 
        t('safety.protection.crisis.immediateResponse.action3'),
        t('safety.protection.crisis.immediateResponse.action4')
      ],
      response: t('safety.protection.crisis.immediateResponse.time')
    },
    {
      title: t('safety.protection.crisis.digitalSecurity.title'),
      description: t('safety.protection.crisis.digitalSecurity.description'),
      actions: [
        t('safety.protection.crisis.digitalSecurity.action1'),
        t('safety.protection.crisis.digitalSecurity.action2'),
        t('safety.protection.crisis.digitalSecurity.action3'),
        t('safety.protection.crisis.digitalSecurity.action4')
      ],
      response: t('safety.protection.crisis.digitalSecurity.time')
    },
    {
      title: t('safety.protection.crisis.psychosocial.title'),
      description: t('safety.protection.crisis.psychosocial.description'),
      actions: [
        t('safety.protection.crisis.psychosocial.action1'),
        t('safety.protection.crisis.psychosocial.action2'),
        t('safety.protection.crisis.psychosocial.action3'),
        t('safety.protection.crisis.psychosocial.action4')
      ],
      response: t('safety.protection.crisis.psychosocial.time')
    }
  ];

  const threatMitigation = [
    {
      threat: t('safety.protection.threats.onlineHarassment.threat'),
      mitigation: t('safety.protection.threats.onlineHarassment.mitigation'),
      success: "94%"
    },
    {
      threat: t('safety.protection.threats.politicalTargeting.threat'), 
      mitigation: t('safety.protection.threats.politicalTargeting.mitigation'),
      success: "98%"
    },
    {
      threat: t('safety.protection.threats.surveillance.threat'),
      mitigation: t('safety.protection.threats.surveillance.mitigation'), 
      success: "96%"
    },
    {
      threat: t('safety.protection.threats.socialPressure.threat'),
      mitigation: t('safety.protection.threats.socialPressure.mitigation'),
      success: "89%"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            {t('safety.protection.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('safety.protection.subtitle')}
          </p>
        </div>

        {/* Safety Controls Demo */}
        <Card className="max-w-4xl mx-auto mb-12 p-8 bg-card/80 backdrop-blur-sm shadow-story">
          <h3 className="text-xl font-semibold mb-6 text-card-foreground text-center">
            {t('safety.protection.personalControls')}
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-card-foreground">{t('safety.protection.controls.anonymousMode')}</div>
                  <div className="text-xs text-muted-foreground">{t('safety.protection.controls.anonymousModeDesc')}</div>
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
                    <span className="text-xs text-success-foreground">{t('safety.protection.controls.identityProtected')}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-card-foreground">{t('safety.protection.controls.locationSharing')}</div>
                  <div className="text-xs text-muted-foreground">{t('safety.protection.controls.locationSharingDesc')}</div>
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
                    <span className="text-xs text-primary-foreground">{t('safety.protection.controls.locationHidden')}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-card-foreground">{t('safety.protection.controls.secureMode')}</div>
                  <div className="text-xs text-muted-foreground">{t('safety.protection.controls.secureModeDesc')}</div>
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
                    <span className="text-xs text-warning-foreground">{t('safety.protection.controls.fullProtection')}</span>
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
                      <span className="font-medium">{t('safety.protection.userControlLabel')}:</span> {feature.userControl}
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
            {t('safety.protection.crisisProtocols')}
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
                      {t('safety.protection.responseTime')}: {protocol.response}
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
            {t('safety.protection.threatMitigation')}
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
                  <div className="text-xs text-muted-foreground">{t('safety.protection.successRate')}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Safety Guarantee */}
        <Card className="max-w-4xl mx-auto mt-12 p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="text-center">
            <Crown className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-card-foreground mb-4">{t('safety.protection.protectionGuarantee')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('safety.protection.protectionGuaranteeText')}
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default SafetyProtectionSection;
