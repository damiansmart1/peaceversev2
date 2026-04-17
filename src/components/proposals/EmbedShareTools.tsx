import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Code2, Link2, Download, Webhook } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  proposalId: string;
  embedToken?: string;
  title: string;
}

const EmbedShareTools = ({ proposalId, embedToken, title }: Props) => {
  const [origin] = useState(() => typeof window !== 'undefined' ? window.location.origin : '');
  const embedUrl = `${origin}/embed/proposal/${embedToken || proposalId}`;
  const apiUrl = `${origin}/api/proposals/${proposalId}`;

  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" title="${title}"></iframe>`;
  const scriptCode = `<script src="${origin}/embed.js" data-proposal="${embedToken || proposalId}"></script>`;
  const apiSnippet = `fetch("${apiUrl}").then(r => r.json()).then(console.log);`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const downloadJSON = async () => {
    const url = `https://grdfsvyexnlofddpntrq.supabase.co/functions/v1/proposals-public-api?id=${proposalId}`;
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          Embed & Partner API
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Embed this proposal on any website or pull data via the public API. OGP open-data compliant.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="iframe">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="iframe">iframe</TabsTrigger>
            <TabsTrigger value="script">Script</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="space-y-2">
            <pre className="p-3 bg-muted rounded text-xs overflow-x-auto">{iframeCode}</pre>
            <Button size="sm" onClick={() => copy(iframeCode, 'iframe code')}><Link2 className="w-3 h-3 mr-1" />Copy</Button>
          </TabsContent>
          <TabsContent value="script" className="space-y-2">
            <pre className="p-3 bg-muted rounded text-xs overflow-x-auto">{scriptCode}</pre>
            <Button size="sm" onClick={() => copy(scriptCode, 'script tag')}><Link2 className="w-3 h-3 mr-1" />Copy</Button>
          </TabsContent>
          <TabsContent value="api" className="space-y-2">
            <pre className="p-3 bg-muted rounded text-xs overflow-x-auto">{apiSnippet}</pre>
            <Button size="sm" onClick={() => copy(apiSnippet, 'API snippet')}><Webhook className="w-3 h-3 mr-1" />Copy</Button>
          </TabsContent>
          <TabsContent value="data" className="space-y-2">
            <p className="text-sm text-muted-foreground">Download full proposal + vote dataset (JSON) — OGP compliant.</p>
            <Button size="sm" onClick={downloadJSON}><Download className="w-3 h-3 mr-1" />Download JSON</Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmbedShareTools;
