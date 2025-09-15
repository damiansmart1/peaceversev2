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
  Contrast,
  MousePointer
} from "lucide-react";

const AccessibilityFeatures = () => {
  const [voiceNavigation, setVoiceNavigation] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState([100]);
  const [audioDescription, setAudioDescription] = useState(true);
  const [screenReader, setScreenReader] = useState(false);

  const languages = [
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'kik', name: 'Gĩkũyũ', flag: '🇰🇪' },
    { code: 'luo', name: 'Dholuo', flag: '🇰🇪' },
    { code: 'kam', name: 'Kamba', flag: '🇰🇪' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Kujumuisha kwa Muundo | Inclusive by Design</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Peace Verse imeundwa kukaribishia kila mtu, bila kujali kiwango cha ujuzi wa kusoma, uwezo wa kimwili, au lugha
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
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

          {/* Language Support */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20 shadow-story md:col-span-2">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Languages className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">Language & Cultural Support</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="outline"
                    className="justify-start space-x-3 h-auto p-4"
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <div className="text-left">
                      <div className="font-medium">{lang.name}</div>
                      <div className="text-xs text-muted-foreground">Voice supported</div>
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
                      All features work with voice commands and audio feedback, making PeaceVerse accessible 
                      regardless of literacy level or reading ability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Accessibility Statement */}
        <Card className="max-w-3xl mx-auto mt-12 p-8 bg-story-gradient border-accent/20 shadow-story">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
              <Accessibility className="w-8 h-8 text-success-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-card-foreground">Our Commitment to Inclusion</h3>
            <p className="text-muted-foreground leading-relaxed">
              PeaceVerse is designed with universal accessibility in mind. We believe every young person, 
              regardless of their abilities or circumstances, deserves to have their voice heard and to 
              participate in building peace.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              <Badge className="bg-success text-success-foreground">WCAG 2.1 AA Compliant</Badge>
              <Badge className="bg-primary text-primary-foreground">Voice-First Design</Badge>
              <Badge className="bg-accent text-accent-foreground">Multi-Language Support</Badge>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default AccessibilityFeatures;