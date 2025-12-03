import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Key, Webhook, Plug, Code, Shield, Activity, 
  Copy, ExternalLink, Plus, Settings, CheckCircle,
  Globe, Database, Zap, ArrowRight, BookOpen, Gauge,
  HeartPulse, TestTube, Server
} from 'lucide-react';
import { motion } from 'framer-motion';
import APIKeysManager from '@/components/integrations/APIKeysManager';
import WebhooksManager from '@/components/integrations/WebhooksManager';
import IntegrationsGallery from '@/components/integrations/IntegrationsGallery';
import APIDocumentation from '@/components/integrations/APIDocumentation';
import APIHealthMonitor from '@/components/integrations/APIHealthMonitor';
import APIRateLimits from '@/components/integrations/APIRateLimits';
import APITestingTool from '@/components/integrations/APITestingTool';

const Integrations = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: Key,
      title: 'API Access',
      description: 'Secure REST API with API key authentication',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      tab: 'api-keys'
    },
    {
      icon: Webhook,
      title: 'Webhooks',
      description: 'Real-time event notifications to your systems',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      tab: 'webhooks'
    },
    {
      icon: HeartPulse,
      title: 'Health Monitoring',
      description: 'Real-time API health and performance metrics',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      tab: 'health'
    },
    {
      icon: Gauge,
      title: 'Rate Limiting',
      description: 'Configure and monitor API rate limits',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      tab: 'rate-limits'
    }
  ];

  const quickStats = [
    { label: 'API Endpoints', value: '12+', icon: Code },
    { label: 'Data Formats', value: '3', icon: Database },
    { label: 'Webhook Events', value: '8', icon: Zap },
    { label: 'Rate Limit', value: '60/min', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            <Globe className="w-3 h-3 mr-1" />
            Integration Hub
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Connect. Integrate. <span className="text-primary">Collaborate.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seamlessly integrate Peaceverse with your existing early warning systems, 
            data platforms, and humanitarian response tools.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {quickStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => setActiveTab(feature.tab)}
            >
              <CardContent className="pt-6">
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap justify-center gap-1 h-auto p-1">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="gap-2">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="w-4 h-4" />
              <span className="hidden sm:inline">Webhooks</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2">
              <HeartPulse className="w-4 h-4" />
              <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
            <TabsTrigger value="rate-limits" className="gap-2">
              <Gauge className="w-4 h-4" />
              <span className="hidden sm:inline">Rate Limits</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="gap-2">
              <TestTube className="w-4 h-4" />
              <span className="hidden sm:inline">API Tester</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Plug className="w-4 h-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Docs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Getting Started Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Quick Start Guide
                  </CardTitle>
                  <CardDescription>Get integrated in minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <h4 className="font-medium mb-2">Generate API Key</h4>
                      <p className="text-sm text-muted-foreground">Create a secure API key with custom permissions</p>
                      <Button variant="link" className="mt-2" onClick={() => setActiveTab('api-keys')}>
                        Create Key <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <span className="text-primary font-bold">2</span>
                      </div>
                      <h4 className="font-medium mb-2">Test Your Setup</h4>
                      <p className="text-sm text-muted-foreground">Use our API tester to verify connectivity</p>
                      <Button variant="link" className="mt-2" onClick={() => setActiveTab('testing')}>
                        Test API <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <span className="text-primary font-bold">3</span>
                      </div>
                      <h4 className="font-medium mb-2">Configure Webhooks</h4>
                      <p className="text-sm text-muted-foreground">Set up real-time event notifications</p>
                      <Button variant="link" className="mt-2" onClick={() => setActiveTab('webhooks')}>
                        Add Webhook <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <span className="text-primary font-bold">4</span>
                      </div>
                      <h4 className="font-medium mb-2">Monitor Health</h4>
                      <p className="text-sm text-muted-foreground">Track API performance and uptime</p>
                      <Button variant="link" className="mt-2" onClick={() => setActiveTab('health')}>
                        View Health <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supported Standards */}
              <Card>
                <CardHeader>
                  <CardTitle>Supported Standards</CardTitle>
                  <CardDescription>Industry-standard protocols and formats</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'CAP 1.2', desc: 'Common Alerting Protocol', status: 'Supported' },
                    { name: 'GeoJSON', desc: 'Geographic data interchange', status: 'Supported' },
                    { name: 'OCHA HXL', desc: 'Humanitarian Exchange Language', status: 'Coming Soon' },
                    { name: 'IATI', desc: 'International Aid Transparency', status: 'Planned' }
                  ].map((standard, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <div className="font-medium">{standard.name}</div>
                        <div className="text-sm text-muted-foreground">{standard.desc}</div>
                      </div>
                      <Badge variant={standard.status === 'Supported' ? 'default' : 'secondary'}>
                        {standard.status === 'Supported' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {standard.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* API Usage Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>API Preview</CardTitle>
                  <CardDescription>Sample API request</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <div className="text-zinc-500"># Fetch incidents in GeoJSON format</div>
                    <div className="mt-2">
                      <span className="text-green-400">curl</span> -X GET \
                    </div>
                    <div className="pl-4 text-blue-400">
                      "https://api.peaceverse.app/incidents?format=geojson" \
                    </div>
                    <div className="pl-4">
                      -H <span className="text-yellow-400">"x-api-key: your_api_key"</span>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 w-full" onClick={() => setActiveTab('docs')}>
                    <Code className="w-4 h-4 mr-2" />
                    View Full Documentation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api-keys">
            <APIKeysManager />
          </TabsContent>

          <TabsContent value="webhooks">
            <WebhooksManager />
          </TabsContent>

          <TabsContent value="health">
            <APIHealthMonitor />
          </TabsContent>

          <TabsContent value="rate-limits">
            <APIRateLimits />
          </TabsContent>

          <TabsContent value="testing">
            <APITestingTool />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsGallery />
          </TabsContent>

          <TabsContent value="docs">
            <APIDocumentation />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Integrations;
