import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
  Building2, Send, FileText, CheckCircle, AlertCircle,
  MessageSquareText, BarChart3, Globe, Shield, Bell, Settings
} from 'lucide-react';
import { useCivicDocuments, useCivicQuestions } from '@/hooks/useNuruAI';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

import { InstitutionalMetricsGrid } from './institutional/InstitutionalMetricsGrid';
import { CivicConcernsPanel } from './institutional/CivicConcernsPanel';
import { InstitutionalDocumentsPanel } from './institutional/InstitutionalDocumentsPanel';
import { PublishedResponsesPanel } from './institutional/PublishedResponsesPanel';
import { InstitutionalAnalyticsPanel } from './institutional/InstitutionalAnalyticsPanel';

const sb = supabase as any;

const NuruInstitutionalPortal = () => {
  const { user } = useAuth();
  const { data: documents } = useCivicDocuments();
  const { data: questions } = useCivicQuestions();
  const { data: responses } = useQuery({
    queryKey: ['institutional-responses'],
    queryFn: async () => {
      const { data, error } = await sb.from('institutional_responses').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const [showClarification, setShowClarification] = useState(false);
  const [clarificationText, setClarificationText] = useState('');
  const [clarificationDocId, setClarificationDocId] = useState('');
  const [responseText, setResponseText] = useState('');
  const [respondingTo, setRespondingTo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('concerns');

  // Unanswered questions
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
    const documentsPublished = documents?.filter((d: any) => d.status === 'active').length || 0;
    const activeInstitutions = new Set(responses?.map((r: any) => r.institution_name)).size || 0;
    return {
      totalQuestions,
      answered,
      unanswered: unansweredQuestions.length,
      responseRate,
      avgResponseTime: '2.3 days',
      documentsPublished,
      activeInstitutions,
      citizenSatisfaction: 78,
    };
  }, [questions, responses, unansweredQuestions, documents]);

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
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Portal Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden"
      >
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-primary/8 via-transparent to-secondary/5 p-5 border-b border-border/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/15">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold">Institutional Engagement Portal</h2>
                  <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">
                    <Shield className="h-2.5 w-2.5 mr-0.5" /> Verified
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Respond to civic questions, publish documents, issue clarifications & track institutional accountability
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Bell className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Notifications</span>
                {metrics.unanswered > 0 && (
                  <Badge className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[8px] bg-red-500">
                    {metrics.unanswered}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowClarification(true)}>
                <Send className="h-3.5 w-3.5" /> Publish Clarification
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="p-5">
          <InstitutionalMetricsGrid metrics={metrics} />
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="rounded-xl h-auto p-1 bg-muted/50 w-full grid grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="concerns" className="gap-1.5 rounded-lg text-xs py-2">
            <MessageSquareText className="h-3.5 w-3.5" />
            <span>Civic Concerns</span>
            {metrics.unanswered > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 px-1 text-[8px]">{metrics.unanswered}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5 rounded-lg text-xs py-2">
            <FileText className="h-3.5 w-3.5" />
            <span>Documents</span>
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-[8px]">{documents?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="responses" className="gap-1.5 rounded-lg text-xs py-2">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Responses</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 rounded-lg text-xs py-2">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="concerns">
            <CivicConcernsPanel
              questions={unansweredQuestions}
              onRespond={(q) => { setRespondingTo(q); setResponseText(''); }}
            />
          </TabsContent>

          <TabsContent value="documents">
            <InstitutionalDocumentsPanel documents={documents || []} />
          </TabsContent>

          <TabsContent value="responses">
            <PublishedResponsesPanel responses={responses || []} questions={questions || []} />
          </TabsContent>

          <TabsContent value="analytics">
            <InstitutionalAnalyticsPanel
              questions={questions || []}
              responses={responses || []}
              documents={documents || []}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Respond Dialog */}
      <Dialog open={!!respondingTo} onOpenChange={() => setRespondingTo(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Respond to Civic Question
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              Your response will be published to the public accountability archive.
            </DialogDescription>
          </DialogHeader>
          {respondingTo && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/10">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">Citizen Question:</p>
                <p className="text-xs text-foreground leading-relaxed">{respondingTo.question_text}</p>
                <div className="flex gap-1.5 mt-2">
                  {respondingTo.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-[8px]">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Official Response</label>
                <Textarea
                  className="text-xs mt-1.5"
                  placeholder="Provide a clear, evidence-based institutional response..."
                  rows={6}
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                />
                <p className="text-[9px] text-muted-foreground mt-1">
                  {responseText.length}/2000 characters • Responses are publicly visible
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setRespondingTo(null)}>Cancel</Button>
            <Button size="sm" className="text-xs gap-1.5" disabled={!responseText.trim()} onClick={handleRespond}>
              <Send className="h-3 w-3" /> Publish Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clarification Dialog */}
      <Dialog open={showClarification} onOpenChange={setShowClarification}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Publish Policy Clarification
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              Issue a proactive clarification on policy matters or official documents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Related Document (optional)</label>
              <Select value={clarificationDocId} onValueChange={setClarificationDocId}>
                <SelectTrigger className="h-9 text-xs mt-1.5"><SelectValue placeholder="Select document..." /></SelectTrigger>
                <SelectContent>
                  {documents?.map((d: any) => <SelectItem key={d.id} value={d.id} className="text-xs">{d.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Clarification Statement</label>
              <Textarea
                className="text-xs mt-1.5"
                rows={6}
                placeholder="Publish a detailed policy clarification, correction, or update..."
                value={clarificationText}
                onChange={e => setClarificationText(e.target.value)}
              />
              <p className="text-[9px] text-muted-foreground mt-1">
                {clarificationText.length}/3000 characters • Will be archived permanently
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowClarification(false)}>Cancel</Button>
            <Button size="sm" className="text-xs gap-1.5" disabled={!clarificationText.trim()} onClick={handlePublishClarification}>
              <Send className="h-3 w-3" /> Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NuruInstitutionalPortal;
