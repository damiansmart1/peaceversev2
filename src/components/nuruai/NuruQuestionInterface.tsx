import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { MessageSquareText, Send, Loader2, FileText, Quote, AlertTriangle, ThumbsUp, CheckCircle2 } from 'lucide-react';
import { useCivicDocuments, useCivicQuestions, useAskQuestion } from '@/hooks/useNuruAI';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const NuruQuestionInterface = () => {
  const [selectedDocId, setSelectedDocId] = useState('');
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const { data: documents } = useCivicDocuments();
  const { data: questions, isLoading: questionsLoading } = useCivicQuestions(selectedDocId || undefined);
  const askQuestion = useAskQuestion();
  const { user } = useAuth();

  const handleAsk = () => {
    if (!question.trim() || !selectedDocId) return;
    askQuestion.mutate({ question, documentId: selectedDocId }, {
      onSuccess: (data) => {
        setCurrentAnswer(data);
        setQuestion('');
      },
    });
  };

  const confidenceColor = (c: number) => c >= 0.8 ? 'text-green-500' : c >= 0.5 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Ask Panel */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquareText className="h-5 w-5 text-primary" />Ask NuruAI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedDocId} onValueChange={setSelectedDocId}>
              <SelectTrigger>
                <FileText className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select a document..." />
              </SelectTrigger>
              <SelectContent>
                {documents?.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    <span className="truncate">{d.title}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Ask a question about this document... e.g., 'What does this budget allocate to healthcare?'"
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            />
            <Button onClick={handleAsk} disabled={askQuestion.isPending || !selectedDocId || !question.trim()} className="w-full gap-2">
              {askQuestion.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {askQuestion.isPending ? 'Analyzing...' : 'Ask Question'}
            </Button>
          </CardContent>
        </Card>

        {/* Current Answer */}
        {currentAnswer && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/30 bg-card/80">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">AI Answer</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <span className={`text-sm font-bold ${confidenceColor(currentAnswer.confidence || 0)}`}>
                      {Math.round((currentAnswer.confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>
                <Progress value={(currentAnswer.confidence || 0) * 100} className="h-1.5" />
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground leading-relaxed">{currentAnswer.answer || currentAnswer.ai_answer}</p>
                {currentAnswer.sourcePassages?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Quote className="h-3 w-3" />Source Passages</h4>
                    {currentAnswer.sourcePassages.map((p: string, i: number) => (
                      <div key={i} className="text-xs bg-primary/5 border border-primary/10 rounded-lg p-3 italic text-muted-foreground">"{p}"</div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Recent Questions */}
      <div className="lg:col-span-3">
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Civic Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {questionsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : questions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquareText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No questions yet. Be the first to ask!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions?.map((q, i) => (
                  <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <div className="p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-all">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-foreground">{q.question_text}</p>
                        {q.ai_confidence != null && (
                          <Badge variant="outline" className={`text-xs shrink-0 ${confidenceColor(q.ai_confidence)}`}>
                            {Math.round(q.ai_confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                      {q.ai_answer && <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{q.ai_answer}</p>}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{format(new Date(q.created_at), 'MMM d, yyyy')}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{q.upvote_count}</span>
                        {q.status === 'answered' && <Badge variant="secondary" className="text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Answered</Badge>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NuruQuestionInterface;
