import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2, MessageSquare, Send, Loader2, CheckCircle, AlertCircle,
  Users, ThumbsUp, BarChart3, Clock, Filter, Search, TrendingUp,
  AlertTriangle, ArrowUpRight, FileText, Eye, Calendar, Scale,
  Flag, Shield, Megaphone, ChevronRight, ExternalLink, Star,
  CircleDot, Timer, Target, Award, Zap
} from 'lucide-react';
import { useCivicQuestions, useInstitutionalResponses, useSubmitResponse, useCivicDocuments } from '@/hooks/useNuruAI';
import { useAuth } from '@/contexts/AuthContext';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import ReactMarkdown from 'react-markdown';

type ViewMode = 'tracker' | 'escalation' | 'metrics';
type FilterStatus = 'all' | 'answered' | 'pending' | 'awaiting_response' | 'escalated';
type SortMode = 'newest' | 'most_upvoted' | 'most_discussed' | 'oldest';

const NuruAccountabilityArchive = () => {
  const { data: questions, isLoading } = useCivicQuestions();
  const { data: documents } = useCivicDocuments();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [responseCategory, setResponseCategory] = useState<string>('official_response');
  const { data: responses } = useInstitutionalResponses(selectedQuestion || '');
  const submitResponse = useSubmitResponse();
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>('tracker');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmitResponse = () => {
    if (!selectedQuestion || !responseText.trim() || !institutionName.trim()) return;
    submitResponse.mutate(
      { questionId: selectedQuestion, institutionName, responseText },
      { onSuccess: () => { setResponseText(''); } }
    );
  };

  // Enhanced filtering and sorting
  const allQuestions = questions || [];
  const filteredQuestions = useMemo(() => {
    let filtered = [...allQuestions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.question_text.toLowerCase().includes(q) ||
        item.ai_answer?.toLowerCase().includes(q) ||
        item.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'answered') filtered = filtered.filter(q => q.ai_answer);
      else if (filterStatus === 'pending') filtered = filtered.filter(q => !q.ai_answer);
      else if (filterStatus === 'awaiting_response') filtered = filtered.filter(q => q.ai_answer && q.status !== 'resolved');
      else if (filterStatus === 'escalated') filtered = filtered.filter(q => (q.upvote_count || 0) >= 5);
    }

    switch (sortMode) {
      case 'most_upvoted': filtered.sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0)); break;
      case 'oldest': filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
      case 'newest': default: filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
    }

    return filtered;
  }, [allQuestions, searchQuery, filterStatus, sortMode]);

  const selectedQ = allQuestions.find(q => q.id === selectedQuestion);

  // Computed stats
  const totalQuestions = allQuestions.length;
  const answeredCount = allQuestions.filter(q => q.ai_answer).length;
  const totalUpvotes = allQuestions.reduce((sum, q) => sum + (q.upvote_count || 0), 0);
  const highPriorityCount = allQuestions.filter(q => (q.upvote_count || 0) >= 5).length;
  const responseRate = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const avgConfidence = allQuestions.filter(q => q.ai_confidence != null).reduce((sum, q, _, arr) => sum + (q.ai_confidence || 0) / arr.length, 0);

  // Response quality assessment
  const getResponseQuality = (confidence: number | null) => {
    if (!confidence) return { label: 'Unrated', color: 'text-muted-foreground', bg: 'bg-muted/30' };
    if (confidence >= 0.85) return { label: 'High Confidence', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' };
    if (confidence >= 0.6) return { label: 'Moderate', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' };
    return { label: 'Low Confidence', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' };
  };

  // Priority assessment
  const getPriority = (q: any) => {
    const upvotes = q.upvote_count || 0;
    const age = differenceInDays(new Date(), new Date(q.created_at));
    if (upvotes >= 10 || (upvotes >= 5 && age > 7)) return { level: 'critical', label: 'Critical', icon: AlertTriangle, color: 'text-red-500' };
    if (upvotes >= 5 || age > 14) return { level: 'high', label: 'High Priority', icon: Flag, color: 'text-amber-500' };
    if (upvotes >= 2) return { level: 'medium', label: 'Medium', icon: ArrowUpRight, color: 'text-blue-500' };
    return { level: 'low', label: 'Standard', icon: CircleDot, color: 'text-muted-foreground' };
  };

  // Days since question was asked
  const getDaysOpen = (created_at: string) => differenceInDays(new Date(), new Date(created_at));

  return (
    <div className="space-y-4">
      {/* View Mode Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList className="h-8">
            <TabsTrigger value="tracker" className="text-xs gap-1.5 px-3"><Scale className="h-3 w-3" />Accountability Tracker</TabsTrigger>
            <TabsTrigger value="escalation" className="text-xs gap-1.5 px-3"><Megaphone className="h-3 w-3" />Escalation Queue</TabsTrigger>
            <TabsTrigger value="metrics" className="text-xs gap-1.5 px-3"><BarChart3 className="h-3 w-3" />Performance Metrics</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          { label: 'Total Questions', value: totalQuestions, icon: MessageSquare, accent: 'text-primary' },
          { label: 'AI Answered', value: answeredCount, icon: CheckCircle, accent: 'text-emerald-500' },
          { label: 'Response Rate', value: `${responseRate}%`, icon: Target, accent: 'text-blue-500' },
          { label: 'Community Upvotes', value: totalUpvotes, icon: ThumbsUp, accent: 'text-amber-500' },
          { label: 'High Priority', value: highPriorityCount, icon: AlertTriangle, accent: 'text-red-500' },
          { label: 'Avg Confidence', value: `${Math.round(avgConfidence * 100)}%`, icon: Shield, accent: 'text-violet-500' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl border border-border/30 bg-card/50 hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <s.icon className={`h-3.5 w-3.5 ${s.accent}`} />
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-lg font-bold text-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'tracker' && (
          <motion.div key="tracker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TrackerView
              questions={filteredQuestions}
              allQuestions={allQuestions}
              isLoading={isLoading}
              selectedQuestion={selectedQuestion}
              setSelectedQuestion={setSelectedQuestion}
              selectedQ={selectedQ}
              responses={responses}
              user={user}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              sortMode={sortMode}
              setSortMode={setSortMode}
              institutionName={institutionName}
              setInstitutionName={setInstitutionName}
              responseText={responseText}
              setResponseText={setResponseText}
              responseCategory={responseCategory}
              setResponseCategory={setResponseCategory}
              handleSubmitResponse={handleSubmitResponse}
              submitResponse={submitResponse}
              getResponseQuality={getResponseQuality}
              getPriority={getPriority}
              getDaysOpen={getDaysOpen}
              documents={documents}
            />
          </motion.div>
        )}

        {viewMode === 'escalation' && (
          <motion.div key="escalation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EscalationView questions={allQuestions} getPriority={getPriority} getDaysOpen={getDaysOpen} setSelectedQuestion={(id) => { setSelectedQuestion(id); setViewMode('tracker'); }} />
          </motion.div>
        )}

        {viewMode === 'metrics' && (
          <motion.div key="metrics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MetricsView questions={allQuestions} responses={responses} responseRate={responseRate} avgConfidence={avgConfidence} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== TRACKER VIEW =====
function TrackerView({
  questions, allQuestions, isLoading, selectedQuestion, setSelectedQuestion, selectedQ, responses,
  user, searchQuery, setSearchQuery, filterStatus, setFilterStatus, sortMode, setSortMode,
  institutionName, setInstitutionName, responseText, setResponseText,
  responseCategory, setResponseCategory, handleSubmitResponse, submitResponse,
  getResponseQuality, getPriority, getDaysOpen, documents,
}: any) {
  return (
    <div className="flex h-[calc(100vh-420px)] min-h-[500px] rounded-2xl border border-border/30 overflow-hidden bg-card/20">
      {/* Left Panel: Questions */}
      <div className="w-[340px] border-r border-border/30 flex flex-col bg-card/40">
        {/* Search & Filters */}
        <div className="p-3 border-b border-border/30 space-y-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs rounded-lg"
            />
          </div>
          <div className="flex gap-1.5">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-7 text-[10px] flex-1">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="answered">AI Answered</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="awaiting_response">Awaiting Institution</SelectItem>
                <SelectItem value="escalated">Escalated (5+ votes)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortMode} onValueChange={(v: any) => setSortMode(v)}>
              <SelectTrigger className="h-7 text-[10px] flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="most_upvoted">Most Upvoted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Questions List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary/50" /></div>
          ) : questions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-xs">No questions match your filters</p>
              <p className="text-[10px] mt-1 text-muted-foreground/50">Try adjusting search or filter criteria</p>
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {questions.map((q: any) => {
                const priority = getPriority(q);
                const daysOpen = getDaysOpen(q.created_at);
                const PriorityIcon = priority.icon;
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestion(q.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all text-xs group ${
                      selectedQuestion === q.id
                        ? 'bg-primary/10 border border-primary/20 shadow-sm'
                        : 'hover:bg-muted/30 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <PriorityIcon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${priority.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-2 text-[12px] text-foreground leading-snug">{q.question_text}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Calendar className="h-2.5 w-2.5" />{format(new Date(q.created_at), 'MMM d')}
                          </span>
                          {daysOpen > 0 && (
                            <span className="text-[10px] text-muted-foreground/70">·{daysOpen}d open</span>
                          )}
                          {(q.upvote_count || 0) > 0 && (
                            <span className="text-[10px] flex items-center gap-0.5 text-amber-500">
                              <ThumbsUp className="h-2.5 w-2.5" />{q.upvote_count}
                            </span>
                          )}
                          <Badge
                            variant={q.ai_answer ? 'default' : 'secondary'}
                            className="text-[9px] ml-auto h-4 px-1.5"
                          >
                            {q.ai_answer ? '✓ Answered' : '⏳ Pending'}
                          </Badge>
                        </div>
                        {q.tags?.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {q.tags.slice(0, 3).map((tag: string, i: number) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t border-border/30 bg-card/60">
          <p className="text-[10px] text-muted-foreground text-center">
            {questions.length} of {allQuestions.length} questions shown
          </p>
        </div>
      </div>

      {/* Right Panel: Detail Thread */}
      <div className="flex-1 flex flex-col">
        {selectedQ ? (
          <QuestionDetailPanel
            question={selectedQ}
            responses={responses}
            user={user}
            institutionName={institutionName}
            setInstitutionName={setInstitutionName}
            responseText={responseText}
            setResponseText={setResponseText}
            responseCategory={responseCategory}
            setResponseCategory={setResponseCategory}
            handleSubmitResponse={handleSubmitResponse}
            submitResponse={submitResponse}
            getResponseQuality={getResponseQuality}
            getPriority={getPriority}
            getDaysOpen={getDaysOpen}
            documents={documents}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="p-4 rounded-2xl bg-muted/10 mb-4">
              <Scale className="h-12 w-12 text-muted-foreground/20" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Select a question to view its accountability thread</p>
            <p className="text-xs text-muted-foreground/50 mt-1 max-w-sm">
              Track AI analysis, institutional responses, community engagement, and resolution progress for each civic question
            </p>
            <div className="flex gap-3 mt-6">
              {[
                { icon: Eye, label: 'View AI Analysis' },
                { icon: Building2, label: 'Track Responses' },
                { icon: TrendingUp, label: 'Monitor Progress' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
                  <item.icon className="h-3 w-3" />{item.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== QUESTION DETAIL PANEL =====
function QuestionDetailPanel({
  question, responses, user, institutionName, setInstitutionName,
  responseText, setResponseText, responseCategory, setResponseCategory,
  handleSubmitResponse, submitResponse, getResponseQuality, getPriority, getDaysOpen, documents,
}: any) {
  const priority = getPriority(question);
  const quality = getResponseQuality(question.ai_confidence);
  const daysOpen = getDaysOpen(question.created_at);
  const PriorityIcon = priority.icon;

  // Find linked document
  const linkedDoc = documents?.find((d: any) => d.id === question.document_id);

  return (
    <>
      {/* Question Header */}
      <div className="p-4 border-b border-border/30 bg-card/30">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <PriorityIcon className={`h-4 w-4 ${priority.color}`} />
            <Badge variant="outline" className="text-[9px] h-5">{priority.label}</Badge>
            {daysOpen > 7 && (
              <Badge variant="destructive" className="text-[9px] h-5 gap-0.5">
                <Timer className="h-2.5 w-2.5" />{daysOpen}d open
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {(question.upvote_count || 0) > 0 && (
              <Badge variant="secondary" className="text-[9px] h-5 gap-0.5">
                <ThumbsUp className="h-2.5 w-2.5" />{question.upvote_count} votes
              </Badge>
            )}
            <Badge variant="secondary" className="text-[9px] h-5 gap-0.5">
              <Eye className="h-2.5 w-2.5" />{question.view_count || 0} views
            </Badge>
          </div>
        </div>

        <p className="text-sm font-semibold text-foreground leading-snug">{question.question_text}</p>

        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Asked {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}</span>
          {linkedDoc && (
            <span className="flex items-center gap-1 text-primary">
              <FileText className="h-3 w-3" />{linkedDoc.title}
            </span>
          )}
        </div>

        {question.tags?.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {question.tags.map((tag: string, i: number) => (
              <Badge key={i} variant="outline" className="text-[9px] h-4">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* AI Analysis Section */}
          {question.ai_answer && (
            <div className="rounded-xl border border-primary/15 overflow-hidden">
              <div className="px-3.5 py-2 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-semibold text-primary">NuruAI Evidence-Based Analysis</span>
                </div>
                <Badge className={`text-[9px] h-4 ${quality.bg} ${quality.color} border-0`}>
                  {quality.label} · {question.ai_confidence != null ? `${Math.round(question.ai_confidence * 100)}%` : 'N/A'}
                </Badge>
              </div>
              <div className="p-3.5">
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
                  <ReactMarkdown>{question.ai_answer}</ReactMarkdown>
                </div>

                {/* Source Passages */}
                {question.source_passages && Array.isArray(question.source_passages) && question.source_passages.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/20">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">📄 Source Evidence</p>
                    <div className="space-y-1.5">
                      {question.source_passages.slice(0, 3).map((passage: any, i: number) => (
                        <div key={i} className="text-[11px] p-2 rounded-lg bg-muted/20 border-l-2 border-primary/30 text-muted-foreground italic">
                          "{typeof passage === 'string' ? passage : passage.text || JSON.stringify(passage)}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence Breakdown */}
                <div className="mt-3 pt-3 border-t border-border/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground">Analysis Confidence</span>
                    <span className={`text-[10px] font-bold ${quality.color}`}>
                      {question.ai_confidence != null ? `${Math.round(question.ai_confidence * 100)}%` : 'N/A'}
                    </span>
                  </div>
                  {question.ai_confidence != null && (
                    <Progress value={question.ai_confidence * 100} className="h-1.5" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Accountability Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                Institutional Response Thread
              </h3>
              <Badge variant="outline" className="text-[9px] h-4">
                {responses?.length || 0} response{(responses?.length || 0) !== 1 ? 's' : ''}
              </Badge>
            </div>

            {(!responses || responses.length === 0) ? (
              <div className="rounded-xl border border-border/20 bg-muted/5 p-6 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
                <p className="text-xs font-medium text-muted-foreground">No institutional responses yet</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">
                  This question is awaiting official response from relevant institutions
                </p>
                {daysOpen > 7 && (
                  <div className="mt-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      This question has been open for {daysOpen} days without institutional response
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-3 bottom-3 w-px bg-border/30" />

                {responses.map((r: any, idx: number) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative pl-9"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-2.5 top-3.5 w-2 h-2 rounded-full bg-primary border-2 border-background z-10" />

                    <div className="p-3.5 rounded-xl bg-card/60 border border-border/30 hover:border-border/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">{r.institution_name}</span>
                        <Badge variant="secondary" className="text-[9px] ml-auto gap-1 h-4">
                          <CheckCircle className="h-2.5 w-2.5" />
                          {r.status === 'verified' ? 'Verified' : 'Official'}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed">{r.response_text}</p>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/20">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {format(new Date(r.created_at), 'MMM d, yyyy · HH:mm')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Response time: {formatDistanceToNow(new Date(question.created_at), { addSuffix: false })} after question
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Actions */}
          <div className="rounded-xl border border-border/20 bg-card/30 p-3.5">
            <h4 className="text-[11px] font-semibold text-foreground flex items-center gap-1.5 mb-2.5">
              <Target className="h-3.5 w-3.5 text-primary" />
              Recommended Actions
            </h4>
            <div className="space-y-2">
              {!responses?.length && (
                <ActionItem icon={Megaphone} text="Escalate to relevant government ministry or agency" priority="high" />
              )}
              {(question.upvote_count || 0) >= 5 && (
                <ActionItem icon={TrendingUp} text="High community interest — prioritize for institutional review" priority="high" />
              )}
              {daysOpen > 14 && !responses?.length && (
                <ActionItem icon={AlertTriangle} text="No response after 14+ days — flag for oversight committee" priority="critical" />
              )}
              <ActionItem icon={Users} text="Share with civil society organizations for advocacy support" priority="medium" />
              <ActionItem icon={FileText} text="Document in accountability report for public record" priority="standard" />
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Response Form */}
      {user && (
        <div className="p-3 border-t border-border/30 bg-card/40">
          <p className="text-[10px] font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Building2 className="h-3 w-3" />Submit Official Institutional Response
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Institution / Agency name"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="flex-1 rounded-lg text-xs h-8"
            />
            <Select value={responseCategory} onValueChange={setResponseCategory}>
              <SelectTrigger className="w-[140px] h-8 text-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="official_response">Official Response</SelectItem>
                <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
                <SelectItem value="action_taken">Action Taken</SelectItem>
                <SelectItem value="request_info">Request More Info</SelectItem>
                <SelectItem value="resolution">Resolution</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="Provide an official institutional response to this civic question..."
              rows={2}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              className="flex-1 rounded-lg text-xs resize-none"
            />
            <Button
              onClick={handleSubmitResponse}
              disabled={submitResponse.isPending || !responseText.trim() || !institutionName.trim()}
              size="icon"
              className="shrink-0 h-auto rounded-lg"
            >
              {submitResponse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// ===== ACTION ITEM =====
function ActionItem({ icon: Icon, text, priority }: { icon: any; text: string; priority: string }) {
  const colors: Record<string, string> = {
    critical: 'border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-400',
    high: 'border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400',
    medium: 'border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-400',
    standard: 'border-border/20 bg-muted/10 text-muted-foreground',
  };
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border text-[11px] ${colors[priority] || colors.standard}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{text}</span>
      <ChevronRight className="h-3 w-3 ml-auto shrink-0 opacity-40" />
    </div>
  );
}

// ===== ESCALATION VIEW =====
function EscalationView({ questions, getPriority, getDaysOpen, setSelectedQuestion }: any) {
  const escalated = useMemo(() => {
    return questions
      .map((q: any) => ({ ...q, priority: getPriority(q), daysOpen: getDaysOpen(q.created_at) }))
      .filter((q: any) => q.priority.level === 'critical' || q.priority.level === 'high' || q.daysOpen > 14)
      .sort((a: any, b: any) => {
        const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return (order[a.priority.level] || 3) - (order[b.priority.level] || 3);
      });
  }, [questions, getPriority, getDaysOpen]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-red-500" />
          Escalation Queue
          <Badge variant="destructive" className="text-[9px]">{escalated.length} items</Badge>
        </h3>
      </div>

      {escalated.length === 0 ? (
        <div className="rounded-xl border border-border/30 bg-card/30 p-8 text-center">
          <Award className="h-10 w-10 mx-auto mb-3 text-emerald-500/30" />
          <p className="text-sm font-medium text-foreground">No escalations needed</p>
          <p className="text-xs text-muted-foreground mt-1">All civic questions are being addressed within acceptable timeframes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {escalated.map((q: any, i: number) => {
            const PIcon = q.priority.icon;
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border/30 bg-card/40 p-4 hover:bg-card/60 transition-colors cursor-pointer"
                onClick={() => setSelectedQuestion(q.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    q.priority.level === 'critical' ? 'bg-red-500/10' : 'bg-amber-500/10'
                  }`}>
                    <PIcon className={`h-4 w-4 ${q.priority.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground line-clamp-2">{q.question_text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className={`text-[9px] h-4 ${q.priority.color}`}>{q.priority.label}</Badge>
                      <span className="text-[10px] text-muted-foreground">{q.daysOpen}d open</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <ThumbsUp className="h-2.5 w-2.5" />{q.upvote_count || 0}
                      </span>
                    </div>

                    {/* Escalation Reason */}
                    <div className="mt-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                      <p className="text-[10px] text-red-600 dark:text-red-400">
                        <strong>Escalation reason:</strong>{' '}
                        {q.daysOpen > 14 ? `No institutional response after ${q.daysOpen} days. ` : ''}
                        {(q.upvote_count || 0) >= 5 ? `High community interest (${q.upvote_count} votes). ` : ''}
                        {q.priority.level === 'critical' ? 'Requires immediate institutional attention.' : 'Requires prioritized review.'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===== METRICS VIEW =====
function MetricsView({ questions, responses, responseRate, avgConfidence }: any) {
  const allQuestions = questions || [];
  const totalQuestions = allQuestions.length;
  const answeredCount = allQuestions.filter((q: any) => q.ai_answer).length;
  const avgDaysOpen = totalQuestions > 0
    ? Math.round(allQuestions.reduce((sum: number, q: any) => sum + differenceInDays(new Date(), new Date(q.created_at)), 0) / totalQuestions)
    : 0;

  // Topic distribution
  const topicCounts: Record<string, number> = {};
  allQuestions.forEach((q: any) => {
    (q.tags || []).forEach((tag: string) => {
      topicCounts[tag] = (topicCounts[tag] || 0) + 1;
    });
  });
  const topTopics = Object.entries(topicCounts).sort(([, a], [, b]) => b - a).slice(0, 8);

  // Monthly trend
  const monthCounts: Record<string, number> = {};
  allQuestions.forEach((q: any) => {
    const month = format(new Date(q.created_at), 'MMM yyyy');
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  const monthTrend = Object.entries(monthCounts).slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Response Rate"
          value={`${responseRate}%`}
          subtitle={`${answeredCount} of ${totalQuestions} answered`}
          icon={Target}
          color="text-emerald-500"
          progress={responseRate}
        />
        <MetricCard
          title="AI Confidence Score"
          value={`${Math.round(avgConfidence * 100)}%`}
          subtitle="Average analysis accuracy"
          icon={Shield}
          color="text-violet-500"
          progress={avgConfidence * 100}
        />
        <MetricCard
          title="Avg Days Open"
          value={`${avgDaysOpen}`}
          subtitle="Average question age"
          icon={Timer}
          color="text-amber-500"
          progress={Math.max(0, 100 - avgDaysOpen * 3)}
        />
        <MetricCard
          title="Community Engagement"
          value={`${allQuestions.reduce((s: number, q: any) => s + (q.upvote_count || 0), 0)}`}
          subtitle="Total community votes"
          icon={Users}
          color="text-blue-500"
        />
      </div>

      {/* Topic Distribution & Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/30 bg-card/40 p-4">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-3">
            <Star className="h-3.5 w-3.5 text-primary" />Top Question Topics
          </h4>
          {topTopics.length === 0 ? (
            <p className="text-xs text-muted-foreground">No topics tagged yet</p>
          ) : (
            <div className="space-y-2">
              {topTopics.map(([topic, count], i) => (
                <div key={topic} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-4">{i + 1}.</span>
                  <span className="text-xs text-foreground flex-1">{topic}</span>
                  <div className="w-20 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{ width: `${(count / (topTopics[0]?.[1] as number || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/30 bg-card/40 p-4">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />Monthly Question Trend
          </h4>
          {monthTrend.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-2">
              {monthTrend.map(([month, count]) => (
                <div key={month} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-16">{month}</span>
                  <div className="flex-1 h-4 rounded bg-muted/20 overflow-hidden">
                    <div
                      className="h-full rounded bg-primary/40 flex items-center justify-end pr-1.5"
                      style={{ width: `${Math.max(10, (count / Math.max(...monthTrend.map(([, c]) => c as number))) * 100)}%` }}
                    >
                      <span className="text-[9px] font-medium text-primary-foreground">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accountability Health Score */}
      <div className="rounded-xl border border-border/30 bg-card/40 p-4">
        <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-3">
          <Award className="h-3.5 w-3.5 text-primary" />Accountability Health Score
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HealthIndicator
            label="Responsiveness"
            description="How quickly institutions respond to civic questions"
            score={responseRate}
          />
          <HealthIndicator
            label="Evidence Quality"
            description="AI confidence in source-backed analysis"
            score={Math.round(avgConfidence * 100)}
          />
          <HealthIndicator
            label="Community Trust"
            description="Citizen engagement through upvotes and participation"
            score={Math.min(100, totalQuestions > 0 ? Math.round((allQuestions.reduce((s: number, q: any) => s + (q.upvote_count || 0), 0) / totalQuestions) * 20) : 0)}
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, color, progress }: any) {
  return (
    <div className="rounded-xl border border-border/30 bg-card/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-[10px] text-muted-foreground">{title}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
      {progress !== undefined && (
        <Progress value={progress} className="h-1 mt-2.5" />
      )}
    </div>
  );
}

function HealthIndicator({ label, description, score }: { label: string; description: string; score: number }) {
  const getHealthColor = (s: number) => {
    if (s >= 70) return 'text-emerald-500';
    if (s >= 40) return 'text-amber-500';
    return 'text-red-500';
  };
  const getHealthLabel = (s: number) => {
    if (s >= 70) return 'Good';
    if (s >= 40) return 'Needs Improvement';
    return 'Critical';
  };

  return (
    <div className="text-center p-3 rounded-lg bg-muted/10">
      <p className={`text-2xl font-bold ${getHealthColor(score)}`}>{score}%</p>
      <p className="text-xs font-medium text-foreground mt-1">{label}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
      <Badge variant="outline" className={`text-[9px] mt-2 ${getHealthColor(score)}`}>{getHealthLabel(score)}</Badge>
    </div>
  );
}

export default NuruAccountabilityArchive;
