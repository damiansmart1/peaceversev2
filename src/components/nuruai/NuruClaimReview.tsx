import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle, HelpCircle, FileText, Quote, Shield, History, Clock, BarChart3 } from 'lucide-react';
import { useCivicDocuments, useReviewClaim, useClaimReviewHistory } from '@/hooks/useNuruAI';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  supported: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Supported by Evidence' },
  unsupported: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', label: 'Not Supported' },
  misleading: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Potentially Misleading' },
  needs_context: { icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Needs More Context' },
};

const NuruClaimReview = () => {
  const [claimText, setClaimText] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('verify');
  const { data: documents } = useCivicDocuments();
  const { data: history } = useClaimReviewHistory();
  const reviewClaim = useReviewClaim();

  const handleReview = () => {
    if (!claimText.trim()) return;
    reviewClaim.mutate({ claimText, documentId: (selectedDocId && selectedDocId !== 'none') ? selectedDocId : undefined }, { onSuccess: (data) => setResult(data) });
  };

  const statusInfo = result ? statusConfig[result.status] || statusConfig.needs_context : null;

  // Stats from history
  const totalReviews = history?.length || 0;
  const supportedCount = history?.filter((h: any) => h.review_status === 'supported').length || 0;
  const misleadingCount = history?.filter((h: any) => h.review_status === 'misleading' || h.review_status === 'unsupported').length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="verify" className="gap-2 rounded-lg text-xs"><Shield className="h-3.5 w-3.5" />Verify Claim</TabsTrigger>
          <TabsTrigger value="history" className="gap-2 rounded-lg text-xs"><History className="h-3.5 w-3.5" />Review History ({totalReviews})</TabsTrigger>
        </TabsList>

        <TabsContent value="verify" className="space-y-5 mt-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Reviews', value: totalReviews, icon: BarChart3 },
              { label: 'Supported', value: supportedCount, icon: CheckCircle },
              { label: 'Flagged', value: misleadingCount, icon: AlertTriangle },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl border border-border/30 bg-card/40">
                <s.icon className="h-4 w-4 text-primary/60 mb-1" />
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Input Card */}
          <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/15">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Claim Verification Tool</h2>
                <p className="text-[11px] text-muted-foreground">Check any civic claim against official policy documents</p>
              </div>
            </div>

            <Textarea
              placeholder='Enter a claim to verify, e.g., "The government allocated 30% of the budget to education..."'
              rows={3}
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              className="rounded-xl mb-3 bg-background/50 text-sm"
            />
            <div className="flex gap-3">
              <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                <SelectTrigger className="flex-1 rounded-xl bg-background/50 text-xs">
                  <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Reference document (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific document</SelectItem>
                  {documents?.map(d => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleReview} disabled={reviewClaim.isPending || !claimText.trim()} className="gap-2 rounded-xl px-5">
                {reviewClaim.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {reviewClaim.isPending ? 'Reviewing...' : 'Verify'}
              </Button>
            </div>
          </div>

          {/* Result */}
          {result ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden">
                <div className={`p-4 border-b ${statusInfo?.bg}`}>
                  <div className="flex items-center gap-3">
                    {statusInfo && <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />}
                    <div>
                      <h3 className="font-semibold text-sm">{statusInfo?.label}</h3>
                      {result.confidence != null && (
                        <p className="text-xs text-muted-foreground">Confidence: {Math.round(result.confidence * 100)}%</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Evidence Summary</h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown>{result.evidenceSummary}</ReactMarkdown>
                    </div>
                  </div>

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
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {result.supportingPassages?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Quote className="h-3 w-3" />Supporting Evidence
                      </h4>
                      <div className="space-y-2">
                        {result.supportingPassages.map((p: string, i: number) => (
                          <div key={i} className="text-xs bg-primary/5 border border-primary/10 rounded-xl p-3 italic text-muted-foreground">"{p}"</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.recommendation && (
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                      <p className="text-xs font-medium text-foreground mb-1">💡 Recommendation</p>
                      <p className="text-xs text-muted-foreground">{result.recommendation}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Search className="h-12 w-12 text-muted-foreground/15 mb-3" />
              <p className="text-sm text-muted-foreground">Enter a claim to verify against official documents</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Promoting evidence-based civic dialogue</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="space-y-2">
            {history?.map((item: any, i: number) => {
              const st = statusConfig[item.review_status] || statusConfig.needs_context;
              return (
                <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <div className="p-4 rounded-xl border border-border/30 bg-card/40 hover:border-primary/15 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">{item.claim_text}</p>
                        {item.evidence_summary && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.evidence_summary}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-[10px] gap-1 ${st.bg}`}>
                            <st.icon className={`h-2.5 w-2.5 ${st.color}`} />{st.label}
                          </Badge>
                          {item.civic_documents?.title && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <FileText className="h-2.5 w-2.5" />{item.civic_documents.title}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />{format(new Date(item.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
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

export default NuruClaimReview;
