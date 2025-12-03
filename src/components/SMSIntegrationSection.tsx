import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Phone, Send, Users, Globe, 
  Shield, Zap, CheckCircle, ArrowRight, Smartphone
} from 'lucide-react';

const SMSIntegrationSection = () => {
  const [demoPhone, setDemoPhone] = useState('+254');
  const [demoMessage, setDemoMessage] = useState('');

  const smsCommands = [
    { command: 'HELP', description: 'Get list of available commands', example: 'HELP' },
    { command: 'REPORT', description: 'Report an incident', example: 'REPORT Nairobi Market fire near gate' },
    { command: 'ALERT', description: 'Get active alerts in your area', example: 'ALERT' },
    { command: 'STATUS', description: 'Check your report status', example: 'STATUS RPT-123456' },
    { command: 'SAFE', description: 'Find nearby safe spaces', example: 'SAFE' }
  ];

  const ussdFlow = [
    { step: 1, title: 'Dial *384*PEACE#', description: 'Access the Peaceverse USSD menu' },
    { step: 2, title: 'Select Option', description: 'Choose from Report, Alerts, Status, or Safe Spaces' },
    { step: 3, title: 'Follow Prompts', description: 'Enter required information step by step' },
    { step: 4, title: 'Confirm & Submit', description: 'Review and submit your request' }
  ];

  const features = [
    { icon: Globe, title: 'Works Everywhere', description: 'No internet needed - works on any basic phone' },
    { icon: Shield, title: 'Secure & Private', description: 'End-to-end encrypted communications' },
    { icon: Zap, title: 'Instant Delivery', description: 'Real-time alerts and confirmations' },
    { icon: Users, title: 'Community Reach', description: 'Connect marginalized communities' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
          <Phone className="w-3 h-3 mr-1" />
          Offline Access
        </Badge>
        <h2 className="text-3xl font-bold mb-2">SMS & USSD Integration</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Access Peaceverse from any phone, anywhere. Report incidents, receive alerts, 
          and find safety resources without internet connectivity.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {features.map((feature, index) => (
          <Card key={index} className="text-center p-4 hover:shadow-lg transition-shadow">
            <feature.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">{feature.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="sms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            SMS Commands
          </TabsTrigger>
          <TabsTrigger value="ussd" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            USSD Menu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                SMS Commands
              </CardTitle>
              <CardDescription>
                Send these commands to <span className="font-mono text-primary">+254 XXX PEACE</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {smsCommands.map((cmd, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Badge variant="outline" className="font-mono shrink-0">
                      {cmd.command}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{cmd.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                        Example: {cmd.example}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Demo Section */}
              <div className="mt-6 p-4 border rounded-lg bg-background">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Try a Demo
                </h4>
                <div className="grid gap-3">
                  <Input
                    placeholder="Your phone number"
                    value={demoPhone}
                    onChange={(e) => setDemoPhone(e.target.value)}
                  />
                  <Input
                    placeholder="Enter a command (e.g., HELP)"
                    value={demoMessage}
                    onChange={(e) => setDemoMessage(e.target.value)}
                  />
                  <Button className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Test Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ussd" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                USSD Quick Access
              </CardTitle>
              <CardDescription>
                Dial <span className="font-mono text-primary font-bold">*384*PEACE#</span> from any phone
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* USSD Flow */}
              <div className="space-y-4">
                {ussdFlow.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    {index < ussdFlow.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground mt-2" />
                    )}
                  </div>
                ))}
              </div>

              {/* USSD Menu Preview */}
              <div className="mt-6 p-4 bg-muted rounded-lg font-mono text-sm">
                <div className="border-2 border-foreground/20 rounded-lg p-4 bg-background">
                  <p className="text-center mb-3 font-bold">Peaceverse Early Warning</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>1. Report Incident</p>
                    <p>2. View Alerts</p>
                    <p>3. Check Report Status</p>
                    <p>4. Find Safe Spaces</p>
                    <p>5. Change Language</p>
                    <p>0. Exit</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-dashed">
                    <p className="text-xs text-center text-muted-foreground">
                      Reply with option number
                    </p>
                  </div>
                </div>
              </div>

              {/* Supported Languages */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">English</Badge>
                <Badge variant="secondary">Kiswahili</Badge>
                <Badge variant="secondary">Français</Badge>
                <Badge variant="secondary">العربية</Badge>
                <Badge variant="secondary">Amharic</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Status */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <div>
              <h3 className="font-semibold">Ready for Deployment</h3>
              <p className="text-sm text-muted-foreground">
                SMS/USSD integration is configured and ready. Connect your preferred 
                provider (Africa's Talking, Twilio, Safaricom) to enable.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSIntegrationSection;
