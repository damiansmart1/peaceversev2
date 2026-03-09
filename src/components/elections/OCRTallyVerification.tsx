import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Camera, 
  Upload, 
  FileImage, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Scan,
  Eye,
  Download,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Shield,
  FileText,
  Hash,
  Percent,
  Calculator,
  History,
  Fingerprint,
} from 'lucide-react';

interface ExtractedResult {
  id: string;
  candidate: string;
  votes: number;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
}

interface TallySheet {
  id: string;
  pollingStation: string;
  imageUrl: string;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'verified' | 'disputed' | 'rejected';
  extractedResults: ExtractedResult[];
  totalVotes: number;
  registeredVoters: number;
  turnoutPercent: number;
  ocrConfidence: number;
  verifiedBy?: string;
  verifiedAt?: string;
  anomalies: string[];
  hashDigest: string;
}

// Mock data for demonstration
const MOCK_TALLY_SHEETS: TallySheet[] = [
  {
    id: '1',
    pollingStation: 'Nairobi Central PS-001',
    imageUrl: '/placeholder.svg',
    uploadedAt: new Date().toISOString(),
    status: 'verified',
    extractedResults: [
      { id: '1', candidate: 'Candidate A', votes: 1247, confidence: 98.5, boundingBox: { x: 100, y: 200, width: 80, height: 30 } },
      { id: '2', candidate: 'Candidate B', votes: 892, confidence: 97.2, boundingBox: { x: 100, y: 240, width: 80, height: 30 } },
      { id: '3', candidate: 'Candidate C', votes: 456, confidence: 99.1, boundingBox: { x: 100, y: 280, width: 80, height: 30 } },
    ],
    totalVotes: 2595,
    registeredVoters: 3200,
    turnoutPercent: 81.1,
    ocrConfidence: 98.3,
    verifiedBy: 'Observer John K.',
    verifiedAt: new Date().toISOString(),
    anomalies: [],
    hashDigest: 'sha256:8f4e2b1c9d3a7e6f5b4c8d2a1e9f7b3c',
  },
  {
    id: '2',
    pollingStation: 'Mombasa Harbor PS-012',
    imageUrl: '/placeholder.svg',
    uploadedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'disputed',
    extractedResults: [
      { id: '1', candidate: 'Candidate A', votes: 2103, confidence: 85.2, boundingBox: { x: 100, y: 200, width: 80, height: 30 } },
      { id: '2', candidate: 'Candidate B', votes: 1856, confidence: 72.8, boundingBox: { x: 100, y: 240, width: 80, height: 30 } },
      { id: '3', candidate: 'Candidate C', votes: 623, confidence: 94.5, boundingBox: { x: 100, y: 280, width: 80, height: 30 } },
    ],
    totalVotes: 4582,
    registeredVoters: 4500,
    turnoutPercent: 101.8,
    ocrConfidence: 84.2,
    anomalies: ['Turnout exceeds 100%', 'Low confidence on Candidate B extraction'],
    hashDigest: 'sha256:2a3b4c5d6e7f8g9h0i1j2k3l',
  },
  {
    id: '3',
    pollingStation: 'Kisumu Lake PS-007',
    imageUrl: '/placeholder.svg',
    uploadedAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'processing',
    extractedResults: [],
    totalVotes: 0,
    registeredVoters: 2800,
    turnoutPercent: 0,
    ocrConfidence: 0,
    anomalies: [],
    hashDigest: 'sha256:pending...',
  },
];

const STATUS_CONFIG = {
  pending: { color: 'bg-muted text-muted-foreground', icon: FileImage },
  processing: { color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300', icon: RefreshCw },
  verified: { color: 'bg-green-500/20 text-green-700 dark:text-green-300', icon: CheckCircle2 },
  disputed: { color: 'bg-red-500/20 text-red-700 dark:text-red-300', icon: AlertTriangle },
  rejected: { color: 'bg-destructive/20 text-destructive', icon: XCircle },
};

export default function OCRTallyVerification() {
  const [tallySheets, setTallySheets] = useState<TallySheet[]>(MOCK_TALLY_SHEETS);
  const [selectedSheet, setSelectedSheet] = useState<TallySheet | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload progress
      for (let p = 0; p <= 100; p += 10) {
        await new Promise(r => setTimeout(r, 100));
        setUploadProgress(p);
      }

      // Create new tally sheet entry
      const newSheet: TallySheet = {
        id: Date.now().toString(),
        pollingStation: `New Upload - ${file.name}`,
        imageUrl: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        status: 'processing',
        extractedResults: [],
        totalVotes: 0,
        registeredVoters: 0,
        turnoutPercent: 0,
        ocrConfidence: 0,
        anomalies: [],
        hashDigest: `sha256:${Math.random().toString(36).substring(7)}`,
      };

      setTallySheets(prev => [newSheet, ...prev]);
      
      // Simulate OCR processing
      await simulateOCRProcessing(newSheet.id);
    }

    setIsProcessing(false);
    toast.success('Tally sheet(s) uploaded and processed successfully');
  }, []);

  const simulateOCRProcessing = async (sheetId: string) => {
    await new Promise(r => setTimeout(r, 2000));
    
    setTallySheets(prev => prev.map(sheet => {
      if (sheet.id === sheetId) {
        const mockResults: ExtractedResult[] = [
          { id: '1', candidate: 'Candidate A', votes: Math.floor(Math.random() * 2000) + 500, confidence: 85 + Math.random() * 15, boundingBox: { x: 100, y: 200, width: 80, height: 30 } },
          { id: '2', candidate: 'Candidate B', votes: Math.floor(Math.random() * 1500) + 300, confidence: 85 + Math.random() * 15, boundingBox: { x: 100, y: 240, width: 80, height: 30 } },
          { id: '3', candidate: 'Candidate C', votes: Math.floor(Math.random() * 800) + 100, confidence: 85 + Math.random() * 15, boundingBox: { x: 100, y: 280, width: 80, height: 30 } },
        ];
        const total = mockResults.reduce((sum, r) => sum + r.votes, 0);
        const registered = Math.floor(total * (0.7 + Math.random() * 0.4));
        const avgConfidence = mockResults.reduce((sum, r) => sum + r.confidence, 0) / mockResults.length;
        const turnout = (total / registered) * 100;
        
        return {
          ...sheet,
          status: turnout > 100 || avgConfidence < 85 ? 'disputed' : 'pending',
          extractedResults: mockResults,
          totalVotes: total,
          registeredVoters: registered,
          turnoutPercent: turnout,
          ocrConfidence: avgConfidence,
          anomalies: [
            ...(turnout > 100 ? ['Turnout exceeds 100%'] : []),
            ...(avgConfidence < 85 ? ['Low OCR confidence detected'] : []),
          ],
        };
      }
      return sheet;
    }));
  };

  const handleVerify = (sheetId: string, approved: boolean) => {
    setTallySheets(prev => prev.map(sheet => {
      if (sheet.id === sheetId) {
        return {
          ...sheet,
          status: approved ? 'verified' : 'rejected',
          verifiedBy: 'Current Observer',
          verifiedAt: new Date().toISOString(),
        };
      }
      return sheet;
    }));
    toast.success(approved ? 'Tally sheet verified successfully' : 'Tally sheet rejected');
  };

  const stats = {
    total: tallySheets.length,
    verified: tallySheets.filter(s => s.status === 'verified').length,
    disputed: tallySheets.filter(s => s.status === 'disputed').length,
    processing: tallySheets.filter(s => s.status === 'processing').length,
    avgConfidence: tallySheets.filter(s => s.ocrConfidence > 0).reduce((sum, s) => sum + s.ocrConfidence, 0) / (tallySheets.filter(s => s.ocrConfidence > 0).length || 1),
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Sheets</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-6 w-6 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Disputed</p>
                <p className="text-2xl font-bold text-red-600">{stats.disputed}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              </div>
              <RefreshCw className="h-6 w-6 text-blue-500 opacity-80 animate-spin" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgConfidence.toFixed(1)}%</p>
              </div>
              <Percent className="h-6 w-6 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="queue" className="gap-2">
            <FileImage className="h-4 w-4" />
            Verification Queue
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                OCR Tally Sheet Scanner
              </CardTitle>
              <CardDescription>
                Upload photos of handwritten tally sheets for automatic digit extraction and verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Zone */}
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  capture="environment"
                />
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Upload Tally Sheet Images</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click to browse or drag & drop images. Supports JPG, PNG, HEIC
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                  <Button>
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              </div>

              {/* Upload Progress */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* OCR Info */}
              <Alert>
                <Scan className="h-4 w-4" />
                <AlertTitle>AI-Powered OCR</AlertTitle>
                <AlertDescription>
                  Our system uses advanced optical character recognition to extract vote counts from 
                  handwritten tally sheets. Each extraction includes a confidence score and is 
                  cryptographically hashed for integrity verification.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Queue</CardTitle>
              <CardDescription>
                Review and verify OCR-extracted results from tally sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {tallySheets.filter(s => ['pending', 'disputed', 'processing'].includes(s.status)).map(sheet => {
                    const StatusIcon = STATUS_CONFIG[sheet.status].icon;
                    return (
                      <Card key={sheet.id} className="border-l-4 border-l-primary">
                        <CardContent className="pt-4">
                          <div className="flex flex-col lg:flex-row gap-4">
                            {/* Image Preview */}
                            <div className="relative w-full lg:w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={sheet.imageUrl} 
                                alt="Tally sheet" 
                                className="w-full h-full object-cover"
                              />
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="icon" 
                                    variant="secondary" 
                                    className="absolute bottom-2 right-2"
                                    onClick={() => setSelectedSheet(sheet)}
                                  >
                                    <Maximize2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Tally Sheet Review</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="flex justify-center gap-2">
                                      <Button variant="outline" size="sm" onClick={() => setZoomLevel(z => Math.max(50, z - 25))}>
                                        <ZoomOut className="h-4 w-4" />
                                      </Button>
                                      <span className="px-2 py-1 text-sm">{zoomLevel}%</span>
                                      <Button variant="outline" size="sm" onClick={() => setZoomLevel(z => Math.min(200, z + 25))}>
                                        <ZoomIn className="h-4 w-4" />
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={() => setRotation(r => (r + 90) % 360)}>
                                        <RotateCw className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="border rounded-lg overflow-hidden bg-muted">
                                      <img 
                                        src={sheet.imageUrl} 
                                        alt="Tally sheet" 
                                        className="mx-auto transition-transform"
                                        style={{ 
                                          transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                                          maxHeight: '60vh'
                                        }}
                                      />
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{sheet.pollingStation}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    Uploaded {new Date(sheet.uploadedAt).toLocaleString()}
                                  </p>
                                </div>
                                <Badge className={STATUS_CONFIG[sheet.status].color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {sheet.status}
                                </Badge>
                              </div>

                              {sheet.status !== 'processing' && sheet.extractedResults.length > 0 && (
                                <>
                                  {/* Extracted Results */}
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Candidate</TableHead>
                                        <TableHead className="text-right">Votes</TableHead>
                                        <TableHead className="text-right">Confidence</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {sheet.extractedResults.map(result => (
                                        <TableRow key={result.id}>
                                          <TableCell>{result.candidate}</TableCell>
                                          <TableCell className="text-right font-mono">{result.votes.toLocaleString()}</TableCell>
                                          <TableCell className="text-right">
                                            <Badge variant={result.confidence >= 95 ? 'default' : result.confidence >= 85 ? 'secondary' : 'destructive'}>
                                              {result.confidence.toFixed(1)}%
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>

                                  {/* Summary Stats */}
                                  <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div className="bg-muted rounded p-2">
                                      <p className="text-xs text-muted-foreground">Total Votes</p>
                                      <p className="font-medium">{sheet.totalVotes.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-muted rounded p-2">
                                      <p className="text-xs text-muted-foreground">Registered</p>
                                      <p className="font-medium">{sheet.registeredVoters.toLocaleString()}</p>
                                    </div>
                                    <div className={`rounded p-2 ${sheet.turnoutPercent > 100 ? 'bg-red-500/20' : 'bg-muted'}`}>
                                      <p className="text-xs text-muted-foreground">Turnout</p>
                                      <p className={`font-medium ${sheet.turnoutPercent > 100 ? 'text-red-600' : ''}`}>
                                        {sheet.turnoutPercent.toFixed(1)}%
                                      </p>
                                    </div>
                                  </div>

                                  {/* Anomalies */}
                                  {sheet.anomalies.length > 0 && (
                                    <Alert variant="destructive">
                                      <AlertTriangle className="h-4 w-4" />
                                      <AlertTitle>Anomalies Detected</AlertTitle>
                                      <AlertDescription>
                                        <ul className="list-disc list-inside text-sm">
                                          {sheet.anomalies.map((a, i) => <li key={i}>{a}</li>)}
                                        </ul>
                                      </AlertDescription>
                                    </Alert>
                                  )}

                                  {/* Hash */}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Fingerprint className="h-3 w-3" />
                                    <span className="font-mono">{sheet.hashDigest}</span>
                                  </div>

                                  {/* Actions */}
                                  {sheet.status === 'pending' || sheet.status === 'disputed' ? (
                                    <div className="flex gap-2">
                                      <Button 
                                        className="flex-1" 
                                        onClick={() => handleVerify(sheet.id, true)}
                                      >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Verify & Approve
                                      </Button>
                                      <Button 
                                        variant="destructive" 
                                        onClick={() => handleVerify(sheet.id, false)}
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                    </div>
                                  ) : null}
                                </>
                              )}

                              {sheet.status === 'processing' && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  Processing OCR extraction...
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {tallySheets.filter(s => ['pending', 'disputed', 'processing'].includes(s.status)).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No sheets pending verification</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification History</CardTitle>
              <CardDescription>
                Audit trail of all processed tally sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Polling Station</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Votes</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Verified By</TableHead>
                    <TableHead>Hash</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tallySheets.filter(s => ['verified', 'rejected'].includes(s.status)).map(sheet => {
                    const StatusIcon = STATUS_CONFIG[sheet.status].icon;
                    return (
                      <TableRow key={sheet.id}>
                        <TableCell className="font-medium">{sheet.pollingStation}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_CONFIG[sheet.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {sheet.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{sheet.totalVotes.toLocaleString()}</TableCell>
                        <TableCell>{sheet.ocrConfidence.toFixed(1)}%</TableCell>
                        <TableCell>{sheet.verifiedBy || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">{sheet.hashDigest.substring(0, 16)}...</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => {
                            toast.success(`Viewing ${sheet.pollingStation}`, { description: `Hash: ${sheet.hashDigest}` });
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
