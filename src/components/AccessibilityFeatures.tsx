import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Volume2, 
  Eye, 
  Type, 
  Languages, 
  Headphones, 
  Accessibility,
  Wifi,
  WifiOff,
  Smartphone,
  Globe,
  Mic,
  MessageSquare
} from "lucide-react";
import accessibilityInclusion from "@/assets/accessibility-inclusion.jpg";

const AccessibilityFeatures = () => {
  const [voiceNavigation, setVoiceNavigation] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState([100]);
  const [audioDescription, setAudioDescription] = useState(true);
  const [screenReader, setScreenReader] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', speakers: '700M+' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', speakers: '300M+' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', speakers: '100M+' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', speakers: '400M+' },
    { code: 'pt', name: 'Português', flag: '🇵🇹', speakers: '250M+' },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹', speakers: '50M+' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬', speakers: '70M+' },
    { code: 'yo', name: 'Yorùbá', flag: '🇳🇬', speakers: '45M+' },
    { code: 'zu', name: 'isiZulu', flag: '🇿🇦', speakers: '27M+' },
    { code: 'so', name: 'Soomaali', flag: '🇸🇴', speakers: '20M+' },
    { code: 'ig', name: 'Igbo', flag: '🇳🇬', speakers: '45M+' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼', speakers: '12M+' },
  ];

  const accessibilityFeatures = [
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Optimized for smartphones - the primary internet device across Africa"
    },
    {
      icon: WifiOff,
      title: "Offline Capability",
      description: "Report incidents and access critical info without internet connection"
    },
    {
      icon: Mic,
      title: "Voice Reporting",
      description: "Submit reports verbally in your local language"
    },
    {
      icon: MessageSquare,
      title: "SMS Integration",
      description: "Report via SMS for feature phones and low-connectivity areas"
    }
  ];

  return (
    <section className="space-y-12">
      <div className="relative w-full rounded-lg overflow-hidden h-80">
        <img
          src={accessibilityInclusion}
          alt="Diverse people including those with disabilities participating equally in community activities"
          className="w-full h-full object-cover"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-foreground">
          <h2 className="text-4xl font-bold mb-2">Inclusive by Design</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Peaceverse is built for everyone - regardless of literacy level, connectivity, or ability
          </p>
        </div>
      </div>

      {/* Key Accessibility Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {accessibilityFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="p-5 hover:shadow-elevated transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Voice & Audio Features */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20 shadow-story">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-voice-active rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Voice & Audio</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-card-foreground">Voice Navigation</div>
                  <div className="text-xs text-muted-foreground">Navigate using voice commands</div>
                </div>
                <Switch 
                  checked={voiceNavigation} 
                  onCheckedChange={setVoiceNavigation}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-card-foreground">Audio Descriptions</div>
                  <div className="text-xs text-muted-foreground">Describe visual content audibly</div>
                </div>
                <Switch 
                  checked={audioDescription} 
                  onCheckedChange={setAudioDescription}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-card-foreground">Screen Reader Support</div>
                  <div className="text-xs text-muted-foreground">Optimized for screen readers</div>
                </div>
                <Switch 
                  checked={screenReader} 
                  onCheckedChange={setScreenReader}
                />
              </div>
            </div>

            <Button variant="voice" className="w-full">
              <Headphones className="w-4 h-4" />
              Test Audio Features
            </Button>
          </div>
        </Card>

        {/* Visual & Display Features */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20 shadow-story">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Visual & Display</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-card-foreground">High Contrast Mode</div>
                  <div className="text-xs text-muted-foreground">Enhanced visibility</div>
                </div>
                <Switch 
                  checked={highContrast} 
                  onCheckedChange={setHighContrast}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-card-foreground">Text Size</div>
                  <div className="text-xs text-muted-foreground">{textSize[0]}%</div>
                </div>
                <Slider
                  value={textSize}
                  onValueChange={setTextSize}
                  max={200}
                  min={75}
                  step={25}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <Type className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-card-foreground" style={{ fontSize: `${textSize[0]}%` }}>
                  Sample text at current size
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Language Support */}
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20 shadow-story">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Languages className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-card-foreground">African Languages</h3>
                <p className="text-sm text-muted-foreground">12 languages with voice support</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <Globe className="w-3 h-3 mr-1" />
              1B+ Speakers
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant="outline"
                className="justify-start space-x-3 h-auto p-3"
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="text-left">
                  <div className="font-medium text-sm">{lang.name}</div>
                  <div className="text-xs text-muted-foreground">{lang.speakers}</div>
                </div>
              </Button>
            ))}
          </div>

          <div className="bg-accent-light rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Accessibility className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <h4 className="font-medium text-accent-foreground mb-1">Voice-First Design</h4>
                <p className="text-sm text-accent-foreground/80">
                  All features work with voice commands and audio feedback, making Peaceverse accessible 
                  regardless of literacy level. Report incidents, receive alerts, and navigate the platform 
                  entirely through voice in your local language.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Accessibility Statement */}
      <Card className="p-8 bg-story-gradient border-accent/20 shadow-story">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
            <Accessibility className="w-8 h-8 text-success-foreground" />
          </div>
          <h3 className="text-2xl font-semibold text-card-foreground">Our Commitment to Inclusion</h3>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Peaceverse is built with universal accessibility as a core principle. We believe every person 
            across Africa, regardless of their abilities, connectivity, or circumstances, deserves access 
            to safety information and the ability to contribute to peace in their communities.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            <Badge className="bg-success text-success-foreground">WCAG 2.1 AA Compliant</Badge>
            <Badge className="bg-primary text-primary-foreground">Voice-First Design</Badge>
            <Badge className="bg-accent text-accent-foreground">12 African Languages</Badge>
            <Badge className="bg-warning text-warning-foreground">Offline Capable</Badge>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default AccessibilityFeatures;
