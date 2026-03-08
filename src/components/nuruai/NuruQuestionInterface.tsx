import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquareText, Send, Loader2, FileText, Quote, ThumbsUp, CheckCircle2, 
  Plus, History, Bot, User, Sparkles, Clock, ArrowRight, BookOpen, AlertCircle
} from 'lucide-react';
import { useCivicDocuments, useCivicQuestions, useAskQuestion, useNuruConversations, useNuruMessages, useCreateConversation, useSendChatMessage } from '@/hooks/useNuruAI';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const NuruQuestionInterface = () => {
  const [selectedDocId, setSelectedDocId] = useState('');
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [mode, setMode] = useState<'quick' | 'chat'>('quick');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: documents } = useCivicDocuments();
  const { data: questions, isLoading: questionsLoading } = useCivicQuestions(selectedDocId || undefined);
  const askQuestion = useAskQuestion();
  const { user } = useAuth();

  // Chat mode hooks
  const { data: conversations } = useNuruConversations();
  const { data: chatMessages } = useNuruMessages(activeConversationId || '');
  const createConversation = useCreateConversation();
  const sendChatMessage = useSendChatMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleQuickAsk = () => {
    if (!question.trim() || !selectedDocId) return;
    askQuestion.mutate({ question, documentId: selectedDocId }, {
      onSuccess: (data) => {
        setCurrentAnswer(data);
        setQuestion('');
      },
    });
  };

  const handleStartChat = async () => {
    if (!user) return;
    const doc = documents?.find(d => d.id === selectedDocId);
    createConversation.mutate(
      { documentId: selectedDocId || undefined, title: doc ? `Chat: ${doc.title.substring(0, 50)}` : 'General Civic Chat' },
      { onSuccess: (conv) => { setActiveConversationId(conv.id); setMode('chat'); } }
    );
  };

  const handleSendChat = () => {
    if (!question.trim() || !activeConversationId) return;
    sendChatMessage.mutate({ conversationId: activeConversationId, message: question });
    setQuestion('');
  };

  const confidenceColor = (c: number) => c >= 0.8 ? 'text-green-500' : c >= 0.5 ? 'text-yellow-500' : 'text-red-500';
  const confidenceBg = (c: number) => c >= 0.8 ? 'bg-green-500/10 border-green-500/20' : c >= 0.5 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Left Panel */}
      <div className="lg:col-span-2 space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border border-border/50">
          <Button
            variant={mode === 'quick' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('quick')}
            className="flex-1 gap-2"
          >
            <Sparkles className="h-4 w-4" />Quick Q&A
          </Button>
          <Button
            variant={mode === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('chat')}
            className="flex-1 gap-2"
          >
            <MessageSquareText className="h-4 w-4" />Deep Chat
          </Button>
        </div>

        {/* Document Selector */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              {mode === 'quick' ? 'Ask NuruAI' : 'NuruAI Deep Chat'}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {mode === 'quick' 
                ? 'Ask a question and get an instant evidence-based answer' 
                : 'Have a multi-turn conversation to deeply explore policy documents'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedDocId} onValueChange={setSelectedDocId}>
              <SelectTrigger className="h-11">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Select a document to query..." />
              </SelectTrigger>
              <SelectContent>
                {documents?.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{d.document_type}</Badge>
                      <span className="truncate">{d.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {mode === 'chat' && !activeConversationId && (
              <Button onClick={handleStartChat} disabled={createConversation.isPending || !user} className="w-full gap-2" variant="outline">
                {createConversation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Start New Conversation
              </Button>
            )}

            {/* Chat History */}
            {mode === 'chat' && conversations && conversations.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><History className="h-3 w-3" />Recent Conversations</p>
                <ScrollArea className="max-h-32">
                  {conversations.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveConversationId(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${activeConversationId === c.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}`}
                    >
                      <p className="font-medium truncate">{c.title}</p>
                      <p className="text-muted-foreground">{c.message_count} messages</p>
                    </button>
                  ))}
                </ScrollArea>
              </div>
            )}

            <Textarea
              placeholder={mode === 'quick' 
                ? "Ask a question... e.g., 'What does this budget allocate to healthcare?'"
                : "Type your message to NuruAI..."
              }
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  mode === 'quick' ? handleQuickAsk() : handleSendChat();
                }
              }}
            />
            <Button
              onClick={mode === 'quick' ? handleQuickAsk : handleSendChat}
              disabled={
                (mode === 'quick' ? askQuestion.isPending : sendChatMessage.isPending) ||
                (mode === 'quick' && !selectedDocId) ||
                (mode === 'chat' && !activeConversationId) ||
                !question.trim()
              }
              className="w-full gap-2"
            >
              {(mode === 'quick' ? askQuestion.isPending : sendChatMessage.isPending) 
                ? <Loader2 className="h-4 w-4 animate-spin" /> 
                : <Send className="h-4 w-4" />}
              {(mode === 'quick' ? askQuestion.isPending : sendChatMessage.isPending)
                ? 'Analyzing document...'
                : mode === 'quick' ? 'Ask Question' : 'Send Message'}
            </Button>

            {!user && (
              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                <AlertCircle className="h-3 w-3" />Sign in to use Deep Chat mode
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Answer */}
        {mode === 'quick' && currentAnswer && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/30 bg-card/80">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />AI Answer
                  </CardTitle>
                  <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${confidenceBg(currentAnswer.confidence || 0)}`}>
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
                
                {currentAnswer.keyTakeaway && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs font-semibold text-primary mb-1">Key Takeaway</p>
                    <p className="text-sm text-foreground">{currentAnswer.keyTakeaway}</p>
                  </div>
                )}

                {currentAnswer.sourcePassages?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Quote className="h-3 w-3" />Source Passages</h4>
                    {currentAnswer.sourcePassages.map((p: string, i: number) => (
                      <div key={i} className="text-xs bg-primary/5 border border-primary/10 rounded-lg p-3 italic text-muted-foreground">"{p}"</div>
                    ))}
                  </div>
                )}

                {currentAnswer.suggestedFollowUps?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground">Suggested Follow-ups</h4>
                    {currentAnswer.suggestedFollowUps.map((f: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setQuestion(f)}
                        className="w-full text-left text-xs p-2.5 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center gap-2"
                      >
                        <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                        {f}
                      </button>
                    ))}
                  </div>
                )}

                {currentAnswer.processingTime && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />Processed in {currentAnswer.processingTime}ms using Gemini 2.5 Pro
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Right Panel */}
      <div className="lg:col-span-3">
        {mode === 'chat' && activeConversationId ? (
          /* Chat Messages View */
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-[600px] flex flex-col">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-primary" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-4 py-4">
                <div className="space-y-4">
                  {chatMessages?.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0 ${
                        msg.role === 'user' ? 'bg-primary/10' : 'bg-accent/50'
                      }`}>
                        {msg.role === 'user' ? <User className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4 text-accent-foreground" />}
                      </div>
                      <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                        <div className={`inline-block p-3.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted/50 border border-border/50 rounded-bl-md'
                        }`}>
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1">
                          {msg.confidence != null && (
                            <Badge variant="outline" className={`text-[10px] ${confidenceColor(msg.confidence)}`}>
                              {Math.round(msg.confidence * 100)}% confidence
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </span>
                          {msg.processing_time_ms && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />{msg.processing_time_ms}ms
                            </span>
                          )}
                        </div>
                        {/* Source passages from chat */}
                        {msg.sources?.passages?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.sources.passages.slice(0, 2).map((p: string, idx: number) => (
                              <div key={idx} className="text-[10px] bg-primary/5 border border-primary/10 rounded-lg p-2 italic text-muted-foreground">
                                "{p}"
                              </div>
                            ))}
                          </div>
                        )}
                        {msg.sources?.followUps?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {msg.sources.followUps.map((f: string, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => setQuestion(f)}
                                className="text-[10px] px-2 py-1 rounded-full border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {sendChatMessage.isPending && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-full h-8 w-8 flex items-center justify-center bg-accent/50">
                        <Bot className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-bl-md p-3.5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing document and preparing response...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          /* Recent Questions List */
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Civic Questions</CardTitle>
                <Badge variant="outline" className="text-xs">{questions?.length || 0} questions</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {questionsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : questions?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No questions yet</p>
                  <p className="text-xs mt-1">Select a document and ask the first question!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {questions?.map((q, i) => (
                    <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
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
                          {q.tags?.length > 0 && q.tags.slice(0, 2).map((t, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px]">{t}</Badge>
                          ))}
                          {q.status === 'answered' && (
                            <Badge variant="secondary" className="text-xs gap-1 ml-auto"><CheckCircle2 className="h-3 w-3" />Answered</Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NuruQuestionInterface;
