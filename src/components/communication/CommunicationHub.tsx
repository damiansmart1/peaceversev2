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
import { Button } from '@/components/ui/button';
import CoordinationChannels from './CoordinationChannels';
import BroadcastCenter from './BroadcastCenter';
import OCHADocumentCenter from './OCHADocumentCenter';
import FieldReportingCenter from './FieldReportingCenter';
import EscalationManager from './EscalationManager';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useSeedCommunicationDemo } from '@/hooks/useSeedCommunicationDemo';
import { useChannels } from '@/hooks/useCommunication';

const CommunicationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('coordination');
  const { user } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const seedDemo = useSeedCommunicationDemo();
  const { data: channels, isLoading: channelsLoading } = useChannels();

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
    <div className="space-y-6 has-mobile-nav">
      {/* Calm institutional header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="space-y-1.5 min-w-0">
          <p className="eyebrow flex items-center gap-2">
            <Shield className="h-3 w-3" />
            OCHA Coordination
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Communication Center
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            UN-grade inter-agency coordination and emergency communication.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="pill pill-success">
            <span className="live-dot" />
            Operational
          </span>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => seedDemo.mutate('reset')}
              disabled={seedDemo.isPending}
            >
              {seedDemo.isPending ? 'Seeding…' : 'Seed Demo Data'}
            </Button>
          )}
        </div>
      </motion.div>

      {isAdmin && !channelsLoading && (channels?.length || 0) === 0 && (
        <div className="surface-quiet p-4 text-sm text-muted-foreground">
          No communication data yet. Click <span className="font-medium text-foreground">Seed Demo Data</span> to populate channels, messages, broadcasts, documents, and reports.
        </div>
      )}

      {/* Main Content Tabs — primary nav, no duplicate stat cards above */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="w-full grid grid-cols-5 h-auto bg-muted/40 p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{tab.label.replace(' Center', '').replace(' Hub', '')}</span>
              {tab.badge && (
                <Badge variant="destructive" className="hidden sm:inline-flex text-[9px] px-1 py-0 h-4">
                  {tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="coordination" className="space-y-4 mt-0">
          <CoordinationChannels />
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-4 mt-0">
          <BroadcastCenter />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 mt-0">
          <OCHADocumentCenter />
        </TabsContent>

        <TabsContent value="field" className="space-y-4 mt-0">
          <FieldReportingCenter />
        </TabsContent>

        <TabsContent value="escalation" className="space-y-4 mt-0">
          <EscalationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationHub;
