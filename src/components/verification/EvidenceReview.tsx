import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image, Video, FileText, Mic, MapPin, 
  CheckCircle, XCircle, AlertCircle, ZoomIn, Download,
  Clock, Camera, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EvidenceItem {
  id: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'location';
  url: string;
  thumbnail?: string;
  filename: string;
  uploadedAt: string;
  metadata: {
    size?: string;
    duration?: string;
    location?: string;
    device?: string;
    originalDate?: string;
  };
  authenticityStatus: 'verified' | 'suspicious' | 'pending' | 'flagged';
  authenticityNotes?: string;
}

interface EvidenceReviewProps {
  evidence: EvidenceItem[];
  onEvidenceVerify: (id: string, status: 'verified' | 'suspicious' | 'flagged') => void;
}

const TYPE_ICONS = {
  image: <Image className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
  audio: <Mic className="w-4 h-4" />,
  location: <MapPin className="w-4 h-4" />,
};

const STATUS_CONFIG = {
  verified: { color: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" />, label: 'Verified' },
  suspicious: { color: 'bg-yellow-500', icon: <AlertCircle className="w-4 h-4" />, label: 'Suspicious' },
  pending: { color: 'bg-gray-500', icon: <Clock className="w-4 h-4" />, label: 'Pending Review' },
  flagged: { color: 'bg-red-500', icon: <XCircle className="w-4 h-4" />, label: 'Flagged' },
};

// Mock evidence data
const MOCK_EVIDENCE: EvidenceItem[] = [
  {
    id: '1',
    type: 'image',
    url: '/placeholder.svg',
    thumbnail: '/placeholder.svg',
    filename: 'incident_photo_001.jpg',
    uploadedAt: '2024-12-03T14:30:00Z',
    metadata: {
      size: '2.4 MB',
      location: 'Nairobi, Kenya (-1.2921, 36.8219)',
      device: 'Samsung Galaxy S21',
      originalDate: '2024-12-03T14:25:00Z',
    },
    authenticityStatus: 'pending',
  },
  {
    id: '2',
    type: 'video',
    url: '/placeholder.svg',
    thumbnail: '/placeholder.svg',
    filename: 'incident_recording.mp4',
    uploadedAt: '2024-12-03T14:35:00Z',
    metadata: {
      size: '45.2 MB',
      duration: '2:34',
      location: 'Nairobi, Kenya (-1.2923, 36.8221)',
      device: 'iPhone 14 Pro',
      originalDate: '2024-12-03T14:28:00Z',
    },
    authenticityStatus: 'verified',
    authenticityNotes: 'Video metadata consistent with report timeline. No signs of manipulation detected.',
  },
  {
    id: '3',
    type: 'document',
    url: '/placeholder.svg',
    filename: 'police_report_copy.pdf',
    uploadedAt: '2024-12-03T15:00:00Z',
    metadata: {
      size: '156 KB',
    },
    authenticityStatus: 'suspicious',
    authenticityNotes: 'Document formatting inconsistent with official police report templates.',
  },
  {
    id: '4',
    type: 'audio',
    url: '/placeholder.svg',
    filename: 'witness_statement.m4a',
    uploadedAt: '2024-12-03T15:15:00Z',
    metadata: {
      size: '8.3 MB',
      duration: '5:42',
    },
    authenticityStatus: 'pending',
  },
];

export const EvidenceReview = ({ evidence = MOCK_EVIDENCE, onEvidenceVerify }: EvidenceReviewProps) => {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  const evidenceByType = evidence.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, EvidenceItem[]>);

  const verifiedCount = evidence.filter(e => e.authenticityStatus === 'verified').length;
  const pendingCount = evidence.filter(e => e.authenticityStatus === 'pending').length;
  const flaggedCount = evidence.filter(e => ['suspicious', 'flagged'].includes(e.authenticityStatus)).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Evidence Review
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-500/10">
              {verifiedCount} Verified
            </Badge>
            <Badge variant="outline" className="bg-yellow-500/10">
              {pendingCount} Pending
            </Badge>
            {flaggedCount > 0 && (
              <Badge variant="destructive">
                {flaggedCount} Flagged
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="all">All ({evidence.length})</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="document">Docs</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {evidence.map((item, index) => (
              <EvidenceCard
                key={item.id}
                item={item}
                index={index}
                onSelect={() => setSelectedEvidence(item)}
                onVerify={onEvidenceVerify}
              />
            ))}
          </TabsContent>

          {Object.entries(evidenceByType).map(([type, items]) => (
            <TabsContent key={type} value={type} className="space-y-3">
              {items.map((item, index) => (
                <EvidenceCard
                  key={item.id}
                  item={item}
                  index={index}
                  onSelect={() => setSelectedEvidence(item)}
                  onVerify={onEvidenceVerify}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {evidence.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No evidence attached to this report</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface EvidenceCardProps {
  item: EvidenceItem;
  index: number;
  onSelect: () => void;
  onVerify: (id: string, status: 'verified' | 'suspicious' | 'flagged') => void;
}

const EvidenceCard = ({ item, index, onSelect, onVerify }: EvidenceCardProps) => {
  const statusConfig = STATUS_CONFIG[item.authenticityStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
    >
      {/* Thumbnail/Icon */}
      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.filename} className="w-full h-full object-cover" />
        ) : (
          <div className="text-muted-foreground">{TYPE_ICONS[item.type]}</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              {TYPE_ICONS[item.type]}
              <span className="font-medium text-sm truncate">{item.filename}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusConfig.color}>
                {statusConfig.icon}
                <span className="ml-1">{statusConfig.label}</span>
              </Badge>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSelect}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
          {item.metadata.size && <span>Size: {item.metadata.size}</span>}
          {item.metadata.duration && <span>Duration: {item.metadata.duration}</span>}
          {item.metadata.device && <span>Device: {item.metadata.device}</span>}
          {item.metadata.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {item.metadata.location}
            </span>
          )}
        </div>

        {/* Authenticity Notes */}
        {item.authenticityNotes && (
          <p className="text-xs mt-2 p-2 bg-muted rounded text-muted-foreground">
            <Shield className="w-3 h-3 inline mr-1" />
            {item.authenticityNotes}
          </p>
        )}

        {/* Verification Actions */}
        {item.authenticityStatus === 'pending' && (
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 hover:bg-green-50"
              onClick={() => onVerify(item.id, 'verified')}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Verify
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-yellow-600 hover:bg-yellow-50"
              onClick={() => onVerify(item.id, 'suspicious')}
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Suspicious
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:bg-red-50"
              onClick={() => onVerify(item.id, 'flagged')}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Flag
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
