import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, Copy, Clock, CheckCircle, XCircle, Code, 
  Send, Loader2, FileJson, Globe, Key
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-typed';

interface TestResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  duration: number;
  timestamp: Date;
}

const endpoints = [
  { path: '/health', method: 'GET', description: 'Health check endpoint' },
  { path: '/incidents', method: 'GET', description: 'Fetch incidents (GeoJSON, JSON, CAP)' },
  { path: '/alerts', method: 'GET', description: 'Fetch active alerts' },
  { path: '/hotspots', method: 'GET', description: 'Fetch predictive hotspots' },
  { path: '/countries', method: 'GET', description: 'List African countries' },
];

const APITestingTool = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0].path);
  const [method, setMethod] = useState('GET');
  const [apiKey, setApiKey] = useState('');
  const [queryParams, setQueryParams] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'grdfsvyexnlofddpntrq';
  const baseUrl = `https://${projectId}.supabase.co/functions/v1/public-api`;

  const handleTest = async () => {
    if (!apiKey) {
      toast.error('Please enter an API key');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const url = new URL(`${baseUrl}${selectedEndpoint}`);
      
      // Add query params
      if (queryParams) {
        const params = queryParams.split('&').filter(p => p);
        params.forEach(param => {
          const [key, value] = param.split('=');
          if (key && value) {
            url.searchParams.set(key.trim(), value.trim());
          }
        });
      }

      const options: RequestInit = {
        method,
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      };

      if (method !== 'GET' && requestBody) {
        options.body = requestBody;
      }

      const response = await fetch(url.toString(), options);
      const duration = Date.now() - startTime;

      let body;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = await response.json();
      } else {
        body = await response.text();
      }

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const testResult: TestResult = {
        status: response.status,
        statusText: response.statusText,
        headers,
        body,
        duration,
        timestamp: new Date()
      };

      setResult(testResult);
      setTestHistory(prev => [testResult, ...prev.slice(0, 9)]);

      if (response.ok) {
        toast.success(`Request successful (${duration}ms)`);
      } else {
        toast.error(`Request failed: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorResult: TestResult = {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: { error: error.message },
        duration,
        timestamp: new Date()
      };
      setResult(errorResult);
      toast.error('Request failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const generateCurlCommand = () => {
    let curl = `curl -X ${method} "${baseUrl}${selectedEndpoint}`;
    if (queryParams) {
      curl += `?${queryParams}`;
    }
    curl += `" \\\n  -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}"`;
    if (method !== 'GET' && requestBody) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody}'`;
    }
    return curl;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              API Request Builder
            </CardTitle>
            <CardDescription>Test API endpoints with your API key</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="pv_live_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Endpoint</Label>
                <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {endpoints.map(ep => (
                      <SelectItem key={ep.path} value={ep.path}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{ep.method}</Badge>
                          {ep.path}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Query Parameters</Label>
              <Input
                placeholder="format=geojson&country=Kenya"
                value={queryParams}
                onChange={(e) => setQueryParams(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Format: key1=value1&key2=value2
              </p>
            </div>

            {method !== 'GET' && (
              <div className="space-y-2">
                <Label>Request Body (JSON)</Label>
                <Textarea
                  placeholder='{"key": "value"}'
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="font-mono text-sm h-24"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleTest} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Send Request
              </Button>
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(generateCurlCommand())}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy cURL
              </Button>
            </div>

            {/* Generated URL Preview */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Request URL</p>
              <p className="font-mono text-sm break-all">
                {baseUrl}{selectedEndpoint}{queryParams ? `?${queryParams}` : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Response Viewer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Response
            </CardTitle>
            <CardDescription>
              {result ? (
                <div className="flex items-center gap-2">
                  {result.status >= 200 && result.status < 300 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <Badge variant={result.status >= 200 && result.status < 300 ? 'default' : 'destructive'}>
                    {result.status} {result.statusText}
                  </Badge>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {result.duration}ms
                  </span>
                </div>
              ) : 'Send a request to see the response'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="body" className="space-y-4">
              <TabsList>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="body">
                <div className="relative">
                  <pre className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm overflow-auto max-h-80">
                    {result ? JSON.stringify(result.body, null, 2) : 'No response yet'}
                  </pre>
                  {result && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(JSON.stringify(result.body, null, 2))}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="headers">
                <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm overflow-auto max-h-80">
                  {result ? (
                    Object.entries(result.headers).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="text-blue-400">{key}:</span>
                        <span className="ml-2 text-green-400">{value}</span>
                      </div>
                    ))
                  ) : 'No headers yet'}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Test History */}
      {testHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testHistory.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => setResult(test)}
                >
                  <div className="flex items-center gap-3">
                    {test.status >= 200 && test.status < 300 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <Badge variant={test.status >= 200 && test.status < 300 ? 'default' : 'destructive'}>
                      {test.status}
                    </Badge>
                    <span className="text-sm">{test.duration}ms</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {test.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Code Examples
          </CardTitle>
          <CardDescription>Copy-paste ready code snippets</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" className="space-y-4">
            <TabsList>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curl">
              <div className="relative">
                <pre className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm overflow-auto">
                  {generateCurlCommand()}
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generateCurlCommand())}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="javascript">
              <div className="relative">
                <pre className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm overflow-auto">
{`const response = await fetch('${baseUrl}${selectedEndpoint}${queryParams ? `?${queryParams}` : ''}', {
  method: '${method}',
  headers: {
    'x-api-key': '${apiKey || 'YOUR_API_KEY'}',
    'Content-Type': 'application/json'
  }${method !== 'GET' && requestBody ? `,
  body: JSON.stringify(${requestBody || '{}'})` : ''}
});

const data = await response.json();
console.log(data);`}
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`const response = await fetch...`)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="python">
              <div className="relative">
                <pre className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm overflow-auto">
{`import requests

response = requests.${method.toLowerCase()}(
    '${baseUrl}${selectedEndpoint}${queryParams ? `?${queryParams}` : ''}',
    headers={
        'x-api-key': '${apiKey || 'YOUR_API_KEY'}',
        'Content-Type': 'application/json'
    }${method !== 'GET' && requestBody ? `,
    json=${requestBody || '{}'}` : ''}
)

print(response.json())`}
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`import requests...`)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default APITestingTool;
