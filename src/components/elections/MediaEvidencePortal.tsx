import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Camera, 
  Video, 
  FileAudio, 
  Image, 
  Upload, 
  Download, 
  Search,
  Filter,
  Eye,
  Clock,
  MapPin,
  Shield,
  Lock,
  Unlock,
  Share2,
  Copy,
  ExternalLink,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  Link2,
  Key,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  Maximize2,
  Calendar,
} from 'lucide-react';

interface MediaFile {
  id: string;
  filename: string;
  type: 'image' | 'video' | 'audio';
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  pollingStation: string;
  election: string;
  hashDigest: string;
  status: 'pending' | 'verified' | 'flagged';
  accessLevel: 'public' | 'restricted' | 'confidential';
  thumbnailUrl: string;
  downloadUrl: string;
  metadata: {
    gpsLat?: number;
    gpsLng?: number;
    capturedAt?: string;
    device?: string;
    duration?: number;
  };
}

interface AccessToken {
  id: string;
  name: string;
  token: string;
  permissions: string[];
  createdAt: string;
  expiresAt: string;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
}

// Mock data
const MOCK_MEDIA: MediaFile[] = [
  {
    id: '1',
    filename: 'polling_station_001_opening.jpg',
    type: 'image',
    size: 2456789,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'Observer John K.',
    pollingStation: 'PS-001 Nairobi Central',
    election: 'Kenya Presidential 2026',
    hashDigest: 'sha256:8f4e2b1c9d3a7e6f5b4c8d2a1e9f7b3c',
    status: 'verified',
    accessLevel: 'public',
    thumbnailUrl: '/placeholder.svg',
    downloadUrl: '#',
    metadata: {
      gpsLat: -1.2921,
      gpsLng: 36.8219,
      capturedAt: new Date().toISOString(),
      device: 'iPhone 14 Pro',
    },
  },
  {
    id: '2',
    filename: 'vote_counting_process.mp4',
    type: 'video',
    size: 45678901,
    uploadedAt: new Date(Date.now() - 3600000).toISOString(),
    uploadedBy: 'Observer Sarah M.',
    pollingStation: 'PS-045 Mombasa Harbor',
    election: 'Kenya Presidential 2026',
    hashDigest: 'sha256:2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p',
    status: 'pending',
    accessLevel: 'restricted',
    thumbnailUrl: '/placeholder.svg',
    downloadUrl: '#',
    metadata: {
      gpsLat: -4.0435,
      gpsLng: 39.6682,
      capturedAt: new Date(Date.now() - 3600000).toISOString(),
      device: 'Samsung Galaxy S23',
      duration: 245,
    },
  },
  {
    id: '3',
    filename: 'witness_testimony.m4a',
    type: 'audio',
    size: 5678901,
    uploadedAt: new Date(Date.now() - 7200000).toISOString(),
    uploadedBy: 'Observer David O.',
    pollingStation: 'PS-023 Kisumu Lake',
    election: 'Kenya Presidential 2026',
    hashDigest: 'sha256:9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p',
    status: 'flagged',
    accessLevel: 'confidential',
    thumbnailUrl: '/placeholder.svg',
    downloadUrl: '#',
    metadata: {
      capturedAt: new Date(Date.now() - 7200000).toISOString(),
      device: 'Voice Recorder App',
      duration: 180,
    },
  },
];

const MOCK_TOKENS: AccessToken[] = [
  {
    id: '1',
    name: 'Media Partner API',
    token: 'pk_live_abc123xyz789',
    permissions: ['read:media', 'download:public'],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    usageCount: 1247,
    maxUsage: 10000,
    isActive: true,
  },
  {
    id: '2',
    name: 'Research Institution',
    token: 'pk_live_def456uvw012',
    permissions: ['read:media', 'download:public', 'download:restricted'],
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 60).toISOString(),
    usageCount: 523,
    maxUsage: 5000,
    isActive: true,
  },
];

const TYPE_ICONS = {
  image: Image,
  video: Video,
  audio: FileAudio,
};

const STATUS_CONFIG = {
  pending: { color: 'bg-amber-500/20 text-amber-700 dark:text-amber-300', label: 'Pending Review' },
  verified: { color: 'bg-green-500/20 text-green-700 dark:text-green-300', label: 'Verified' },
  flagged: { color: 'bg-red-500/20 text-red-700 dark:text-red-300', label: 'Flagged' },
};

const ACCESS_CONFIG = {
  public: { color: 'bg-green-500/20 text-green-700', icon: Unlock },
  restricted: { color: 'bg-amber-500/20 text-amber-700', icon: Shield },
  confidential: { color: 'bg-red-500/20 text-red-700', icon: Lock },
};

export default function MediaEvidencePortal() {
  const [media, setMedia] = useState<MediaFile[]>(MOCK_MEDIA);
  const [tokens, setTokens] = useState<AccessToken[]>(MOCK_TOKENS);
  const [activeTab, setActiveTab] = useState('gallery');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredMedia = media.filter(m => {
    const matchesSearch = m.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.pollingStation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success('API token copied to clipboard');
  };

  const handleGenerateToken = () => {
    const newToken: AccessToken = {
      id: Date.now().toString(),
      name: 'New API Token',
      token: `pk_live_${Math.random().toString(36).substring(2, 15)}`,
      permissions: ['read:media'],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
      usageCount: 0,
      maxUsage: 1000,
      isActive: true,
    };
    setTokens(prev => [newToken, ...prev]);
    toast.success('New API token generated');
  };

  const stats = {
    total: media.length,
    images: media.filter(m => m.type === 'image').length,
    videos: media.filter(m => m.type === 'video').length,
    audio: media.filter(m => m.type === 'audio').length,
    verified: media.filter(m => m.status === 'verified').length,
    totalSize: media.reduce((sum, m) => sum + m.size, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Camera className="h-6 w-6 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Images</p>
                <p className="text-2xl font-bold">{stats.images}</p>
              </div>
              <Image className="h-6 w-6 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Videos</p>
                <p className="text-2xl font-bold">{stats.videos}</p>
              </div>
              <Video className="h-6 w-6 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Audio</p>
                <p className="text-2xl font-bold">{stats.audio}</p>
              </div>
              <FileAudio className="h-6 w-6 text-green-500 opacity-80" />
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
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Size</p>
                <p className="text-lg font-bold">{formatFileSize(stats.totalSize)}</p>
              </div>
              <Upload className="h-6 w-6 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="gallery" className="gap-2">
            <Image className="h-4 w-4" />
            Media Gallery
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            API Access
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Shield className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Media Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedia.map(file => {
              const TypeIcon = TYPE_ICONS[file.type];
              const AccessIcon = ACCESS_CONFIG[file.accessLevel].icon;
              
              return (
                <Card key={file.id} className="overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted">
                    <img 
                      src={file.thumbnailUrl} 
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/50 text-white">
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {file.type}
                      </Badge>
                    </div>
                    
                    {/* Duration (for video/audio) */}
                    {file.metadata.duration && (
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-black/50 text-white">
                          {formatDuration(file.metadata.duration)}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Play overlay for video */}
                    {file.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <CardContent className="pt-4 space-y-3">
                    {/* File Info */}
                    <div>
                      <h4 className="font-medium text-sm truncate" title={file.filename}>
                        {file.filename}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {file.pollingStation}
                      </p>
                    </div>

                    {/* Status & Access */}
                    <div className="flex items-center gap-2">
                      <Badge className={STATUS_CONFIG[file.status].color}>
                        {STATUS_CONFIG[file.status].label}
                      </Badge>
                      <Badge variant="outline" className={ACCESS_CONFIG[file.accessLevel].color}>
                        <AccessIcon className="h-3 w-3 mr-1" />
                        {file.accessLevel}
                      </Badge>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(file.uploadedAt).toLocaleTimeString()}
                      </span>
                      {file.metadata.gpsLat && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          GPS
                        </span>
                      )}
                    </div>

                    {/* Hash */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Fingerprint className="h-3 w-3" />
                      <span className="font-mono truncate">{file.hashDigest}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedMedia(file)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{file.filename}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                              <img 
                                src={file.thumbnailUrl} 
                                alt={file.filename}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Uploaded By</p>
                                <p className="font-medium">{file.uploadedBy}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Polling Station</p>
                                <p className="font-medium">{file.pollingStation}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Device</p>
                                <p className="font-medium">{file.metadata.device || 'Unknown'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Hash Digest</p>
                                <p className="font-mono text-xs">{file.hashDigest}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Downloading ${file.filename}`, { description: `Size: ${formatFileSize(file.size)}` });
                      }}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        const shareUrl = `https://peaceverse.africa/media/${file.id}`;
                        navigator.clipboard.writeText(shareUrl);
                        toast.success('Share link copied', { description: shareUrl });
                      }}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* API Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Media API
                </CardTitle>
                <CardDescription>
                  Programmatic access to election media evidence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Secure API Access</AlertTitle>
                  <AlertDescription>
                    All API requests require authentication. Media files are served with 
                    cryptographic integrity verification and access logging.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Base URL</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                      https://api.peaceverse.africa/v1/media
                    </code>
                    <Button variant="outline" size="icon" onClick={() => handleCopyToken('https://api.peaceverse.africa/v1/media')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Endpoints</Label>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-muted rounded">
                      <code className="text-green-600">GET</code> <code>/files</code>
                      <p className="text-xs text-muted-foreground">List all accessible media files</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <code className="text-green-600">GET</code> <code>/files/:id</code>
                      <p className="text-xs text-muted-foreground">Get file metadata and download URL</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <code className="text-blue-600">POST</code> <code>/verify/:hash</code>
                      <p className="text-xs text-muted-foreground">Verify file integrity by hash</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Tokens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Tokens
                  </span>
                  <Button size="sm" onClick={handleGenerateToken}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {tokens.map(token => (
                      <Card key={token.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{token.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                Created {new Date(token.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={token.isActive ? 'default' : 'secondary'}>
                              {token.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <code className="flex-1 p-2 bg-muted rounded text-xs font-mono truncate">
                              {token.token}
                            </code>
                            <Button variant="outline" size="icon" onClick={() => handleCopyToken(token.token)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {token.permissions.map(p => (
                              <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                            ))}
                          </div>
                          
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Usage: {token.usageCount}/{token.maxUsage}</span>
                            <span>Expires: {new Date(token.expiresAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Media Access Audit Trail
              </CardTitle>
              <CardDescription>
                Complete log of all media access and modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>User/Token</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs">{new Date().toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline">VIEW</Badge></TableCell>
                    <TableCell className="font-mono text-xs">polling_station_001.jpg</TableCell>
                    <TableCell>Observer John K.</TableCell>
                    <TableCell className="font-mono text-xs">102.89.45.123</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Success</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">{new Date(Date.now() - 600000).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline">DOWNLOAD</Badge></TableCell>
                    <TableCell className="font-mono text-xs">vote_counting.mp4</TableCell>
                    <TableCell>API: Media Partner</TableCell>
                    <TableCell className="font-mono text-xs">41.139.28.67</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Success</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">{new Date(Date.now() - 1200000).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline">VERIFY</Badge></TableCell>
                    <TableCell className="font-mono text-xs">witness_testimony.m4a</TableCell>
                    <TableCell>System Auto-Check</TableCell>
                    <TableCell className="font-mono text-xs">Internal</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Verified</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
