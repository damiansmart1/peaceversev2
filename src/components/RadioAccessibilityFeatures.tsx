import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Accessibility, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Volume2, 
  Type, 
  Languages,
  Download,
  Signal,
  Battery
} from 'lucide-react';

const RadioAccessibilityFeatures = () => {
  const [features, setFeatures] = useState({
    lowBandwidth: true,
    offlineMode: false,
    highContrast: false,
    largeText: false,
    voicePrompts: true,
    autoTranscript: true,
    smsUpdates: false
  });

  const toggleFeature = (feature: keyof typeof features) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const accessibilityOptions = [
    {
      id: 'lowBandwidth',
      title: 'Low Bandwidth Mode',
      description: 'Optimized for slow internet connections (2G/3G)',
      icon: Signal,
      enabled: features.lowBandwidth
    },
    {
      id: 'offlineMode',
      title: 'Offline Access',
      description: 'Download content for offline listening',
      icon: WifiOff,
      enabled: features.offlineMode
    },
    {
      id: 'highContrast',
      title: 'High Contrast',
      description: 'Enhanced visibility for visual impairments',
      icon: Accessibility,
      enabled: features.highContrast
    },
    {
      id: 'largeText',
      title: 'Large Text',
      description: 'Increased font size for better readability',
      icon: Type,
      enabled: features.largeText
    },
    {
      id: 'voicePrompts',
      title: 'Voice Prompts',
      description: 'Audio navigation assistance',
      icon: Volume2,
      enabled: features.voicePrompts
    },
    {
      id: 'autoTranscript',
      title: 'Auto Transcription',
      description: 'Real-time text of audio content',
      icon: Languages,
      enabled: features.autoTranscript
    },
    {
      id: 'smsUpdates',
      title: 'SMS Updates',
      description: 'Receive program updates via SMS',
      icon: Smartphone,
      enabled: features.smsUpdates
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-4">
            <Wifi className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">2G+</div>
            <div className="text-sm text-muted-foreground">Compatible</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-4">
            <Languages className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm text-muted-foreground">Languages</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-4">
            <Download className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">12MB</div>
            <div className="text-sm text-muted-foreground">App Size</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-4">
            <Battery className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">Low</div>
            <div className="text-sm text-muted-foreground">Power Usage</div>
          </CardContent>
        </Card>
      </div>

      {/* Accessibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Accessibility Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {accessibilityOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div key={option.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <IconComponent className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={option.id} className="font-medium cursor-pointer">
                        {option.title}
                      </Label>
                      {option.enabled && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={option.id}
                  checked={option.enabled}
                  onCheckedChange={() => toggleFeature(option.id as keyof typeof features)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Mobile Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile & Rural Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Low-Resource Optimization</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  Adaptive bitrate streaming
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  Compressed audio formats
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  Minimal data usage
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  Battery-efficient design
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Alternative Access Methods</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                  SMS-based interaction
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                  USSD code access
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                  Offline content caching
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                  Community listening hubs
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">Emergency Broadcasting</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Critical peace messaging and conflict alerts are prioritized and delivered even in low-connectivity areas.
            </p>
            <Button variant="outline" size="sm">
              Enable Emergency Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RadioAccessibilityFeatures;