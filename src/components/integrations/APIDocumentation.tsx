import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, CheckCircle, Code, FileJson, Globe, Shield } from 'lucide-react';
import { toast } from 'sonner';

const APIDocumentation = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/incidents',
      description: 'List all incidents with optional filtering',
      params: [
        { name: 'country', type: 'string', description: 'Filter by country name' },
        { name: 'severity', type: 'string', description: 'Filter by severity level (low, medium, high, critical)' },
        { name: 'format', type: 'string', description: 'Response format: json, geojson, or cap' },
        { name: 'limit', type: 'number', description: 'Number of results (default: 50, max: 500)' },
        { name: 'offset', type: 'number', description: 'Pagination offset' }
      ],
      permissions: ['read:incidents']
    },
    {
      method: 'GET',
      path: '/alerts',
      description: 'List active alerts',
      params: [
        { name: 'severity', type: 'string', description: 'Filter by alert severity' },
        { name: 'limit', type: 'number', description: 'Number of results' }
      ],
      permissions: ['read:alerts']
    },
    {
      method: 'GET',
      path: '/hotspots',
      description: 'List predictive hotspots',
      params: [
        { name: 'country', type: 'string', description: 'Filter by country' },
        { name: 'risk_level', type: 'string', description: 'Filter by risk level' }
      ],
      permissions: ['read:hotspots']
    },
    {
      method: 'GET',
      path: '/countries',
      description: 'List available countries',
      params: [],
      permissions: []
    },
    {
      method: 'GET',
      path: '/health',
      description: 'API health check and endpoint discovery',
      params: [],
      permissions: []
    }
  ];

  const codeExamples = {
    curl: `curl -X GET \\
  "https://grdfsvyexnlofddpntrq.supabase.co/functions/v1/public-api/incidents?country=Kenya&format=geojson" \\
  -H "x-api-key: pv_live_your_api_key_here"`,
    javascript: `const response = await fetch(
  'https://grdfsvyexnlofddpntrq.supabase.co/functions/v1/public-api/incidents?format=geojson',
  {
    headers: {
      'x-api-key': 'pv_live_your_api_key_here'
    }
  }
);

const data = await response.json();
console.log(data);`,
    python: `import requests

response = requests.get(
    'https://grdfsvyexnlofddpntrq.supabase.co/functions/v1/public-api/incidents',
    params={'format': 'geojson', 'country': 'Kenya'},
    headers={'x-api-key': 'pv_live_your_api_key_here'}
)

data = response.json()
print(data)`
  };

  const webhookExample = `{
  "event": "incident.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "uuid-here",
    "title": "Security Incident Report",
    "category": "conflict",
    "severity_level": "high",
    "location": {
      "country": "Kenya",
      "region": "Nairobi",
      "coordinates": [-1.2921, 36.8219]
    },
    "created_at": "2024-01-15T10:30:00Z"
  },
  "webhook_id": "webhook-uuid"
}`;

  const capExample = `{
  "alert": {
    "xmlns": "urn:oasis:names:tc:emergency:cap:1.2",
    "identifier": "peaceverse-1705315800000",
    "sender": "peaceverse.app",
    "sent": "2024-01-15T10:30:00Z",
    "status": "Actual",
    "msgType": "Alert",
    "scope": "Public",
    "info": [
      {
        "category": "Security",
        "event": "Armed Conflict Incident",
        "urgency": "Immediate",
        "severity": "Severe",
        "certainty": "Observed",
        "headline": "Armed conflict reported in region",
        "description": "Detailed incident description...",
        "area": {
          "areaDesc": "City, Region, Country",
          "circle": "-1.2921,36.8219 0"
        }
      }
    ]
  }
}`;

  return (
    <div className="space-y-8">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            API Overview
          </CardTitle>
          <CardDescription>
            RESTful API for accessing Peaceverse early warning data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <Globe className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium">Base URL</h4>
              <code className="text-sm text-muted-foreground break-all">
                https://grdfsvyexnlofddpntrq.supabase.co/functions/v1/public-api
              </code>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <Shield className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium">Authentication</h4>
              <p className="text-sm text-muted-foreground">
                API Key via <code>x-api-key</code> header
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <FileJson className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium">Formats</h4>
              <p className="text-sm text-muted-foreground">
                JSON, GeoJSON, CAP 1.2
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
          <CardDescription>Available API endpoints and their parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {endpoints.map((endpoint, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                  {endpoint.method}
                </Badge>
                <code className="font-mono text-sm">{endpoint.path}</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
              {endpoint.params.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Parameters:</h5>
                  <div className="grid gap-2">
                    {endpoint.params.map(param => (
                      <div key={param.name} className="flex items-start gap-2 text-sm">
                        <code className="px-1.5 py-0.5 bg-muted rounded text-xs">{param.name}</code>
                        <span className="text-muted-foreground text-xs">({param.type})</span>
                        <span className="text-muted-foreground text-xs">- {param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {endpoint.permissions.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-muted-foreground">Required permissions:</span>
                  {endpoint.permissions.map(perm => (
                    <Badge key={perm} variant="outline" className="text-xs">{perm}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>Quick start examples in various languages</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl">
            <TabsList>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            {Object.entries(codeExamples).map(([lang, code]) => (
              <TabsContent key={lang} value={lang}>
                <div className="relative">
                  <pre className="p-4 bg-zinc-950 text-zinc-100 rounded-lg overflow-x-auto text-sm">
                    <code>{code}</code>
                  </pre>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyCode(code, lang)}
                  >
                    {copiedCode === lang ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Webhook Payload */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Payload Format</CardTitle>
          <CardDescription>Example webhook payload structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="p-4 bg-zinc-950 text-zinc-100 rounded-lg overflow-x-auto text-sm">
              <code>{webhookExample}</code>
            </pre>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => copyCode(webhookExample, 'webhook')}
            >
              {copiedCode === 'webhook' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Webhook Security</h4>
            <p className="text-sm text-muted-foreground">
              All webhooks include an <code>X-Peaceverse-Signature</code> header containing 
              an HMAC-SHA256 signature of the payload using your webhook secret. 
              Always verify this signature before processing webhook events.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CAP Format */}
      <Card>
        <CardHeader>
          <CardTitle>CAP 1.2 Format</CardTitle>
          <CardDescription>Common Alerting Protocol response format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="p-4 bg-zinc-950 text-zinc-100 rounded-lg overflow-x-auto text-sm max-h-96">
              <code>{capExample}</code>
            </pre>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => copyCode(capExample, 'cap')}
            >
              {copiedCode === 'cap' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Add <code>?format=cap</code> to the incidents endpoint to receive CAP 1.2 formatted responses.
          </p>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">60</div>
              <div className="text-sm text-muted-foreground">Requests per minute (default)</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">1,000</div>
              <div className="text-sm text-muted-foreground">Requests per hour</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">10,000</div>
              <div className="text-sm text-muted-foreground">Requests per day</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Rate limits can be customized per API key. Contact us for higher limits for 
            humanitarian organizations and government partners.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIDocumentation;
