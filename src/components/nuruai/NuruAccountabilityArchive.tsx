import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, MessageSquare, Clock, Send, Loader2, CheckCircle, AlertCircle, Users, ThumbsUp, BarChart3 } from 'lucide-react';
import { useCivicQuestions, useInstitutionalResponses, useSubmitResponse } from '@/hooks/useNuruAI';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

const NuruAccountabilityArchive = () => {
  const { data: questions, isLoading } = useCivicQuestions();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const { data: responses } = useInstitutionalResponses(selectedQuestion || '');
  const submitResponse = useSubmitResponse();
  const { user } = useAuth();

  const handleSubmitResponse = () => {
    if (!selectedQuestion || !responseText.trim() || !institutionName.trim()) return;
    submitResponse.mutate({ questionId: selectedQuestion, institutionName, responseText }, { onSuccess: () => setResponseText('') });
  };

  const answeredQuestions = questions?.filter(q => q.status === 'answered') || [];
  const selectedQ = answeredQuestions.find(q => q.id === selectedQuestion);

  // Stats
  const totalQuestions = answeredQuestions.length;
  const totalUpvotes = answeredQuestions.reduce((sum, q) => sum + (q.upvote_count || 0), 0);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Civic Questions', value: totalQuestions, icon: MessageSquare },
          { label: 'Community Upvotes', value: totalUpvotes, icon: ThumbsUp },
          { label: 'Institutional Responses', value: responses?.length || 0, icon: Building2 },
        ].map((s, i) => (
          <div key={i} className="p-3 rounded-xl border border-border/30 bg-card/40">
            <s.icon className="h-4 w-4 text-primary/60 mb-1" />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex h-[calc(100vh-360px)] rounded-2xl border border-border/30 overflow-hidden bg-card/20">
        {/* Questions List */}
        <div className="w-80 border-r border-border/30 flex flex-col bg-card/40">
          <div className="p-3 border-b border-border/30">
            <h2 className="text-xs font-semibold flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-primary" />Accountability Archive
            </h2>
          </div>
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary/50" /></div>
            ) : answeredQuestions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No civic interactions yet</p>
              </div>
            ) : (
              <div className="p-2 space-y-0.5">
                {answeredQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestion(q.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all text-xs ${
                      selectedQuestion === q.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/30 border border-transparent'
                    }`}
                  >
                    <p className="font-medium line-clamp-2 text-[12px] text-foreground">{q.question_text}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-muted-foreground">
                      <span className="text-[10px]">{format(new Date(q.created_at), 'MMM d')}</span>
                      {q.upvote_count > 0 && (
                        <span className="text-[10px] flex items-center gap-0.5"><ThumbsUp className="h-2.5 w-2.5" />{q.upvote_count}</span>
                      )}
                      <Badge variant="secondary" className="text-[9px] ml-auto h-4">
                        {q.ai_answer ? 'Answered' : 'Pending'}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Response Thread */}
        <div className="flex-1 flex flex-col">
          {selectedQ ? (
            <>
              <div className="p-4 border-b border-border/30">
                <p className="text-sm font-medium text-foreground">{selectedQ.question_text}</p>
                {selectedQ.ai_answer && (
                  <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-medium text-primary mb-1 flex items-center gap-1">🤖 AI Analysis</p>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs">
                      <ReactMarkdown>{selectedQ.ai_answer}</ReactMarkdown>
                    </div>
                    {selectedQ.ai_confidence != null && (
                      <Badge variant="outline" className="text-[9px] mt-2">Confidence: {Math.round(selectedQ.ai_confidence * 100)}%</Badge>
                    )}
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1 p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Institutional Responses</h3>
                {responses?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">No institutional responses yet</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">Institutions can respond to civic questions below</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {responses?.map((r) => (
                      <motion.div key={r.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 rounded-xl bg-muted/20 border border-border/30"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-3 w-3 text-primary" />
                          <span className="text-xs font-semibold">{r.institution_name}</span>
                          <Badge variant="secondary" className="text-[9px] ml-auto gap-1 h-4"><CheckCircle className="h-2.5 w-2.5" />Official</Badge>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{r.response_text}</p>
                        <p className="text-[10px] text-muted-foreground mt-2">{format(new Date(r.created_at), 'MMM d, yyyy HH:mm')}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {user && (
                <div className="p-3 border-t border-border/30 bg-card/40">
                  <div className="flex gap-2">
                    <Input placeholder="Institution name" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} className="flex-1 rounded-lg text-xs h-8" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Textarea placeholder="Official response..." rows={2} value={responseText} onChange={(e) => setResponseText(e.target.value)} className="flex-1 rounded-lg text-xs" />
                    <Button onClick={handleSubmitResponse} disabled={submitResponse.isPending || !responseText.trim() || !institutionName.trim()} size="icon" className="shrink-0 h-auto rounded-lg">
                      {submitResponse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <MessageSquare className="h-12 w-12 text-muted-foreground/15 mb-3" />
              <p className="text-sm text-muted-foreground">Select a question to view the accountability thread</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Track how institutions respond to civic concerns</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NuruAccountabilityArchive;
