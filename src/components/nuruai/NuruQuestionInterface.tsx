import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { 
  Send, Loader2, FileText, Bot, User, Plus, MessageSquareText, 
  AlertCircle, Zap, Brain, Trash2, Share2, PanelLeftClose, PanelLeft, Copy, Check, Sparkles
} from 'lucide-react';
import { useCivicDocuments, useNuruConversations, useNuruMessages, useCreateConversation, useStreamChatMessage } from '@/hooks/useNuruAI';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

const NuruQuestionInterface = () => {
  const [selectedDocId, setSelectedDocId] = useState('');
  const [question, setQuestion] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: documents } = useCivicDocuments();
  const { user } = useAuth();
  const { data: conversations } = useNuruConversations();
  const { data: chatMessages } = useNuruMessages(activeConversationId || '');
  const createConversation = useCreateConversation();
  const { streamChat } = useStreamChatMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingContent]);

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
      { documentId: selectedDocId || undefined, title: doc ? doc.title.substring(0, 60) : 'New Conversation' },
      { onSuccess: (conv) => setActiveConversationId(conv.id) }
    );
  };

  const handleSend = useCallback(async () => {
    if (!question.trim() || !activeConversationId || isStreaming) return;
    const msg = question;
    setQuestion('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    
    setIsStreaming(true);
    setStreamingContent('');

    try {
      await streamChat(
        activeConversationId,
        msg,
        (delta) => setStreamingContent(prev => prev + delta),
        () => {
          setIsStreaming(false);
          setStreamingContent('');
        }
      );
    } catch (e: any) {
      setIsStreaming(false);
      setStreamingContent('');
      toast.error(e.message || 'Failed to send message');
    }
  }, [question, activeConversationId, isStreaming, streamChat]);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectedDoc = documents?.find(d => d.id === selectedDocId);

  return (
    <div className="flex h-[calc(100vh-220px)] rounded-2xl border border-border/40 overflow-hidden bg-card/20">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r border-border/30 bg-card/60 flex flex-col overflow-hidden"
          >
            <div className="p-3 border-b border-border/30">
              <Button onClick={handleStartChat} disabled={createConversation.isPending || !user} className="w-full gap-2 rounded-xl h-9 text-xs" size="sm">
                {createConversation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                New conversation
              </Button>
            </div>

            <div className="p-3 border-b border-border/30">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Context Document</p>
              <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                <SelectTrigger className="h-8 text-xs rounded-lg bg-background/50">
                  <FileText className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
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

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-0.5">
                <p className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Conversations</p>
                {conversations?.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                      activeConversationId === c.id 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground border border-transparent'
                    }`}
                  >
                    <p className="font-medium truncate text-[12px]">{c.title || 'Untitled'}</p>
                    <p className="text-[10px] mt-0.5 opacity-50">{c.message_count} msgs · {format(new Date(c.last_message_at), 'MMM d')}</p>
                  </button>
                ))}
                {(!conversations || conversations.length === 0) && (
                  <p className="px-3 py-4 text-[11px] text-muted-foreground/40 text-center">No conversations yet</p>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 border-b border-border/30 flex items-center justify-between px-4 bg-card/30">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4 text-muted-foreground" /> : <PanelLeft className="h-4 w-4 text-muted-foreground" />}
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {activeConversationId 
                  ? conversations?.find(c => c.id === activeConversationId)?.title || 'Conversation'
                  : 'NuruAI Civic Chat'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {selectedDoc && (
              <Badge variant="outline" className="text-[9px] gap-1 font-normal max-w-[160px] truncate">
                <FileText className="h-2.5 w-2.5 shrink-0" />{selectedDoc.title}
              </Badge>
            )}
            <Badge variant="secondary" className="text-[9px] gap-1 font-normal">
              <Sparkles className="h-2.5 w-2.5" />Gemini 2.5 Pro
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {!activeConversationId ? (
              <WelcomeScreen setQuestion={setQuestion} user={user} />
            ) : (
              <div className="space-y-1">
                {chatMessages?.map((msg) => (
                  <ChatMessage key={msg.id} msg={msg} onCopy={handleCopy} copiedId={copiedId} />
                ))}

                {/* Streaming message */}
                {isStreaming && streamingContent && (
                  <div className="flex gap-3 py-4">
                    <div className="shrink-0 mt-1">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                        <ReactMarkdown>{streamingContent}</ReactMarkdown>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-primary/60 flex items-center gap-1">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />Generating...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {isStreaming && !streamingContent && (
                  <div className="flex gap-3 py-4">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center shrink-0">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs">Analyzing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border/30 p-3 bg-card/30">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 rounded-xl border border-border/40 bg-background/60 p-1.5 focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/10 transition-all">
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
                disabled={!activeConversationId || isStreaming}
                className="flex-1 resize-none bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground/40 py-2 px-2 max-h-40 disabled:opacity-40"
              />
              <Button
                onClick={handleSend}
                disabled={isStreaming || !activeConversationId || !question.trim()}
                size="icon"
                className="shrink-0 h-8 w-8 rounded-lg"
              >
                {isStreaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <p className="text-[9px] text-muted-foreground/30 text-center mt-1.5">
              NuruAI grounds answers in source documents · Verify critical information independently
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat message component
const ChatMessage = ({ msg, onCopy, copiedId }: { msg: any; onCopy: (content: string, id: string) => void; copiedId: string | null }) => {
  const isUser = msg.role === 'user';
  
  return (
    <div className={`flex gap-3 py-4 ${isUser ? '' : 'bg-muted/5 -mx-4 px-4 rounded-lg'}`}>
      <div className="shrink-0 mt-1">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isUser 
            ? 'bg-primary/10 border border-primary/15' 
            : 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15'
        }`}>
          {isUser ? <User className="h-3.5 w-3.5 text-primary" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-medium text-foreground/70">{isUser ? 'You' : 'NuruAI'}</span>
          <span className="text-[10px] text-muted-foreground/40">{format(new Date(msg.created_at), 'HH:mm')}</span>
          {msg.processing_time_ms && (
            <span className="text-[10px] text-muted-foreground/30">{(msg.processing_time_ms / 1000).toFixed(1)}s</span>
          )}
        </div>
        
        {isUser ? (
          <p className="text-sm leading-relaxed text-foreground">{msg.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&>*:first-child]:mt-0 [&_h2]:text-base [&_h3]:text-sm [&_p]:text-sm [&_li]:text-sm [&_blockquote]:border-primary/30 [&_blockquote]:bg-primary/5 [&_blockquote]:rounded-r-lg [&_blockquote]:py-1">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}

        {/* Actions for AI messages */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => onCopy(msg.content, msg.id)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/30"
            >
              {copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copiedId === msg.id ? 'Copied' : 'Copy'}
            </button>
            {msg.confidence != null && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                msg.confidence >= 0.8 ? 'bg-emerald-500/10 text-emerald-500' : msg.confidence >= 0.5 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {Math.round(msg.confidence * 100)}% confidence
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Welcome screen
const WelcomeScreen = ({ setQuestion, user }: { setQuestion: (q: string) => void; user: any }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150" />
      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15">
        <Brain className="h-8 w-8 text-primary" />
      </div>
    </div>
    <h2 className="text-xl font-bold text-foreground mb-1">NuruAI Civic Intelligence</h2>
    <p className="text-sm text-muted-foreground max-w-md mb-8">
      Ask questions about African policy documents. Get evidence-grounded answers with source citations and expert analysis.
    </p>
    
    <div className="grid gap-2.5 sm:grid-cols-2 w-full max-w-lg">
      {[
        { q: 'What does this budget allocate to healthcare?', icon: '🏥' },
        { q: 'How will this policy affect education?', icon: '📚' },
        { q: 'What environmental targets are set?', icon: '🌍' },
        { q: 'What accountability measures exist?', icon: '⚖️' },
      ].map((item, i) => (
        <button
          key={i}
          onClick={() => setQuestion(item.q)}
          className="text-left p-3 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-xs group"
        >
          <span className="text-sm mb-0.5 block">{item.icon}</span>
          <span className="text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">{item.q}</span>
        </button>
      ))}
    </div>

    {!user && (
      <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1.5">
        <AlertCircle className="h-3.5 w-3.5" />Sign in to start a conversation
      </p>
    )}
  </div>
);

export default NuruQuestionInterface;
