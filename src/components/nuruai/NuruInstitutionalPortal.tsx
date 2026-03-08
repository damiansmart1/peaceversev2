import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Building2, FileUp, MessageSquareText, Eye, BarChart3, Send,
  Upload, FileText, Globe, Clock, CheckCircle, AlertCircle, Users, TrendingUp
} from 'lucide-react';
import { useCivicDocuments, useCivicQuestions } from '@/hooks/useNuruAI';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

const sb = supabase as any;

const NuruInstitutionalPortal = () => {
  const { user } = useAuth();
  const { data: documents } = useCivicDocuments();
  const { data: questions } = useCivicQuestions();
  const { data: responses } = useQuery({
    queryKey: ['institutional-responses'],
    queryFn: async () => {
      const { data, error } = await sb.from('institutional_responses').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const [showClarification, setShowClarification] = useState(false);
  const [clarificationText, setClarificationText] = useState('');
  const [clarificationDocId, setClarificationDocId] = useState('');
  const [responseText, setResponseText] = useState('');
  const [respondingTo, setRespondingTo] = useState<any>(null);

  // Unanswered questions (civic concerns)
  const unansweredQuestions = useMemo(() => {
    return questions?.filter((q: any) => {
      const hasResponse = responses?.some((r: any) => r.question_id === q.id);
      return !hasResponse && q.is_public;
    }) || [];
  }, [questions, responses]);

  // Metrics
  const metrics = useMemo(() => {
    const totalQuestions = questions?.length || 0;
    const answered = responses?.length || 0;
    const responseRate = totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0;
    const avgResponseTime = '2.3 days'; // placeholder
    return { totalQuestions, answered, unanswered: unansweredQuestions.length, responseRate, avgResponseTime };
  }, [questions, responses, unansweredQuestions]);

  const handleRespond = async () => {
    if (!respondingTo || !responseText.trim()) return;
    try {
      const { error } = await sb.from('institutional_responses').insert({
        question_id: respondingTo.id,
        institution_name: 'Your Institution',
        response_text: responseText,
        responder_id: user?.id,
        status: 'published',
      });
      if (error) throw error;
      toast.success('Response published to accountability archive');
      setRespondingTo(null);
      setResponseText('');
    } catch {
      toast.error('Failed to submit response');
    }
  };

  const handlePublishClarification = async () => {
    if (!clarificationText.trim()) return;
    try {
      const { error } = await sb.from('institutional_responses').insert({
        institution_name: 'Your Institution',
        response_text: clarificationText,
        responder_id: user?.id,
        status: 'published',
        document_id: clarificationDocId || null,
      });
      if (error) throw error;
      toast.success('Clarification published');
      setShowClarification(false);
      setClarificationText('');
    } catch {
      toast.error('Failed to publish clarification');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/15">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Institutional Engagement Portal</h2>
              <p className="text-[11px] text-muted-foreground">Upload documents, respond to civic questions, and publish clarifications</p>
            </div>
          </div>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowClarification(true)}>
            <Send className="h-3.5 w-3.5" /> Publish Clarification
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { icon: MessageSquareText, label: 'Civic Questions', value: metrics.totalQuestions, color: 'text-primary' },
            { icon: CheckCircle, label: 'Responded', value: metrics.answered, color: 'text-emerald-500' },
            { icon: AlertCircle, label: 'Pending', value: metrics.unanswered, color: 'text-amber-500' },
            { icon: TrendingUp, label: 'Response Rate', value: `${metrics.responseRate}%`, color: 'text-cyan-500' },
            { icon: Clock, label: 'Avg Response', value: metrics.avgResponseTime, color: 'text-violet-500' },
          ].map((m, i) => (
            <div key={i} className="p-3 rounded-xl border border-border/20 text-center">
              <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className="text-sm font-bold">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="concerns">
        <TabsList className="rounded-xl">
          <TabsTrigger value="concerns" className="gap-1.5 rounded-lg text-xs"><MessageSquareText className="h-3.5 w-3.5" />Civic Concerns ({metrics.unanswered})</TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5 rounded-lg text-xs"><FileText className="h-3.5 w-3.5" />Your Documents ({documents?.length || 0})</TabsTrigger>
          <TabsTrigger value="responses" className="gap-1.5 rounded-lg text-xs"><CheckCircle className="h-3.5 w-3.5" />Published Responses</TabsTrigger>
        </TabsList>

        {/* Civic Concerns */}
        <TabsContent value="concerns" className="mt-4 space-y-3">
          {unansweredQuestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground rounded-xl border border-border/20 bg-card/30">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">All civic questions have been addressed</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              {unansweredQuestions.map((q: any) => (
                <motion.div key={q.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border/30 bg-card/40 p-4 mb-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{q.question_text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {q.tags?.map((tag: string) => <Badge key={tag} variant="outline" className="text-[9px]">{tag}</Badge>)}
                        <span className="text-[10px] text-muted-foreground/50">{format(parseISO(q.created_at), 'MMM d, yyyy')}</span>
                        {q.upvote_count > 0 && <span className="text-[10px] text-muted-foreground/50">👍 {q.upvote_count}</span>}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => { setRespondingTo(q); setResponseText(''); }}>
                      <Send className="h-3 w-3" /> Respond
                    </Button>
                  </div>
                </motion.div>
              ))}
            </ScrollArea>
          )}
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="mt-4 space-y-3">
          <div className="rounded-xl border border-dashed border-primary/20 bg-primary/[0.02] p-8 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-primary/30" />
            <p className="text-sm text-muted-foreground">Upload official documents via the Documents tab</p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">Supported: PDF, DOCX, XLSX, CSV</p>
          </div>
          {documents?.slice(0, 10).map((doc: any) => (
            <div key={doc.id} className="rounded-xl border border-border/30 bg-card/40 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary/50" />
                <div>
                  <p className="text-xs font-medium">{doc.title}</p>
                  <p className="text-[10px] text-muted-foreground">{doc.document_type} · {doc.country || 'No country'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px]">{doc.status}</Badge>
                <span className="text-[10px] text-muted-foreground">{doc.question_count || 0} questions</span>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Published Responses */}
        <TabsContent value="responses" className="mt-4 space-y-3">
          {(!responses || responses.length === 0) ? (
            <div className="text-center py-12 text-muted-foreground rounded-xl border border-border/20 bg-card/30">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No institutional responses published yet</p>
            </div>
          ) : (
            responses.map((r: any) => (
              <div key={r.id} className="rounded-xl border border-border/30 bg-card/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold">{r.institution_name}</span>
                  <Badge variant="outline" className="text-[9px] capitalize">{r.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{r.response_text}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-2">{format(parseISO(r.created_at), 'MMM d, yyyy HH:mm')}</p>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Respond Dialog */}
      <Dialog open={!!respondingTo} onOpenChange={() => setRespondingTo(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-sm">Respond to Civic Question</DialogTitle></DialogHeader>
          {respondingTo && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/30 text-xs">{respondingTo.question_text}</div>
              <Textarea className="text-xs" placeholder="Provide an official institutional response..." rows={5} value={responseText} onChange={e => setResponseText(e.target.value)} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setRespondingTo(null)}>Cancel</Button>
            <Button size="sm" className="text-xs" disabled={!responseText.trim()} onClick={handleRespond}>Publish Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clarification Dialog */}
      <Dialog open={showClarification} onOpenChange={setShowClarification}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-sm">Publish Policy Clarification</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Related Document (optional)</label>
              <Select value={clarificationDocId} onValueChange={setClarificationDocId}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select document..." /></SelectTrigger>
                <SelectContent>
                  {documents?.map((d: any) => <SelectItem key={d.id} value={d.id} className="text-xs">{d.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Clarification</label>
              <Textarea className="text-xs" rows={5} placeholder="Publish a policy clarification or update..." value={clarificationText} onChange={e => setClarificationText(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowClarification(false)}>Cancel</Button>
            <Button size="sm" className="text-xs" disabled={!clarificationText.trim()} onClick={handlePublishClarification}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NuruInstitutionalPortal;
