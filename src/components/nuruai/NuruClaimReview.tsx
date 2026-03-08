import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Search, Loader2, CheckCircle, XCircle, AlertTriangle, HelpCircle,
  FileText, Quote, Shield, History, Clock, BarChart3, Share2, Copy,
  ExternalLink, Globe, ListChecks, ChevronDown, ChevronRight,
  Sparkles, Link2, Code2, Eye, EyeOff, BookOpen,
} from 'lucide-react';
import { useCivicDocuments, useReviewClaim, useClaimReviewHistory, useBatchReviewClaims, useToggleClaimPublic } from '@/hooks/useNuruAI';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string; ratingText: string }> = {
  supported: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Supported by Evidence', ratingText: 'True' },
  unsupported: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', label: 'Not Supported', ratingText: 'False' },
  misleading: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Potentially Misleading', ratingText: 'Misleading' },
  needs_context: { icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Needs More Context', ratingText: 'Unverifiable' },
};

const NuruClaimReview = () => {
  const [claimText, setClaimText] = useState('');
  const [claimSource, setClaimSource] = useState('');
  const [claimSourceUrl, setClaimSourceUrl] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('verify');
  const [inputMode, setInputMode] = useState<'single' | 'batch'>('single');
  const [batchText, setBatchText] = useState('');
  const [batchResults, setBatchResults] = useState<any>(null);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [showSchemaPreview, setShowSchemaPreview] = useState(false);

  const { data: documents } = useCivicDocuments();
  const { data: history } = useClaimReviewHistory();
  const reviewClaim = useReviewClaim();
  const batchReview = useBatchReviewClaims();
  const togglePublic = useToggleClaimPublic();

  const handleSingleReview = () => {
    if (!claimText.trim()) return;
    reviewClaim.mutate({
      claimText,
      documentId: (selectedDocId && selectedDocId !== 'none') ? selectedDocId : undefined,
      claimSource: claimSource || undefined,
      claimSourceUrl: claimSourceUrl || undefined,
    }, { onSuccess: (data) => setResult(data) });
  };

  const handleBatchReview = () => {
    const claims = batchText.split('\n').map(l => l.trim()).filter(l => l.length > 10);
    if (claims.length === 0) return;
    if (claims.length > 10) { toast.error('Maximum 10 claims per batch'); return; }
    batchReview.mutate({
      claims,
      documentId: (selectedDocId && selectedDocId !== 'none') ? selectedDocId : undefined,
    }, { onSuccess: (data) => { setBatchResults(data); setActiveTab('batch-results'); } });
  };

  const handleCopyShareLink = (token: string, isPublic: boolean) => {
    if (!isPublic) {
      toast.warning('This fact-check is not public yet. Enable the "Public" toggle first so others can view it.');
      return;
    }
    const url = `${window.location.origin}/fact-check/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard');
  };

  const handleCopySchema = (schema: any) => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    toast.success('ClaimReview JSON-LD copied');
  };

  const handleTogglePublic = (reviewId: string, currentState: boolean) => {
    togglePublic.mutate({ reviewId, isPublic: !currentState });
  };

  const statusInfo = result ? statusConfig[result.status] || statusConfig.needs_context : null;

  const stats = useMemo(() => {
    const total = history?.length || 0;
    const supported = history?.filter((h: any) => h.review_status === 'supported').length || 0;
    const flagged = history?.filter((h: any) => ['misleading', 'unsupported'].includes(h.review_status)).length || 0;
    const avgConfidence = history?.length ? Math.round(history.reduce((sum: number, h: any) => sum + (h.confidence_score || 0.5), 0) / history.length * 100) : 0;
    return { total, supported, flagged, avgConfidence };
  }, [history]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="verify" className="gap-2 rounded-lg text-xs"><Shield className="h-3.5 w-3.5" />Verify</TabsTrigger>
          <TabsTrigger value="history" className="gap-2 rounded-lg text-xs"><History className="h-3.5 w-3.5" />History ({stats.total})</TabsTrigger>
          {batchResults && (
            <TabsTrigger value="batch-results" className="gap-2 rounded-lg text-xs"><ListChecks className="h-3.5 w-3.5" />Batch Results</TabsTrigger>
          )}
        </TabsList>

        {/* ========== VERIFY TAB ========== */}
        <TabsContent value="verify" className="space-y-5 mt-4">
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Reviews', value: stats.total, icon: BarChart3, color: 'text-primary' },
              { label: 'Supported', value: stats.supported, icon: CheckCircle, color: 'text-emerald-500' },
              { label: 'Flagged', value: stats.flagged, icon: AlertTriangle, color: 'text-amber-500' },
              { label: 'Avg Confidence', value: `${stats.avgConfidence}%`, icon: Sparkles, color: 'text-blue-500' },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl border border-border/30 bg-card/40">
                <s.icon className={`h-4 w-4 ${s.color} mb-1`} />
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Input Card */}
          <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/15">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">IFCN-Standard Fact Verification</h2>
                  <p className="text-[11px] text-muted-foreground">Multi-source cross-referencing with ClaimReview Schema.org output</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={inputMode === 'single' ? 'default' : 'outline'}
                  size="sm" className="h-7 text-[10px] rounded-lg"
                  onClick={() => setInputMode('single')}
                >Single</Button>
                <Button
                  variant={inputMode === 'batch' ? 'default' : 'outline'}
                  size="sm" className="h-7 text-[10px] rounded-lg gap-1"
                  onClick={() => setInputMode('batch')}
                ><ListChecks className="h-3 w-3" />Batch</Button>
              </div>
            </div>

            {inputMode === 'single' ? (
              <>
                <Textarea
                  placeholder='Enter a claim to verify, e.g., "The government allocated 30% of the budget to education..."'
                  rows={3}
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  className="rounded-xl mb-3 bg-background/50 text-sm"
                />
                {/* Source attribution fields */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Input
                    placeholder="Claim source (e.g., politician name, media)"
                    value={claimSource}
                    onChange={(e) => setClaimSource(e.target.value)}
                    className="rounded-xl bg-background/50 text-xs h-9"
                  />
                  <Input
                    placeholder="Source URL (optional)"
                    value={claimSourceUrl}
                    onChange={(e) => setClaimSourceUrl(e.target.value)}
                    className="rounded-xl bg-background/50 text-xs h-9"
                  />
                </div>
              </>
            ) : (
              <>
                <Textarea
                  placeholder="Enter multiple claims, one per line (max 10):\n\n1. The budget allocated 30% to education\n2. Healthcare spending decreased by 15%\n3. Road infrastructure received KES 200 billion"
                  rows={6}
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  className="rounded-xl mb-3 bg-background/50 text-sm font-mono"
                />
                <p className="text-[10px] text-muted-foreground mb-3">
                  {batchText.split('\n').filter(l => l.trim().length > 10).length}/10 claims detected
                </p>
              </>
            )}

            <div className="flex gap-3">
              <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                <SelectTrigger className="flex-1 rounded-xl bg-background/50 text-xs">
                  <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Reference document (auto-searches all)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Auto-search all documents</SelectItem>
                  {documents?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                onClick={inputMode === 'single' ? handleSingleReview : handleBatchReview}
                disabled={(inputMode === 'single' ? reviewClaim.isPending : batchReview.isPending) || (inputMode === 'single' ? !claimText.trim() : batchText.split('\n').filter(l => l.trim().length > 10).length === 0)}
                className="gap-2 rounded-xl px-5"
              >
                {(reviewClaim.isPending || batchReview.isPending) ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
                ) : (
                  <><Search className="h-4 w-4" /> {inputMode === 'single' ? 'Verify' : 'Verify All'}</>
                )}
              </Button>
            </div>
          </div>

          {/* Single Result */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <FactCheckResultCard
                  result={result}
                  statusInfo={statusInfo}
                  onCopyShareLink={handleCopyShareLink}
                  onCopySchema={handleCopySchema}
                  onTogglePublic={handleTogglePublic}
                  showSchemaPreview={showSchemaPreview}
                  onToggleSchemaPreview={() => setShowSchemaPreview(!showSchemaPreview)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {!result && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Shield className="h-12 w-12 text-muted-foreground/15 mb-3" />
              <p className="text-sm text-muted-foreground">Enter a claim to verify against official documents</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Cross-references all uploaded documents & constitutions automatically</p>
            </div>
          )}
        </TabsContent>

        {/* ========== BATCH RESULTS TAB ========== */}
        <TabsContent value="batch-results" className="mt-4">
          {batchResults?.results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Batch Verification Results</h3>
                <Badge variant="outline" className="text-[10px]">{batchResults.results.length} claims verified</Badge>
              </div>
              {/* Progress summary */}
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(statusConfig).map(([key, cfg]) => {
                  const count = batchResults.results.filter((r: any) => r.status === key).length;
                  return (
                    <div key={key} className={`p-2 rounded-lg border ${cfg.bg} text-center`}>
                      <p className="text-lg font-bold">{count}</p>
                      <p className="text-[9px] text-muted-foreground">{cfg.label}</p>
                    </div>
                  );
                })}
              </div>
              {batchResults.results.map((r: any, i: number) => {
                const st = statusConfig[r.status] || statusConfig.needs_context;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className={`rounded-xl border ${st.bg} p-4`}>
                      <div className="flex items-start gap-3">
                        <st.icon className={`h-5 w-5 ${st.color} mt-0.5 shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1">"{r.claim}"</p>
                          <Badge variant="outline" className={`text-[10px] mb-2 ${st.bg}`}>{st.label}</Badge>
                          {r.confidence != null && (
                            <div className="flex items-center gap-2 mb-2">
                              <Progress value={r.confidence * 100} className="h-1.5 flex-1" />
                              <span className="text-[10px] text-muted-foreground">{Math.round(r.confidence * 100)}%</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">{r.evidenceSummary}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ========== HISTORY TAB ========== */}
        <TabsContent value="history" className="mt-4">
          <div className="space-y-2">
            {history?.map((item: any, i: number) => {
              const st = statusConfig[item.review_status] || statusConfig.needs_context;
              const isExpanded = expandedHistory === item.id;
              return (
                <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <div className="rounded-xl border border-border/30 bg-card/40 hover:border-primary/15 transition-all overflow-hidden">
                    <button
                      className="w-full p-4 text-left flex items-start justify-between gap-3"
                      onClick={() => setExpandedHistory(isExpanded ? null : item.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">{item.claim_text}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] gap-1 ${st.bg}`}>
                            <st.icon className={`h-2.5 w-2.5 ${st.color}`} />{st.label}
                          </Badge>
                          {item.confidence_score != null && (
                            <span className="text-[10px] text-muted-foreground">{Math.round(item.confidence_score * 100)}% confidence</span>
                          )}
                          {item.civic_documents?.title && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <FileText className="h-2.5 w-2.5" />{item.civic_documents.title}
                            </span>
                          )}
                          {item.source_documents?.length > 1 && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <BookOpen className="h-2.5 w-2.5" />{item.source_documents.length} sources
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />{format(new Date(item.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.is_public && <Globe className="h-3.5 w-3.5 text-primary" />}
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">
                            {item.evidence_summary && (
                              <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Evidence Summary</p>
                                <p className="text-xs text-foreground/80">{item.evidence_summary}</p>
                              </div>
                            )}
                            {item.recommendation && (
                              <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                                <p className="text-[10px] font-semibold text-primary mb-0.5">💡 Recommendation</p>
                                <p className="text-xs text-foreground/70">{item.recommendation}</p>
                              </div>
                            )}
                            {item.source_documents?.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Sources Referenced</p>
                                <div className="flex flex-wrap gap-1">
                                  {item.source_documents.map((s: any, si: number) => (
                                    <Badge key={si} variant="outline" className="text-[9px]">{s.title}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-3 pt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground">Public</span>
                                <Switch
                                  checked={item.is_public}
                                  onCheckedChange={() => handleTogglePublic(item.id, item.is_public)}
                                  className="h-4 w-7"
                                />
                              </div>
                              {item.share_token && (
                                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => handleCopyShareLink(item.share_token, item.is_public)}>
                                  <Link2 className="h-3 w-3" />Copy Link
                                </Button>
                              )}
                              {item.claimreview_schema && (
                                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => handleCopySchema(item.claimreview_schema)}>
                                  <Code2 className="h-3 w-3" />Copy Schema
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
            {(!history || history.length === 0) && (
              <div className="text-center py-14 text-muted-foreground">
                <History className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No review history yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ========== VERDICT RESULT CARD ========== */
function FactCheckResultCard({ result, statusInfo, onCopyShareLink, onCopySchema, onTogglePublic, showSchemaPreview, onToggleSchemaPreview }: {
  result: any; statusInfo: any; onCopyShareLink: (t: string, isPublic: boolean) => void; onCopySchema: (s: any) => void;
  onTogglePublic: (id: string, current: boolean) => void; showSchemaPreview: boolean; onToggleSchemaPreview: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden">
      {/* Verdict Header */}
      <div className={`p-4 border-b ${statusInfo?.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusInfo && <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />}
            <div>
              <h3 className="font-semibold text-sm">{result.verdictLabel || statusInfo?.label}</h3>
              {result.confidence != null && (
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={result.confidence * 100} className="h-1.5 w-24" />
                  <span className="text-xs text-muted-foreground">{Math.round(result.confidence * 100)}% confidence</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {result.shareToken && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopyShareLink(result.shareToken, result.isPublic ?? false)} title="Copy share link">
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            {result.claimReviewSchema && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopySchema(result.claimReviewSchema)} title="Copy ClaimReview JSON-LD">
                <Code2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Evidence Summary */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Evidence Summary</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
            <ReactMarkdown>{result.evidenceSummary}</ReactMarkdown>
          </div>
        </div>

        {/* Detailed Fact Checks */}
        {result.factCheckDetails?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Detailed Fact Check</h4>
            <div className="space-y-2">
              {result.factCheckDetails.map((fc: any, i: number) => {
                const fcStatus = statusConfig[fc.verdict] || statusConfig.needs_context;
                return (
                  <div key={i} className={`p-3 rounded-xl border ${fcStatus.bg}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <fcStatus.icon className={`h-3.5 w-3.5 ${fcStatus.color}`} />
                      <span className="text-xs font-medium">{fc.claim}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground ml-5">{fc.evidence}</p>
                    {fc.sourceDocument && (
                      <p className="text-[10px] text-primary/60 ml-5 mt-1 flex items-center gap-1">
                        <FileText className="h-2.5 w-2.5" />{fc.sourceDocument}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sources Used */}
        {result.sourcesUsed?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="h-3 w-3" />Sources Cross-Referenced ({result.sourcesUsed.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.sourcesUsed.map((s: any, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px] gap-1">
                  <FileText className="h-2.5 w-2.5" />{s.title}
                  <span className="text-muted-foreground/50">({s.type})</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Supporting Passages */}
        {result.supportingPassages?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Quote className="h-3 w-3" />Supporting Evidence
            </h4>
            <div className="space-y-2">
              {result.supportingPassages.map((p: string, i: number) => (
                <div key={i} className="text-xs bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 italic text-muted-foreground">"{p}"</div>
              ))}
            </div>
          </div>
        )}

        {/* Contradicting Evidence */}
        {result.contradictingEvidence?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <XCircle className="h-3 w-3 text-red-500" />Contradicting Evidence
            </h4>
            <div className="space-y-2">
              {result.contradictingEvidence.map((p: string, i: number) => (
                <div key={i} className="text-xs bg-red-500/5 border border-red-500/10 rounded-xl p-3 italic text-muted-foreground">"{p}"</div>
              ))}
            </div>
          </div>
        )}

        {/* Constitutional Relevance */}
        {result.constitutionalRelevance && (
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
              <Shield className="h-3 w-3" />Constitutional Relevance
            </p>
            <p className="text-xs text-muted-foreground">{result.constitutionalRelevance}</p>
          </div>
        )}

        {/* Recommendation */}
        {result.recommendation && (
          <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
            <p className="text-xs font-medium text-foreground mb-1">💡 Citizen Guidance</p>
            <p className="text-xs text-muted-foreground">{result.recommendation}</p>
          </div>
        )}

        {/* Schema.org Preview */}
        {result.claimReviewSchema && (
          <div>
            <button
              onClick={onToggleSchemaPreview}
              className="text-[10px] text-primary flex items-center gap-1 hover:underline"
            >
              <Code2 className="h-3 w-3" />
              {showSchemaPreview ? 'Hide' : 'View'} ClaimReview Schema.org JSON-LD
            </button>
            <AnimatePresence>
              {showSchemaPreview && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <pre className="mt-2 p-3 rounded-xl bg-muted/50 border border-border/20 text-[10px] overflow-x-auto font-mono text-muted-foreground max-h-48">
                    {JSON.stringify(result.claimReviewSchema, null, 2)}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 pt-2 border-t border-border/20">
          {result.processingTime && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />{(result.processingTime / 1000).toFixed(1)}s
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />AI-generated — verify with primary sources
          </span>
        </div>
      </div>
    </div>
  );
}

export default NuruClaimReview;
