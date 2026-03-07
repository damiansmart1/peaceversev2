import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle, HelpCircle, FileText, Quote } from 'lucide-react';
import { useCivicDocuments, useReviewClaim } from '@/hooks/useNuruAI';

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  supported: { icon: CheckCircle, color: 'text-green-500', label: 'Supported by Evidence' },
  unsupported: { icon: XCircle, color: 'text-red-500', label: 'Not Supported' },
  misleading: { icon: AlertTriangle, color: 'text-orange-500', label: 'Potentially Misleading' },
  needs_context: { icon: HelpCircle, color: 'text-yellow-500', label: 'Needs More Context' },
};

const NuruClaimReview = () => {
  const [claimText, setClaimText] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [result, setResult] = useState<any>(null);
  const { data: documents } = useCivicDocuments();
  const reviewClaim = useReviewClaim();

  const handleReview = () => {
    if (!claimText.trim()) return;
    reviewClaim.mutate({ claimText, documentId: selectedDocId || undefined }, {
      onSuccess: (data) => setResult(data),
    });
  };

  const statusInfo = result ? statusConfig[result.status] || statusConfig.needs_context : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-primary" />Claim Review Tool
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Check claims against official documents. NuruAI will compare the statement with available evidence.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter a claim to verify, e.g., 'The government allocated 30% of the budget to education...'"
            rows={5}
            value={claimText}
            onChange={(e) => setClaimText(e.target.value)}
          />
          <Select value={selectedDocId} onValueChange={setSelectedDocId}>
            <SelectTrigger>
              <FileText className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Reference document (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No specific document</SelectItem>
              {documents?.map(d => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleReview} disabled={reviewClaim.isPending || !claimText.trim()} className="w-full gap-2">
            {reviewClaim.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {reviewClaim.isPending ? 'Reviewing...' : 'Review Claim'}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      <div>
        {result ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {statusInfo && <statusInfo.icon className={`h-8 w-8 ${statusInfo.color}`} />}
                  <div>
                    <CardTitle className="text-base">{statusInfo?.label}</CardTitle>
                    {result.confidence != null && (
                      <p className="text-xs text-muted-foreground">Confidence: {Math.round(result.confidence * 100)}%</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Evidence Summary</h4>
                  <p className="text-sm text-muted-foreground">{result.evidenceSummary}</p>
                </div>
                {result.supportingPassages?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                      <Quote className="h-3 w-3" />Supporting Evidence
                    </h4>
                    {result.supportingPassages.map((p: string, i: number) => (
                      <div key={i} className="text-xs bg-primary/5 border border-primary/10 rounded-lg p-3 italic text-muted-foreground mb-2">
                        "{p}"
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">Enter a claim to verify against official documents</p>
              <p className="text-xs text-muted-foreground mt-1">NuruAI promotes evidence-based civic dialogue</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NuruClaimReview;
