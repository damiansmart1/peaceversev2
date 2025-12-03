import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Globe, Database, AlertTriangle, Map, Radio, Building2, 
  Satellite, FileText, Users, Shield, CheckCircle, Clock,
  ArrowRight, ExternalLink, Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  status: 'available' | 'connected' | 'coming_soon';
  direction: 'inbound' | 'outbound' | 'bidirectional';
  features: string[];
  setupUrl?: string;
}

const integrations: Integration[] = [
  {
    id: 'un_ocha',
    name: 'UN OCHA ReliefWeb',
    description: 'Connect to UN humanitarian data including crisis reports, funding flows, and response plans',
    category: 'Humanitarian',
    icon: Globe,
    status: 'available',
    direction: 'bidirectional',
    features: ['Crisis reports sync', 'Funding data', 'Response coordination', 'HXL tagged data']
  },
  {
    id: 'acled',
    name: 'ACLED',
    description: 'Armed Conflict Location & Event Data Project for conflict tracking',
    category: 'Conflict Data',
    icon: AlertTriangle,
    status: 'available',
    direction: 'inbound',
    features: ['Real-time conflict events', 'Actor tracking', 'Fatality data', 'Regional analysis']
  },
  {
    id: 'gdelt',
    name: 'GDELT Project',
    description: 'Global Database of Events, Language, and Tone for media monitoring',
    category: 'Media Monitoring',
    icon: Radio,
    status: 'available',
    direction: 'inbound',
    features: ['News monitoring', 'Sentiment analysis', 'Event detection', 'Global coverage']
  },
  {
    id: 'hdx',
    name: 'Humanitarian Data Exchange',
    description: 'OCHA\'s open platform for sharing humanitarian data',
    category: 'Humanitarian',
    icon: Database,
    status: 'available',
    direction: 'bidirectional',
    features: ['Dataset sync', 'HXL standards', 'API access', 'Bulk exports']
  },
  {
    id: 'cap_server',
    name: 'CAP Alert Hub',
    description: 'Common Alerting Protocol server for emergency alerts',
    category: 'Alert Systems',
    icon: Shield,
    status: 'available',
    direction: 'bidirectional',
    features: ['CAP 1.2 compliance', 'Alert broadcasting', 'Multi-language', 'Geo-targeting']
  },
  {
    id: 'copernicus',
    name: 'Copernicus EMS',
    description: 'European Emergency Management Service for satellite imagery',
    category: 'Earth Observation',
    icon: Satellite,
    status: 'coming_soon',
    direction: 'inbound',
    features: ['Disaster mapping', 'Risk assessment', 'Satellite imagery', 'Flood monitoring']
  },
  {
    id: 'iom_dtm',
    name: 'IOM DTM',
    description: 'Displacement Tracking Matrix for population movement data',
    category: 'Humanitarian',
    icon: Users,
    status: 'coming_soon',
    direction: 'inbound',
    features: ['Displacement tracking', 'Flow monitoring', 'Site assessments', 'Mobility data']
  },
  {
    id: 'fewsnet',
    name: 'FEWS NET',
    description: 'Famine Early Warning Systems Network for food security',
    category: 'Food Security',
    icon: Map,
    status: 'coming_soon',
    direction: 'inbound',
    features: ['Food security alerts', 'Price monitoring', 'Crop assessment', 'IPC classification']
  },
  {
    id: 'au_psd',
    name: 'AU Peace & Security',
    description: 'African Union Peace and Security Department integration',
    category: 'Regional Bodies',
    icon: Building2,
    status: 'coming_soon',
    direction: 'bidirectional',
    features: ['CEWS integration', 'AU alerts', 'Mission coordination', 'Report sharing']
  },
  {
    id: 'ecowas_ews',
    name: 'ECOWAS ECOWARN',
    description: 'ECOWAS Early Warning and Response Network',
    category: 'Regional Bodies',
    icon: Shield,
    status: 'coming_soon',
    direction: 'bidirectional',
    features: ['Regional alerts', 'Conflict prevention', 'Data sharing', 'Response coordination']
  }
];

const IntegrationsGallery = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigValues({});
  };

  const handleSaveConnection = () => {
    toast.success(`${selectedIntegration?.name} integration configured! (Demo mode)`);
    setSelectedIntegration(null);
  };

  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Pre-built Integrations</h2>
        <p className="text-muted-foreground">
          Connect to leading humanitarian data platforms and early warning systems
        </p>
      </div>

      {/* Integrations by Category */}
      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {category}
            <Badge variant="outline" className="text-xs">
              {integrations.filter(i => i.category === category).length} integrations
            </Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations
              .filter(i => i.category === category)
              .map(integration => (
                <Card 
                  key={integration.id} 
                  className={`group hover:shadow-lg transition-all duration-300 ${
                    integration.status === 'coming_soon' ? 'opacity-70' : 'hover:-translate-y-1'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <integration.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={
                            integration.status === 'connected' ? 'default' : 
                            integration.status === 'available' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {integration.status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {integration.status === 'coming_soon' && <Clock className="w-3 h-3 mr-1" />}
                          {integration.status === 'connected' ? 'Connected' : 
                           integration.status === 'available' ? 'Available' : 'Coming Soon'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {integration.direction === 'inbound' ? '← Inbound' :
                           integration.direction === 'outbound' ? '→ Outbound' : '↔ Bidirectional'}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {integration.features.slice(0, 3).map(feature => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {integration.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.features.length - 3}
                        </Badge>
                      )}
                    </div>
                    <Button 
                      className="w-full" 
                      variant={integration.status === 'connected' ? 'outline' : 'default'}
                      disabled={integration.status === 'coming_soon'}
                      onClick={() => handleConnect(integration)}
                    >
                      {integration.status === 'connected' ? (
                        <>
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </>
                      ) : integration.status === 'available' ? (
                        <>
                          Connect
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        'Coming Soon'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {/* Connection Dialog */}
      <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIntegration && <selectedIntegration.icon className="w-5 h-5" />}
              Connect to {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              Configure your connection to {selectedIntegration?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Features included:</h4>
              <ul className="space-y-1">
                {selectedIntegration?.features.map(feature => (
                  <li key={feature} className="text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">API Endpoint URL</label>
                <Input 
                  placeholder="https://api.example.com/v1"
                  value={configValues.endpoint || ''}
                  onChange={e => setConfigValues({ ...configValues, endpoint: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key / Token</label>
                <Input 
                  type="password"
                  placeholder="Enter your API key"
                  value={configValues.apiKey || ''}
                  onChange={e => setConfigValues({ ...configValues, apiKey: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sync Frequency</label>
                <select 
                  className="w-full p-2 border rounded-md bg-background"
                  value={configValues.syncFrequency || '60'}
                  onChange={e => setConfigValues({ ...configValues, syncFrequency: e.target.value })}
                >
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every hour</option>
                  <option value="360">Every 6 hours</option>
                  <option value="1440">Daily</option>
                </select>
              </div>
            </div>
            {selectedIntegration?.setupUrl && (
              <Button variant="link" className="p-0 h-auto" asChild>
                <a href={selectedIntegration.setupUrl} target="_blank" rel="noopener noreferrer">
                  View setup documentation <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedIntegration(null)}>Cancel</Button>
            <Button onClick={handleSaveConnection}>
              Save & Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationsGallery;
