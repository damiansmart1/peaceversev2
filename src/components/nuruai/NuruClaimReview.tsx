import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle, HelpCircle, FileText, Quote, Shield, ArrowRight } from 'lucide-react';
import { useCivicDocuments, useReviewClaim } from '@/hooks/useNuruAI';

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
  const { data: documents } = useCivicDocuments();
  const reviewClaim = useReviewClaim();

  const handleReview = () => {
    if (!claimText.trim()) return;
    reviewClaim.mutate({ claimText, documentId: selectedDocId || undefined }, { onSuccess: (data) => setResult(data) });
  };

  const statusInfo = result ? statusConfig[result.status] || statusConfig.needs_context : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input Card */}
      <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/15">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Claim Verification Tool</h2>
            <p className="text-xs text-muted-foreground">Check any civic claim against official policy documents</p>
          </div>
        </div>

        <Textarea
          placeholder='Enter a claim to verify, e.g., "The government allocated 30% of the budget to education..."'
          rows={4}
          value={claimText}
          onChange={(e) => setClaimText(e.target.value)}
          className="rounded-xl mb-3 bg-background/50"
        />
        <div className="flex gap-3">
          <Select value={selectedDocId} onValueChange={setSelectedDocId}>
            <SelectTrigger className="flex-1 rounded-xl bg-background/50">
              <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Reference document (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No specific document</SelectItem>
              {documents?.map(d => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleReview} disabled={reviewClaim.isPending || !claimText.trim()} className="gap-2 rounded-xl px-6">
            {reviewClaim.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {reviewClaim.isPending ? 'Reviewing...' : 'Verify'}
          </Button>
        </div>
      </div>

      {/* Result */}
      {result ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden">
            {/* Verdict Header */}
            <div className={`p-5 border-b ${statusInfo?.bg}`}>
              <div className="flex items-center gap-3">
                {statusInfo && <statusInfo.icon className={`h-7 w-7 ${statusInfo.color}`} />}
                <div>
                  <h3 className="font-semibold text-base">{statusInfo?.label}</h3>
                  {result.confidence != null && (
                    <p className="text-xs text-muted-foreground">Confidence: {Math.round(result.confidence * 100)}%</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Evidence Summary</h4>
                <p className="text-sm text-foreground leading-relaxed">{result.evidenceSummary}</p>
              </div>

              {result.supportingPassages?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Quote className="h-3 w-3" />Supporting Evidence
                  </h4>
                  <div className="space-y-2">
                    {result.supportingPassages.map((p: string, i: number) => (
                      <div key={i} className="text-xs bg-primary/5 border border-primary/10 rounded-xl p-3 italic text-muted-foreground leading-relaxed">"{p}"</div>
                    ))}
                  </div>
                </div>
              )}

              {result.recommendation && (
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                  <p className="text-xs font-medium text-foreground mb-1">💡 Recommendation</p>
                  <p className="text-xs text-muted-foreground">{result.recommendation}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-14 w-14 text-muted-foreground/15 mb-4" />
          <p className="text-sm text-muted-foreground">Enter a claim to verify against official documents</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Promoting evidence-based civic dialogue</p>
        </div>
      )}
    </div>
  );
};

export default NuruClaimReview;
