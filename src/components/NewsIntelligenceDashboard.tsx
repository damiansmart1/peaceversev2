import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  useNewsIntelligenceReports,
  useScanBatches,
  useSourceRegistry,
  useTriggerScan,
  useReviewReport,
  type NewsIntelligenceReport,
} from '@/hooks/useNewsIntelligence';
import {
  Radar, Newspaper, ShieldCheck, Clock, AlertTriangle, CheckCircle2, XCircle,
  ArrowUpRight, Globe, Users, Zap, TrendingUp, ExternalLink, Loader2,
  BarChart3, Eye, Search, RefreshCw, FileCheck, BrainCircuit
} from 'lucide-react';
import { useTranslationContext } from '@/components/TranslationProvider';
import { format, formatDistanceToNow } from 'date-fns';

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending_review: <Clock className="h-4 w-4 text-amber-500" />,
  approved: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
  escalated: <AlertTriangle className="h-4 w-4 text-orange-500" />,
};

function CredibilityMeter({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : score >= 40 ? 'text-orange-500' : 'text-red-500';
  const bgColor = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500';
  const sizeClasses = size === 'sm' ? 'w-10 h-10 text-xs' : size === 'lg' ? 'w-20 h-20 text-xl' : 'w-14 h-14 text-sm';

  return (
    <div className={`relative ${sizeClasses} rounded-full flex items-center justify-center border-2 ${color} border-current`}>
      <div className={`absolute inset-1 rounded-full ${bgColor} opacity-10`} />
      <span className={`font-bold ${color}`}>{Math.round(score)}</span>
    </div>
  );
}

function ReportCard({ report, onReview }: { report: NewsIntelligenceReport; onReview: (r: NewsIntelligenceReport) => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4" style={{
      borderLeftColor: report.severity_level === 'critical' ? '#ef4444' :
        report.severity_level === 'high' ? '#f97316' :
        report.severity_level === 'medium' ? '#eab308' : '#22c55e'
    }} onClick={() => onReview(report)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <CredibilityMeter score={report.credibility_score} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {statusIcons[report.review_status]}
              <Badge variant="outline" className={severityColors[report.severity_level] || ''}>
                {report.severity_level}
              </Badge>
              <Badge variant="outline" className="text-xs">{report.category.replace(/_/g, ' ')}</Badge>
            </div>
            <h4 className="font-semibold text-sm line-clamp-2">{report.title}</h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.summary}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Newspaper className="h-3 w-3" />
                {report.source_count} sources
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {report.affected_countries?.join(', ') || 'Global'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportDetailDialog({
  report,
  open,
  onClose,
}: {
  report: NewsIntelligenceReport | null;
  open: boolean;
  onClose: () => void;
}) {
  const [reviewNotes, setReviewNotes] = useState('');
  const reviewMutation = useReviewReport();

  if (!report) return null;

  const handleAction = (action: 'approve' | 'reject' | 'escalate') => {
    reviewMutation.mutate(
      { reportId: report.id, action, notes: reviewNotes },
      { onSuccess: () => { onClose(); setReviewNotes(''); } }
    );
  };

  const methodology = report.credibility_methodology || {};

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg">AI Intelligence Report</DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-4">
              <CredibilityMeter score={report.credibility_score} size="lg" />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{report.title}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className={severityColors[report.severity_level]}>{report.severity_level}</Badge>
                  <Badge variant="outline">{report.category.replace(/_/g, ' ')}</Badge>
                  {report.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileCheck className="h-4 w-4" /> Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{report.summary}</p>
              </CardContent>
            </Card>

            {/* Credibility Methodology */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Credibility Scoring Methodology
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {methodology.source_authority && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Source Authority ({methodology.source_authority.weight})</span>
                    <div className="flex items-center gap-2">
                      <Progress value={methodology.source_authority.score} className="w-24 h-2" />
                      <span className="font-medium w-8 text-right">{methodology.source_authority.score}</span>
                    </div>
                  </div>
                )}
                {methodology.cross_reference && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Cross-Reference ({methodology.cross_reference.weight}) — {methodology.cross_reference.unique_sources} sources</span>
                    <div className="flex items-center gap-2">
                      <Progress value={methodology.cross_reference.score} className="w-24 h-2" />
                      <span className="font-medium w-8 text-right">{methodology.cross_reference.score}</span>
                    </div>
                  </div>
                )}
                {methodology.tier1_presence && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Tier-1 Presence ({methodology.tier1_presence.weight}) — {methodology.tier1_presence.tier1_sources} major outlets</span>
                    <div className="flex items-center gap-2">
                      <Progress value={methodology.tier1_presence.score} className="w-24 h-2" />
                      <span className="font-medium w-8 text-right">{methodology.tier1_presence.score}</span>
                    </div>
                  </div>
                )}
                {methodology.consistency && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Source Consistency ({methodology.consistency.weight})</span>
                    <div className="flex items-center gap-2">
                      <Progress value={methodology.consistency.score} className="w-24 h-2" />
                      <span className="font-medium w-8 text-right">{methodology.consistency.score}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            {report.detailed_analysis && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> Detailed Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-line">{report.detailed_analysis}</p>
                </CardContent>
              </Card>
            )}

            {/* Cross-Reference Summary */}
            {report.cross_reference_summary && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Search className="h-4 w-4" /> Source Cross-Reference
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{report.cross_reference_summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Key Facts */}
            {report.key_facts?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Key Verified Facts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.key_facts.map((fact: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Badge variant={fact.confidence === 'high' ? 'default' : 'outline'} className="text-xs mt-0.5 shrink-0">
                          {fact.confidence}
                        </Badge>
                        <span>{fact.fact}</span>
                        {fact.sources_confirming && (
                          <span className="text-xs text-muted-foreground shrink-0">({fact.sources_confirming} sources)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sources */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Newspaper className="h-4 w-4" /> Sources ({report.source_count})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {report.source_urls?.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="font-medium">{report.source_names?.[i] || 'Source'}</span>
                      <span className="text-xs text-muted-foreground truncate">{url}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Actions */}
            {report.recommended_actions?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" /> Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.recommended_actions.map((action: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
                        <Badge variant="outline" className={
                          action.priority === 'immediate' ? 'border-red-500 text-red-500' :
                          action.priority === 'urgent' ? 'border-orange-500 text-orange-500' :
                          'border-muted-foreground'
                        }>{action.priority}</Badge>
                        <div>
                          <p>{action.action}</p>
                          {action.target && (
                            <span className="text-xs text-muted-foreground">Target: {action.target}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Section */}
            {report.review_status === 'pending_review' && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Review Decision</h4>
                  <Textarea
                    placeholder="Add review notes (optional)..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAction('approve')}
                      disabled={reviewMutation.isPending}
                      className="flex-1 gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve & Publish
                    </Button>
                    <Button
                      onClick={() => handleAction('escalate')}
                      disabled={reviewMutation.isPending}
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Escalate
                    </Button>
                    <Button
                      onClick={() => handleAction('reject')}
                      disabled={reviewMutation.isPending}
                      variant="destructive"
                      className="flex-1 gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default function NewsIntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState('queue');
  const [statusFilter, setStatusFilter] = useState<string>('pending_review');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<NewsIntelligenceReport | null>(null);

  const { data: reports, isLoading: reportsLoading } = useNewsIntelligenceReports({
    status: statusFilter === 'all' ? undefined : statusFilter,
    severity: severityFilter === 'all' ? undefined : severityFilter,
  });
  const { data: batches } = useScanBatches();
  const { data: sources } = useSourceRegistry();
  const scanMutation = useTriggerScan();

  const pendingCount = reports?.filter(r => r.review_status === 'pending_review').length || 0;
  const approvedCount = reports?.filter(r => r.review_status === 'approved').length || 0;
  const latestBatch = batches?.[0];
  const isScanning = latestBatch?.status === 'running';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            AI News Intelligence
          </h2>
          <p className="text-sm text-muted-foreground">
            Automated multi-source news scanning, cross-referencing & credibility scoring
          </p>
        </div>
        <Button
          onClick={() => scanMutation.mutate({})}
          disabled={scanMutation.isPending || isScanning}
          size="lg"
          className="gap-2"
        >
          {scanMutation.isPending || isScanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Radar className="h-4 w-4" />
          )}
          {isScanning ? 'Scanning...' : 'Scan Now'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Newspaper className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{latestBatch?.articles_processed || 0}</p>
              <p className="text-xs text-muted-foreground">Articles (Last Scan)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <ShieldCheck className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sources?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Tracked Sources</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan Status Banner */}
      {isScanning && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">Intelligence scan in progress...</p>
              <p className="text-xs text-muted-foreground">
                Scanning GDELT for conflict-related news across Africa and globally
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue" className="gap-1">
            <Eye className="h-4 w-4" />
            Review Queue
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center text-xs">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sources" className="gap-1">
            <Globe className="h-4 w-4" />
            Source Registry
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            Scan History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports List */}
          {reportsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reports?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Radar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold">No intelligence reports yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Scan Now" to pull and analyze news from multiple sources
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports?.map(report => (
                <ReportCard key={report.id} report={report} onReview={setSelectedReport} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sources" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tracked News Sources & Credibility Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              {sources?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No sources tracked yet. Run a scan to build the source registry.
                </p>
              ) : (
                <div className="space-y-2">
                  {sources?.map(source => (
                    <div key={source.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        {source.is_primary_source && (
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{source.domain}</p>
                          <p className="text-xs text-muted-foreground">
                            {source.total_articles_scanned} articles scanned
                            {source.last_scanned_at && ` • Last: ${formatDistanceToNow(new Date(source.last_scanned_at), { addSuffix: true })}`}
                          </p>
                        </div>
                      </div>
                      <CredibilityMeter score={source.credibility_score} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Scan History</CardTitle>
            </CardHeader>
            <CardContent>
              {batches?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No scans completed yet.</p>
              ) : (
                <div className="space-y-3">
                  {batches?.map(batch => (
                    <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${batch.status === 'completed' ? 'bg-green-500/10' : batch.status === 'running' ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
                          {batch.status === 'running' ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          ) : batch.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">{batch.scan_type} Scan</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(batch.started_at), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{batch.articles_found} found</span>
                        <span>{batch.articles_processed} processed</span>
                        <span>{batch.clusters_identified} clusters</span>
                        <Badge variant="outline">{batch.reports_generated} reports</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Detail Dialog */}
      <ReportDetailDialog
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
