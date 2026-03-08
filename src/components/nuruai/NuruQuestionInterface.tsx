import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, Loader2, FileText, Quote, Bot, User, Sparkles, Clock, ArrowRight, 
  Plus, History, MessageSquareText, BookOpen, AlertCircle, ChevronDown, Zap
} from 'lucide-react';
import { useCivicDocuments, useNuruConversations, useNuruMessages, useCreateConversation, useSendChatMessage, useAskQuestion } from '@/hooks/useNuruAI';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const NuruQuestionInterface = () => {
  const [selectedDocId, setSelectedDocId] = useState('');
  const [question, setQuestion] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: documents } = useCivicDocuments();
  const { user } = useAuth();
  const { data: conversations } = useNuruConversations();
  const { data: chatMessages } = useNuruMessages(activeConversationId || '');
  const createConversation = useCreateConversation();
  const sendChatMessage = useSendChatMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [question]);

  const handleStartChat = async () => {
    if (!user) return;
    const doc = documents?.find(d => d.id === selectedDocId);
    createConversation.mutate(
      { documentId: selectedDocId || undefined, title: doc ? doc.title.substring(0, 60) : 'General Civic Chat' },
      { onSuccess: (conv) => setActiveConversationId(conv.id) }
    );
  };

  const handleSend = () => {
    if (!question.trim() || !activeConversationId) return;
    sendChatMessage.mutate({ conversationId: activeConversationId, message: question });
    setQuestion('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const confidenceColor = (c: number) => c >= 0.8 ? 'text-emerald-400' : c >= 0.5 ? 'text-amber-400' : 'text-red-400';

  const selectedDoc = documents?.find(d => d.id === selectedDocId);

  return (
    <div className="flex h-[calc(100vh-220px)] rounded-2xl border border-border/40 overflow-hidden bg-card/30 backdrop-blur-sm">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-200 border-r border-border/30 bg-card/60 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-border/30">
          <Button onClick={handleStartChat} disabled={createConversation.isPending || !user} className="w-full gap-2 rounded-xl h-10" size="sm">
            {createConversation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            New conversation
          </Button>
        </div>

        {/* Document selector */}
        <div className="p-3 border-b border-border/30">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Reference Document</p>
          <Select value={selectedDocId} onValueChange={setSelectedDocId}>
            <SelectTrigger className="h-9 text-xs rounded-lg bg-background/50">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Select document..." />
            </SelectTrigger>
            <SelectContent>
              {documents?.map(d => (
                <SelectItem key={d.id} value={d.id} className="text-xs">
                  <span className="truncate">{d.title}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conversation history */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            <p className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">History</p>
            {conversations?.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveConversationId(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all group ${
                  activeConversationId === c.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <p className="font-medium truncate text-[13px]">{c.title || 'Untitled'}</p>
                <p className="text-[10px] mt-0.5 opacity-60">{c.message_count} messages · {format(new Date(c.last_message_at), 'MMM d')}</p>
              </button>
            ))}
            {(!conversations || conversations.length === 0) && (
              <p className="px-3 py-4 text-[11px] text-muted-foreground/50 text-center">No conversations yet</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="h-14 border-b border-border/30 flex items-center justify-between px-4 bg-card/40">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
              <MessageSquareText className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {activeConversationId 
                  ? conversations?.find(c => c.id === activeConversationId)?.title || 'Conversation'
                  : 'NuruAI Chat'}
              </p>
              {selectedDoc && (
                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                  <FileText className="h-2.5 w-2.5" />{selectedDoc.title}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] gap-1 font-normal">
              <Zap className="h-2.5 w-2.5" />Gemini 2.5 Pro
            </Badge>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {!activeConversationId ? (
              /* Welcome Screen */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150" />
                  <div className="relative p-5 rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15">
                    <Brain className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Welcome to NuruAI</h2>
                <p className="text-sm text-muted-foreground max-w-md mb-8">
                  Ask questions about African policy documents. Get evidence-grounded answers with source citations.
                </p>
                
                <div className="grid gap-3 sm:grid-cols-2 w-full max-w-lg">
                  {[
                    { q: 'What does this budget allocate to healthcare?', icon: '🏥' },
                    { q: 'How will this policy affect education?', icon: '📚' },
                    { q: 'What environmental targets are set?', icon: '🌍' },
                    { q: 'What accountability measures exist?', icon: '⚖️' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setQuestion(item.q)}
                      className="text-left p-3.5 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all text-xs group"
                    >
                      <span className="text-base mb-1 block">{item.icon}</span>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{item.q}</span>
                    </button>
                  ))}
                </div>

                {!user && (
                  <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />Sign in to start a conversation
                  </p>
                )}
              </div>
            ) : (
              /* Chat Messages */
              <div className="space-y-6">
                {chatMessages?.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role !== 'user' && (
                      <div className="shrink-0 mt-0.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    )}
                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-lg ml-auto'
                          : 'bg-muted/40 border border-border/30 rounded-bl-lg'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      
                      {/* Metadata row */}
                      <div className={`flex items-center gap-2 mt-1.5 px-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.confidence != null && (
                          <span className={`text-[10px] font-medium ${confidenceColor(msg.confidence)}`}>
                            {Math.round(msg.confidence * 100)}% confidence
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground/50">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                        {msg.processing_time_ms && (
                          <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />{msg.processing_time_ms}ms
                          </span>
                        )}
                      </div>

                      {/* Source passages */}
                      {msg.sources?.passages?.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1"><Quote className="h-3 w-3" />Sources</p>
                          {msg.sources.passages.slice(0, 3).map((p: string, idx: number) => (
                            <div key={idx} className="text-[11px] bg-primary/5 border border-primary/10 rounded-lg p-2.5 text-muted-foreground italic leading-relaxed">
                              "{p}"
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Follow-up suggestions */}
                      {msg.sources?.followUps?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {msg.sources.followUps.map((f: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setQuestion(f)}
                              className="text-[11px] px-3 py-1.5 rounded-full border border-primary/15 text-primary/80 hover:bg-primary/5 hover:text-primary transition-all flex items-center gap-1"
                            >
                              <ArrowRight className="h-2.5 w-2.5" />{f}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="shrink-0 mt-0.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {sendChatMessage.isPending && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted/40 border border-border/30 rounded-2xl rounded-bl-lg px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        Analyzing document...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border/30 p-4 bg-card/40">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 rounded-2xl border border-border/40 bg-background/60 p-2 focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/10 transition-all">
              <textarea
                ref={textareaRef}
                placeholder={activeConversationId ? "Ask about this policy document..." : "Start a new conversation to begin..."}
                rows={1}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={!activeConversationId}
                className="flex-1 resize-none bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground/50 py-2 px-2 max-h-40 disabled:opacity-40"
              />
              <Button
                onClick={handleSend}
                disabled={sendChatMessage.isPending || !activeConversationId || !question.trim()}
                size="icon"
                className="shrink-0 h-9 w-9 rounded-xl"
              >
                {sendChatMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
              NuruAI grounds all answers in source documents. Always verify critical information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Need Brain import
import { Brain } from 'lucide-react';

export default NuruQuestionInterface;
