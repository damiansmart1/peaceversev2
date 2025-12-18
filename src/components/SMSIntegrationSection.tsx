import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Phone, Send, Users, Globe, 
  Shield, Zap, CheckCircle, ArrowRight, Smartphone,
  Activity, MapPin, Clock, RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const SMSIntegrationSection = () => {
  const [demoPhone, setDemoPhone] = useState('+254');
  const [demoMessage, setDemoMessage] = useState('');

  // Fetch USSD logs from database
  const { data: ussdLogs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['ussd-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ussd_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch USSD sessions
  const { data: ussdSessions, isLoading: sessionsLoading, refetch: refetchSessions } = useQuery({
    queryKey: ['ussd-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ussd_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate stats from logs
  const stats = {
    totalInteractions: ussdLogs?.length || 0,
    reportsSubmitted: ussdLogs?.filter(l => l.action === 'report_submitted').length || 0,
    alertViews: ussdLogs?.filter(l => l.action === 'view_alerts').length || 0,
    safeSpaceSearches: ussdLogs?.filter(l => l.action === 'find_safe_space').length || 0,
    uniqueCountries: [...new Set(ussdLogs?.map(l => l.country_code) || [])].length,
    uniqueCarriers: [...new Set(ussdLogs?.map(l => l.carrier) || [])].length,
  };

  const smsCommands = [
    { command: 'HELP', description: 'Get list of all available commands with examples', example: 'HELP' },
    { command: 'REPORT', description: 'Report an incident with location and details', example: 'REPORT Nairobi CBD protest near Kencom' },
    { command: 'ALERT', description: 'Get active alerts for your country/region', example: 'ALERT' },
    { command: 'STATUS', description: 'Check the status of your submitted report', example: 'STATUS RPT-ABC123' },
    { command: 'SAFE', description: 'Find nearby safe spaces and shelters', example: 'SAFE' },
    { command: 'SUB', description: 'Subscribe to receive location-based alerts', example: 'SUB Nairobi' },
    { command: 'UNSUB', description: 'Unsubscribe from alert notifications', example: 'UNSUB' },
    { command: 'LANG', description: 'Change your preferred language (en/sw/fr/ar/am)', example: 'LANG sw' },
    { command: 'EMERGENCY', description: 'Quick emergency report (auto-detects keywords)', example: 'Fire at Westgate Mall, people trapped' }
  ];

  const ussdFlow = [
    { step: 1, title: 'Dial *384*PEACE#', description: 'Access the Peaceverse USSD menu from any phone' },
    { step: 2, title: 'Select Language', description: 'Choose from English, Swahili, French, Arabic, or Amharic' },
    { step: 3, title: 'Choose Action', description: 'Report Incident, Emergency Quick Report, View Alerts, Check Status, Find Safe Spaces, or Subscribe to Alerts' },
    { step: 4, title: 'Enter Details', description: 'Follow guided prompts for category, severity, location, description, and anonymity options' },
    { step: 5, title: 'Confirm & Track', description: 'Receive confirmation with tracking ID for follow-up' }
  ];

  const features = [
    { icon: Globe, title: 'Works Everywhere', description: 'No internet needed - works on any basic phone' },
    { icon: Shield, title: 'Secure & Private', description: 'End-to-end encrypted communications' },
    { icon: Zap, title: 'Instant Delivery', description: 'Real-time alerts and confirmations' },
    { icon: Users, title: 'Community Reach', description: 'Connect marginalized communities' }
  ];

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'report_submitted': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'view_alerts': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'find_safe_space': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'menu_access': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'report_started': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'change_language': return 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30';
      case 'check_status': return 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

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

      {/* Live Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <Activity className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{stats.totalInteractions}</p>
          <p className="text-xs text-muted-foreground">Total Interactions</p>
        </Card>
        <Card className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <Send className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">{stats.reportsSubmitted}</p>
          <p className="text-xs text-muted-foreground">Reports Submitted</p>
        </Card>
        <Card className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <Zap className="w-6 h-6 mx-auto mb-2 text-orange-500" />
          <p className="text-2xl font-bold">{stats.alertViews}</p>
          <p className="text-xs text-muted-foreground">Alert Views</p>
        </Card>
        <Card className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <MapPin className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{stats.safeSpaceSearches}</p>
          <p className="text-xs text-muted-foreground">Safe Space Searches</p>
        </Card>
        <Card className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <Globe className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <p className="text-2xl font-bold">{stats.uniqueCountries}</p>
          <p className="text-xs text-muted-foreground">Countries Active</p>
        </Card>
        <Card className="text-center p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
          <Smartphone className="w-6 h-6 mx-auto mb-2 text-cyan-500" />
          <p className="text-2xl font-bold">{stats.uniqueCarriers}</p>
          <p className="text-xs text-muted-foreground">Carriers Connected</p>
        </Card>
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

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live Activity
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            SMS Commands
          </TabsTrigger>
          <TabsTrigger value="ussd" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            USSD Menu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Live USSD Activity Feed
                  </CardTitle>
                  <CardDescription>
                    Real-time interactions from users across Africa
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    refetchLogs();
                    refetchSessions();
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {ussdLogs && ussdLogs.length > 0 ? (
                      ussdLogs.map((log: any) => (
                        <div 
                          key={log.id} 
                          className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50"
                        >
                          <div className="shrink-0">
                            <Badge variant="outline" className="font-mono text-xs">
                              {log.country_code}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`text-xs ${getActionBadgeColor(log.action)}`}>
                                {formatAction(log.action)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                via {log.carrier}
                              </span>
                            </div>
                            <p className="text-sm font-medium truncate">
                              {log.response_text}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {log.phone_number.slice(0, 8)}***
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(log.created_at), 'MMM d, HH:mm')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No USSD activity recorded yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Country Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Activity by Country
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(
                  (ussdLogs || []).reduce((acc: Record<string, number>, log: any) => {
                    acc[log.country_code] = (acc[log.country_code] || 0) + 1;
                    return acc;
                  }, {})
                ).sort((a, b) => b[1] - a[1]).map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                    <Badge variant="outline" className="font-mono">
                      {country}
                    </Badge>
                    <span className="font-bold text-primary">{count as number}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                  <p className="text-center mb-3 font-bold">🕊️ Peaceverse Early Warning</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>1. 📝 Report Incident</p>
                    <p>2. 🚨 Quick Emergency Report</p>
                    <p>3. ⚠️ View Active Alerts</p>
                    <p>4. 📊 Check Report Status</p>
                    <p>5. 🏠 Find Safe Spaces</p>
                    <p>6. 📲 Subscribe to Alerts</p>
                    <p>7. 🌐 Change Language</p>
                    <p>8. 📞 Emergency Contacts</p>
                    <p>0. Exit</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-dashed space-y-2">
                    <p className="text-xs text-center text-muted-foreground">
                      Reply with option number
                    </p>
                    <p className="text-xs text-center text-green-600">
                      🇰🇪 🇳🇬 🇪🇹 🇬🇭 🇿🇦 🇹🇿 🇺🇬 🇷🇼 + 46 more countries
                    </p>
                  </div>
                </div>
              </div>

              {/* Incident Categories */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-foreground">Supported Incident Categories</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Violence', 'Protest', 'Disaster', 'Displacement', 'Human Rights', 'Security', 'Health Crisis', 'Resource Conflict', 'Other'].map((cat) => (
                    <Badge key={cat} variant="outline" className="justify-center py-1.5">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Severity Levels */}
              <div className="mt-4">
                <h4 className="font-semibold mb-3 text-foreground">Severity Levels</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Badge className="bg-red-500/20 text-red-600 border-red-500/30 justify-center py-1.5">🔴 Critical</Badge>
                  <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30 justify-center py-1.5">🟠 High</Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 justify-center py-1.5">🟡 Medium</Badge>
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30 justify-center py-1.5">🟢 Low</Badge>
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
