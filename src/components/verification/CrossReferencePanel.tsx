import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Link2, MapPin, Clock, AlertTriangle, CheckCircle, 
  ExternalLink, TrendingUp, Users, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RelatedReport {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  status: 'verified' | 'pending' | 'rejected';
  similarity: number;
  distance: string;
  timeDifference: string;
  isCorroborating: boolean;
}

interface ExternalSource {
  id: string;
  source: string;
  title: string;
  url: string;
  date: string;
  relevance: 'high' | 'medium' | 'low';
  type: 'news' | 'social' | 'official' | 'ngo';
}

interface CrossReferencePanelProps {
  reportId: string;
  location: { lat: number; lng: number; name: string };
  date: string;
  category: string;
}

// Mock related reports
const MOCK_RELATED_REPORTS: RelatedReport[] = [
  {
    id: 'rel-1',
    title: 'Community Tension at Kibera Market',
    category: 'Community Conflict',
    location: 'Kibera, Nairobi',
    date: '2024-12-02',
    status: 'verified',
    similarity: 85,
    distance: '2.3 km',
    timeDifference: '1 day before',
    isCorroborating: true,
  },
  {
    id: 'rel-2',
    title: 'Youth Group Confrontation Reported',
    category: 'Community Conflict',
    location: 'Langata, Nairobi',
    date: '2024-12-03',
    status: 'pending',
    similarity: 72,
    distance: '4.1 km',
    timeDifference: 'Same day',
    isCorroborating: true,
  },
  {
    id: 'rel-3',
    title: 'Market Dispute Resolution Meeting',
    category: 'Peace Initiative',
    location: 'Kibera, Nairobi',
    date: '2024-12-01',
    status: 'verified',
    similarity: 65,
    distance: '1.8 km',
    timeDifference: '2 days before',
    isCorroborating: false,
  },
];

// Mock external sources
const MOCK_EXTERNAL_SOURCES: ExternalSource[] = [
  {
    id: 'ext-1',
    source: 'Daily Nation',
    title: 'Tensions Rise in Kibera Over Market Access',
    url: 'https://example.com/news/1',
    date: '2024-12-03',
    relevance: 'high',
    type: 'news',
  },
  {
    id: 'ext-2',
    source: 'Kenya Red Cross',
    title: 'Community Response Team Deployed',
    url: 'https://example.com/ngo/1',
    date: '2024-12-03',
    relevance: 'high',
    type: 'ngo',
  },
  {
    id: 'ext-3',
    source: 'Twitter/X',
    title: 'Local residents report increased police presence',
    url: 'https://example.com/social/1',
    date: '2024-12-03',
    relevance: 'medium',
    type: 'social',
  },
];

const STATUS_COLORS = {
  verified: 'bg-green-500',
  pending: 'bg-yellow-500',
  rejected: 'bg-red-500',
};

const RELEVANCE_COLORS = {
  high: 'bg-green-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-500',
};

const SOURCE_ICONS = {
  news: '📰',
  social: '📱',
  official: '🏛️',
  ngo: '🤝',
};

export const CrossReferencePanel = ({ reportId, location, date, category }: CrossReferencePanelProps) => {
  const corroboratingReports = MOCK_RELATED_REPORTS.filter(r => r.isCorroborating && r.status === 'verified');
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Cross-Reference Analysis
          </CardTitle>
          <Badge variant={corroboratingReports.length >= 2 ? "default" : "secondary"}>
            {corroboratingReports.length} Corroborating
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="p-4 rounded-lg bg-muted">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-medium">Cross-Reference Summary</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{MOCK_RELATED_REPORTS.length}</div>
              <div className="text-xs text-muted-foreground">Related Reports</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{corroboratingReports.length}</div>
              <div className="text-xs text-muted-foreground">Corroborating</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{MOCK_EXTERNAL_SOURCES.length}</div>
              <div className="text-xs text-muted-foreground">External Sources</div>
            </div>
          </div>
        </div>

        {/* Related Reports */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Related Platform Reports
          </h4>
          <div className="space-y-3">
            {MOCK_RELATED_REPORTS.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg border ${
                  report.isCorroborating ? 'border-green-500/30 bg-green-500/5' : 'bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{report.title}</span>
                      <Badge className={STATUS_COLORS[report.status]} variant="secondary">
                        {report.status}
                      </Badge>
                      {report.isCorroborating && (
                        <Badge variant="outline" className="text-green-600 border-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Corroborating
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {report.location} ({report.distance})
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {report.timeDifference}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {report.similarity}% similarity
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* External Sources */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            External Source Verification
          </h4>
          <div className="space-y-3">
            {MOCK_EXTERNAL_SOURCES.map((source, index) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{SOURCE_ICONS[source.type]}</span>
                      <span className="text-sm font-medium">{source.source}</span>
                      <Badge className={RELEVANCE_COLORS[source.relevance]} variant="secondary">
                        {source.relevance} relevance
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {source.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Published: {source.date}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Verification Confidence */}
        <div className="p-4 rounded-lg border-2 border-dashed">
          <div className="flex items-center gap-2 mb-2">
            {corroboratingReports.length >= 2 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            )}
            <span className="font-medium">Cross-Reference Assessment</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {corroboratingReports.length >= 2 ? (
              `Strong corroboration: ${corroboratingReports.length} verified reports support this incident. Multiple external sources also confirm the event. High confidence in report accuracy.`
            ) : corroboratingReports.length === 1 ? (
              "Partial corroboration: One verified report supports this incident. Additional verification recommended before full confirmation."
            ) : (
              "Limited corroboration: No verified reports directly support this incident. Rely on evidence analysis and source credibility for verification decision."
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
