import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Radio, 
  FileText, 
  AlertTriangle, 
  Users,
  Shield,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import CoordinationChannels from './CoordinationChannels';
import BroadcastCenter from './BroadcastCenter';
import OCHADocumentCenter from './OCHADocumentCenter';
import FieldReportingCenter from './FieldReportingCenter';
import EscalationManager from './EscalationManager';
import { useAuth } from '@/contexts/AuthContext';

const CommunicationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('coordination');
  const { user } = useAuth();

  const tabs = [
    {
      id: 'coordination',
      label: 'Coordination Hub',
      icon: Users,
      description: 'Inter-agency coordination channels',
      badge: null,
    },
    {
      id: 'broadcast',
      label: 'Broadcast Center',
      icon: Radio,
      description: 'Emergency alerts & broadcasts',
      badge: 'LIVE',
    },
    {
      id: 'documents',
      label: 'OCHA Documents',
      icon: FileText,
      description: 'SITREPs, Flash Updates, 3W Reports',
      badge: null,
    },
    {
      id: 'field',
      label: 'Field Reports',
      icon: Globe,
      description: 'Field-to-HQ reporting',
      badge: null,
    },
    {
      id: 'escalation',
      label: 'Escalation Center',
      icon: AlertTriangle,
      description: 'Alert escalation & SLA tracking',
      badge: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            OCHA Communication Center
          </h1>
          <p className="text-muted-foreground mt-1">
            UN-grade inter-agency coordination and emergency communication system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            System Operational
          </Badge>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {tabs.map((tab, index) => (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeTab === tab.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  {tab.badge && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm">{tab.label}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{tab.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full bg-muted/50">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="coordination" className="space-y-4">
          <CoordinationChannels />
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-4">
          <BroadcastCenter />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <OCHADocumentCenter />
        </TabsContent>

        <TabsContent value="field" className="space-y-4">
          <FieldReportingCenter />
        </TabsContent>

        <TabsContent value="escalation" className="space-y-4">
          <EscalationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationHub;
