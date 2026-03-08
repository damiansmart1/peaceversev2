import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, ArrowLeft, Shield, Clock, FileText, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  supported: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Supported by Evidence' },
  unsupported: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', label: 'Not Supported' },
  misleading: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Potentially Misleading' },
  needs_context: { icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Needs More Context' },
};

const FactCheck = () => {
  const { token } = useParams<{ token: string }>();

  const { data: review, isLoading, error } = useQuery({
    queryKey: ['public-fact-check', token],
    queryFn: async () => {
      const sb = supabase as any;
      const { data, error } = await sb
        .from('civic_claim_reviews')
        .select('*, civic_documents(title)')
        .eq('share_token', token)
        .eq('is_public', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Shield className="h-10 w-10 mx-auto animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">Loading fact-check…</p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md px-6">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <h1 className="text-xl font-bold">Fact-Check Not Found</h1>
          <p className="text-sm text-muted-foreground">
            This fact-check may not exist, may not be public, or the link may be invalid.
          </p>
          <Link to="/nuru-ai">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Go to NuruAI
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[review.review_status] || statusConfig.needs_context;
  const StatusIcon = status.icon;

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `Fact-Check: ${review.claim_text}`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/nuru-ai" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to NuruAI
          </Link>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
        </div>

        {/* Verdict Card */}
        <div className={`rounded-2xl border ${status.bg} p-6 space-y-4`}>
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-8 w-8 ${status.color}`} />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Verdict</p>
              <h2 className={`text-lg font-bold ${status.color}`}>{status.label}</h2>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Claim</p>
            <blockquote className="border-l-2 border-current pl-3 text-sm font-medium italic">
              "{review.claim_text}"
            </blockquote>
          </div>

          {review.claim_source && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Source: {review.claim_source}</span>
              {review.claim_source_url && (
                <a href={review.claim_source_url} target="_blank" rel="noopener noreferrer" className="underline">View source</a>
              )}
            </div>
          )}
        </div>

        {/* Evidence */}
        {review.evidence_summary && (
          <div className="rounded-2xl border border-border/30 bg-card/40 p-6 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Evidence Summary
            </h3>
            <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
              <ReactMarkdown>{review.evidence_summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Source Document */}
        {review.civic_documents?.title && (
          <div className="rounded-2xl border border-border/30 bg-card/40 p-4">
            <p className="text-xs text-muted-foreground mb-1">Verified against</p>
            <p className="text-sm font-medium">{review.civic_documents.title}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/20 pt-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {format(new Date(review.created_at), 'PPP')}
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5" />
            Verified by NuruAI · PeaceVerse
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactCheck;
