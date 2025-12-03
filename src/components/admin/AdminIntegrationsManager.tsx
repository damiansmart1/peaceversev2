import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import APIKeysManager from '@/components/integrations/APIKeysManager';
import APIRateLimits from '@/components/integrations/APIRateLimits';
import APIHealthMonitor from '@/components/integrations/APIHealthMonitor';
import APITestingTool from '@/components/integrations/APITestingTool';
import WebhooksManager from '@/components/integrations/WebhooksManager';
import APIDocumentation from '@/components/integrations/APIDocumentation';
import IntegrationsGallery from '@/components/integrations/IntegrationsGallery';
import { Key, Activity, TestTube, Webhook, BookOpen, Puzzle, Gauge } from 'lucide-react';

export function AdminIntegrationsManager() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integrations & API Management</h2>
        <p className="text-muted-foreground">
          Manage API keys, webhooks, rate limits, and third-party integrations
        </p>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 h-auto">
          <TabsTrigger value="api-keys" className="flex items-center gap-2 py-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="rate-limits" className="flex items-center gap-2 py-2">
            <Gauge className="h-4 w-4" />
            <span className="hidden sm:inline">Rate Limits</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2 py-2">
            <Webhook className="h-4 w-4" />
            <span className="hidden sm:inline">Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2 py-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Health</span>
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2 py-2">
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline">Testing</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2 py-2">
            <Puzzle className="h-4 w-4" />
            <span className="hidden sm:inline">Gallery</span>
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2 py-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Docs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <APIKeysManager />
        </TabsContent>

        <TabsContent value="rate-limits">
          <APIRateLimits />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhooksManager />
        </TabsContent>

        <TabsContent value="health">
          <APIHealthMonitor />
        </TabsContent>

        <TabsContent value="testing">
          <APITestingTool />
        </TabsContent>

        <TabsContent value="gallery">
          <IntegrationsGallery />
        </TabsContent>

        <TabsContent value="docs">
          <APIDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
}
