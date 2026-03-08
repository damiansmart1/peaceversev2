import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ReactMarkdown from 'react-markdown';
import {
  Send, Loader2, FileText, Bot, User, Plus, MessageSquareText,
  AlertCircle, Brain, Trash2, Copy, Check, Sparkles,
  PanelLeftClose, PanelLeft, PanelRightClose, PanelRight,
  Settings2, Search, MoreHorizontal, Pencil, Download,
  Clock, Pin, PinOff, Eraser, ChevronDown, RotateCcw,
  Zap, Globe, Shield, BookOpen, Hash, X,
  ThumbsUp, ThumbsDown, RefreshCw, ArrowRight, MessageCircleQuestion
} from 'lucide-react';
import {
  useCivicDocuments, useNuruConversations, useNuruMessages,
  useCreateConversation, useStreamChatMessage,
  useDeleteConversation, useRenameConversation, useClearConversation,
} from '@/hooks/useNuruAI';
import { useAuth } from '@/contexts/AuthContext';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  streamEnabled: boolean;
  markdownEnabled: boolean;
  showSources: boolean;
  showConfidence: boolean;
  showTimestamps: boolean;
  autoScroll: boolean;
  compactMode: boolean;
}

const DEFAULT_SETTINGS: ChatSettings = {
  model: 'gemini-2.5-pro',
  temperature: 0.7,
  maxTokens: 4096,
  streamEnabled: true,
  markdownEnabled: true,
  showSources: true,
  showConfidence: true,
  showTimestamps: true,
  autoScroll: true,
  compactMode: false,
};

const MODELS = [
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: 'Most capable', icon: '🧠' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'Fast & efficient', icon: '⚡' },
  { value: 'gpt-5', label: 'GPT-5', desc: 'Advanced reasoning', icon: '🤖' },
  { value: 'gpt-5-mini', label: 'GPT-5 Mini', desc: 'Balanced', icon: '💡' },
];

const NuruQuestionInterface = () => {
  const [selectedDocId, setSelectedDocId] = useState('');
  const [question, setQuestion] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('nuru_pinned') || '[]')); } catch { return new Set(); }
  });
  const [settings, setSettings] = useState<ChatSettings>(() => {
    try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('nuru_chat_settings') || '{}') }; } catch { return DEFAULT_SETTINGS; }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: documents } = useCivicDocuments();
  const { user } = useAuth();
  const { data: conversations } = useNuruConversations();
  const { data: chatMessages } = useNuruMessages(activeConversationId || '');
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const renameConversation = useRenameConversation();
  const clearConversation = useClearConversation();
  const { streamChat } = useStreamChatMessage();

  // Persist settings
  useEffect(() => {
    localStorage.setItem('nuru_chat_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('nuru_pinned', JSON.stringify([...pinnedConversations]));
  }, [pinnedConversations]);

  useEffect(() => {
    if (settings.autoScroll) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingContent, settings.autoScroll]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [question]);

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    if (!conversations) return { pinned: [], today: [], yesterday: [], thisWeek: [], thisMonth: [], older: [] };
    const filtered = searchQuery
      ? conversations.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()))
      : conversations;

    const groups = { pinned: [] as any[], today: [] as any[], yesterday: [] as any[], thisWeek: [] as any[], thisMonth: [] as any[], older: [] as any[] };
    filtered.forEach(c => {
      if (pinnedConversations.has(c.id)) { groups.pinned.push(c); return; }
      const d = new Date(c.last_message_at);
      if (isToday(d)) groups.today.push(c);
      else if (isYesterday(d)) groups.yesterday.push(c);
      else if (isThisWeek(d)) groups.thisWeek.push(c);
      else if (isThisMonth(d)) groups.thisMonth.push(c);
      else groups.older.push(c);
    });
    return groups;
  }, [conversations, searchQuery, pinnedConversations]);

  const handleStartChat = async () => {
    if (!user) return;
    const doc = documents?.find(d => d.id === selectedDocId);
    createConversation.mutate(
      { documentId: selectedDocId || undefined, title: doc ? doc.title.substring(0, 60) : 'New Conversation' },
      { onSuccess: (conv) => setActiveConversationId(conv.id) }
    );
  };

  const handleSendMessage = useCallback(async (msg: string, convId?: string) => {
    const targetConvId = convId || activeConversationId;
    if (!msg.trim() || !targetConvId || isStreaming) return;
    setQuestion('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsStreaming(true);
    setStreamingContent('');
    setLastUserMessage(msg);

    try {
      await streamChat(targetConvId, msg, (delta) => setStreamingContent(prev => prev + delta), () => {
        setIsStreaming(false);
        setStreamingContent('');
      });
    } catch (e: any) {
      setIsStreaming(false);
      setStreamingContent('');
      const errorMsg = e.message || 'Failed to send message';
      if (errorMsg.includes('Rate limit') || errorMsg.includes('429')) {
        toast.error(errorMsg, { duration: 8000, description: 'Wait a moment and try again.' });
      } else if (errorMsg.includes('credits') || errorMsg.includes('402')) {
        toast.error(errorMsg, { duration: 10000, description: 'Go to Settings → Workspace → Usage to add credits.' });
      } else {
        toast.error(errorMsg);
      }
    }
  }, [activeConversationId, isStreaming, streamChat]);

  const handleSend = useCallback(() => {
    if (!question.trim() || isStreaming) return;
    handleSendMessage(question);
  }, [question, isStreaming, handleSendMessage]);

  const handleRegenerate = useCallback(async () => {
    if (!lastUserMessage || !activeConversationId || isStreaming) return;
    setIsStreaming(true);
    setStreamingContent('');
    try {
      await streamChat(activeConversationId, lastUserMessage, (delta) => setStreamingContent(prev => prev + delta), () => {
        setIsStreaming(false);
        setStreamingContent('');
      });
    } catch (e: any) {
      setIsStreaming(false);
      setStreamingContent('');
      toast.error(e.message || 'Regeneration failed');
    }
  }, [lastUserMessage, activeConversationId, isStreaming, streamChat]);

  const handleFollowUpClick = useCallback((followUp: string) => {
    if (isStreaming) return;
    setQuestion('');
    handleSendMessage(followUp);
  }, [isStreaming, handleSendMessage]);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportConversation = () => {
    if (!chatMessages || chatMessages.length === 0) return;
    const conv = conversations?.find(c => c.id === activeConversationId);
    const content = chatMessages.map(m => `## ${m.role === 'user' ? 'You' : 'NuruAI'}\n${m.content}\n`).join('\n---\n\n');
    const header = `# ${conv?.title || 'Conversation'}\nExported: ${new Date().toISOString()}\n\n---\n\n`;
    const blob = new Blob([header + content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nuru-chat-${format(new Date(), 'yyyy-MM-dd-HHmm')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Conversation exported');
  };

  const togglePin = (id: string) => {
    setPinnedConversations(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRename = (convId: string) => {
    if (!editTitle.trim()) return;
    renameConversation.mutate({ conversationId: convId, title: editTitle.trim() });
    setEditingConvId(null);
  };

  const updateSetting = <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const selectedDoc = documents?.find(d => d.id === selectedDocId);
  const activeConv = conversations?.find(c => c.id === activeConversationId);
  const messageCount = chatMessages?.length || 0;

  return (
    <div className="flex h-[calc(100vh-220px)] rounded-2xl border border-border/40 overflow-hidden bg-card/20">
      {/* ===== LEFT SIDEBAR: Conversations ===== */}
      <AnimatePresence>
        {leftSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r border-border/30 bg-card/60 flex flex-col overflow-hidden"
          >
            {/* New Chat Button */}
            <div className="p-3 border-b border-border/30">
              <Button onClick={handleStartChat} disabled={createConversation.isPending || !user} className="w-full gap-2 rounded-xl h-9 text-xs" size="sm">
                {createConversation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                New conversation
              </Button>
            </div>

            {/* Search */}
            <div className="px-3 pt-3 pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-8 text-xs pl-8 rounded-lg bg-background/50 border-border/30"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Document Context */}
            <div className="px-3 pb-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Context Document</p>
              <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                <SelectTrigger className="h-8 text-xs rounded-lg bg-background/50">
                  <FileText className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Select document..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">No document</SelectItem>
                  {documents?.map(d => (
                    <SelectItem key={d.id} value={d.id} className="text-xs">
                      <span className="truncate">{d.title}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator className="opacity-30" />

            {/* Conversation List */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-0.5">
                {Object.entries(groupedConversations).map(([group, convs]) => {
                  if (convs.length === 0) return null;
                  const groupLabels: Record<string, string> = {
                    pinned: '📌 Pinned', today: 'Today', yesterday: 'Yesterday',
                    thisWeek: 'This Week', thisMonth: 'This Month', older: 'Older'
                  };
                  return (
                    <div key={group}>
                      <p className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                        {groupLabels[group]}
                      </p>
                      {convs.map((c: any) => (
                        <ConversationItem
                          key={c.id}
                          conversation={c}
                          isActive={activeConversationId === c.id}
                          isPinned={pinnedConversations.has(c.id)}
                          isEditing={editingConvId === c.id}
                          editTitle={editTitle}
                          onSelect={() => setActiveConversationId(c.id)}
                          onPin={() => togglePin(c.id)}
                          onStartEdit={() => { setEditingConvId(c.id); setEditTitle(c.title || ''); }}
                          onSaveEdit={() => handleRename(c.id)}
                          onCancelEdit={() => setEditingConvId(null)}
                          onEditTitleChange={setEditTitle}
                          onDelete={() => {
                            if (activeConversationId === c.id) setActiveConversationId(null);
                            deleteConversation.mutate(c.id);
                          }}
                          onClear={() => clearConversation.mutate(c.id)}
                        />
                      ))}
                    </div>
                  );
                })}
                {(!conversations || conversations.length === 0) && (
                  <div className="text-center py-8 px-4">
                    <MessageSquareText className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-[11px] text-muted-foreground/40">No conversations yet</p>
                    <p className="text-[10px] text-muted-foreground/30 mt-1">Start a new conversation above</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-border/30 bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/50">{conversations?.length || 0} conversations</span>
                <Button variant="ghost" size="sm" onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className="h-7 px-2 text-[10px] gap-1">
                  <Settings2 className="h-3 w-3" /> Settings
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MAIN CHAT AREA ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 border-b border-border/30 flex items-center justify-between px-3 bg-card/30">
          <div className="flex items-center gap-2 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className="p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                  {leftSidebarOpen ? <PanelLeftClose className="h-4 w-4 text-muted-foreground" /> : <PanelLeft className="h-4 w-4 text-muted-foreground" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{leftSidebarOpen ? 'Close sidebar' : 'Open sidebar'}</TooltipContent>
            </Tooltip>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {activeConv?.title || 'NuruAI Civic Chat'}
              </p>
              {activeConversationId && (
                <p className="text-[10px] text-muted-foreground/50">{messageCount} messages</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {selectedDoc && (
              <Badge variant="outline" className="text-[9px] gap-1 font-normal max-w-[140px] truncate hidden sm:flex">
                <FileText className="h-2.5 w-2.5 shrink-0" />{selectedDoc.title}
              </Badge>
            )}
            <Badge variant="secondary" className="text-[9px] gap-1 font-normal hidden sm:flex">
              <Sparkles className="h-2.5 w-2.5" />
              {MODELS.find(m => m.value === settings.model)?.label || 'Gemini Pro'}
            </Badge>
            {activeConversationId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleExportConversation} className="text-xs gap-2">
                    <Download className="h-3.5 w-3.5" /> Export as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => clearConversation.mutate(activeConversationId)} className="text-xs gap-2">
                    <Eraser className="h-3.5 w-3.5" /> Clear messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setActiveConversationId(null); deleteConversation.mutate(activeConversationId); }} className="text-xs gap-2 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" /> Delete conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className="p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                  {rightSidebarOpen ? <PanelRightClose className="h-4 w-4 text-muted-foreground" /> : <Settings2 className="h-4 w-4 text-muted-foreground" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{rightSidebarOpen ? 'Close settings' : 'Open settings'}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {!activeConversationId ? (
              <WelcomeScreen setQuestion={setQuestion} user={user} onNewChat={handleStartChat} />
            ) : (
              <div className="space-y-1">
                {chatMessages?.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    msg={msg}
                    onCopy={handleCopy}
                    copiedId={copiedId}
                    compact={settings.compactMode}
                    showTimestamps={settings.showTimestamps}
                    showConfidence={settings.showConfidence}
                    markdownEnabled={settings.markdownEnabled}
                  />
                ))}

                {isStreaming && streamingContent && (
                  <div className={`flex gap-3 ${settings.compactMode ? 'py-2' : 'py-4'}`}>
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
                placeholder={activeConversationId ? "Ask about policies, budgets, legislation..." : "Start a new conversation to begin..."}
                rows={1}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!activeConversationId && user) {
                      // Auto-create conversation on first message
                      const doc = documents?.find(d => d.id === selectedDocId);
                      createConversation.mutate(
                        { documentId: selectedDocId || undefined, title: question.substring(0, 60) || 'New Chat' },
                        {
                          onSuccess: (conv) => {
                            setActiveConversationId(conv.id);
                            // Send will be triggered after state update
                            setTimeout(async () => {
                              setIsStreaming(true);
                              setStreamingContent('');
                              const msg = question;
                              setQuestion('');
                              try {
                                await streamChat(conv.id, msg, (delta) => setStreamingContent(prev => prev + delta), () => { setIsStreaming(false); setStreamingContent(''); });
                              } catch (err: any) {
                                setIsStreaming(false); setStreamingContent('');
                                toast.error(err.message || 'Failed');
                              }
                            }, 100);
                          }
                        }
                      );
                      return;
                    }
                    handleSend();
                  }
                }}
                disabled={isStreaming || !user}
                className="flex-1 resize-none bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground/40 py-2 px-2 max-h-40 disabled:opacity-40"
              />
              <Button
                onClick={() => {
                  if (!activeConversationId && user && question.trim()) {
                    createConversation.mutate(
                      { documentId: selectedDocId || undefined, title: question.substring(0, 60) || 'New Chat' },
                      {
                        onSuccess: (conv) => {
                          setActiveConversationId(conv.id);
                          setTimeout(async () => {
                            setIsStreaming(true); setStreamingContent('');
                            const msg = question; setQuestion('');
                            try {
                              await streamChat(conv.id, msg, (d) => setStreamingContent(p => p + d), () => { setIsStreaming(false); setStreamingContent(''); });
                            } catch (err: any) { setIsStreaming(false); setStreamingContent(''); toast.error(err.message || 'Failed'); }
                          }, 100);
                        }
                      }
                    );
                    return;
                  }
                  handleSend();
                }}
                disabled={isStreaming || !question.trim() || !user}
                size="icon"
                className="shrink-0 h-8 w-8 rounded-lg"
              >
                {isStreaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <p className="text-[9px] text-muted-foreground/30 text-center mt-1.5">
              NuruAI grounds answers in source documents · Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDEBAR: Settings ===== */}
      <AnimatePresence>
        {rightSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l border-border/30 bg-card/60 flex flex-col overflow-hidden"
          >
            <div className="h-12 border-b border-border/30 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Chat Settings</span>
              </div>
              <button onClick={() => setRightSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-muted/40">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-5">
                {/* Model Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-primary" /> AI Model
                  </Label>
                  <div className="space-y-1">
                    {MODELS.map(m => (
                      <button
                        key={m.value}
                        onClick={() => updateSetting('model', m.value)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${
                          settings.model === m.value
                            ? 'border-primary/30 bg-primary/5 text-foreground'
                            : 'border-border/20 hover:border-border/40 hover:bg-muted/20 text-muted-foreground'
                        }`}
                      >
                        <span className="text-sm">{m.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{m.label}</p>
                          <p className="text-[10px] text-muted-foreground/60">{m.desc}</p>
                        </div>
                        {settings.model === m.value && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="opacity-30" />

                {/* Response Settings */}
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-gold" /> Response
                  </Label>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">Creativity</span>
                      <span className="text-[10px] text-primary font-mono">{settings.temperature.toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[settings.temperature]}
                      onValueChange={([v]) => updateSetting('temperature', v)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground/40">
                      <span>Precise</span><span>Creative</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Max tokens</span>
                    <Select value={String(settings.maxTokens)} onValueChange={v => updateSetting('maxTokens', Number(v))}>
                      <SelectTrigger className="h-7 w-24 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1024, 2048, 4096, 8192, 16384].map(n => (
                          <SelectItem key={n} value={String(n)} className="text-xs">{n.toLocaleString()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="opacity-30" />

                {/* Display Settings */}
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-secondary" /> Display
                  </Label>

                  {[
                    { key: 'markdownEnabled' as const, label: 'Render Markdown', desc: 'Format AI responses' },
                    { key: 'showSources' as const, label: 'Show Sources', desc: 'Display document references' },
                    { key: 'showConfidence' as const, label: 'Confidence Scores', desc: 'Show AI confidence level' },
                    { key: 'showTimestamps' as const, label: 'Timestamps', desc: 'Show message times' },
                    { key: 'autoScroll' as const, label: 'Auto-scroll', desc: 'Scroll to new messages' },
                    { key: 'compactMode' as const, label: 'Compact Mode', desc: 'Reduce message spacing' },
                    { key: 'streamEnabled' as const, label: 'Stream Responses', desc: 'Show tokens as they arrive' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-[11px] font-medium text-foreground/80">{item.label}</p>
                        <p className="text-[9px] text-muted-foreground/50">{item.desc}</p>
                      </div>
                      <Switch
                        checked={settings[item.key] as boolean}
                        onCheckedChange={v => updateSetting(item.key, v)}
                        className="scale-75"
                      />
                    </div>
                  ))}
                </div>

                <Separator className="opacity-30" />

                {/* Reset */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSettings(DEFAULT_SETTINGS)}
                  className="w-full gap-2 text-xs h-8 rounded-lg"
                >
                  <RotateCcw className="h-3 w-3" /> Reset to defaults
                </Button>

                {/* Active Conversation Info */}
                {activeConv && (
                  <>
                    <Separator className="opacity-30" />
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-accent" /> Conversation Info
                      </Label>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created</span>
                          <span className="text-foreground/70">{format(new Date(activeConv.created_at), 'MMM d, HH:mm')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Messages</span>
                          <span className="text-foreground/70">{activeConv.message_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last active</span>
                          <span className="text-foreground/70">{format(new Date(activeConv.last_message_at), 'MMM d, HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== Conversation List Item =====
const ConversationItem = ({
  conversation, isActive, isPinned, isEditing, editTitle,
  onSelect, onPin, onStartEdit, onSaveEdit, onCancelEdit, onEditTitleChange,
  onDelete, onClear,
}: {
  conversation: any; isActive: boolean; isPinned: boolean; isEditing: boolean; editTitle: string;
  onSelect: () => void; onPin: () => void; onStartEdit: () => void; onSaveEdit: () => void;
  onCancelEdit: () => void; onEditTitleChange: (v: string) => void; onDelete: () => void; onClear: () => void;
}) => {
  if (isEditing) {
    return (
      <div className="px-2 py-1.5">
        <div className="flex items-center gap-1">
          <Input
            value={editTitle}
            onChange={e => onEditTitleChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onSaveEdit(); if (e.key === 'Escape') onCancelEdit(); }}
            className="h-7 text-xs flex-1"
            autoFocus
          />
          <Button variant="ghost" size="sm" onClick={onSaveEdit} className="h-7 w-7 p-0">
            <Check className="h-3 w-3 text-primary" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancelEdit} className="h-7 w-7 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <button
        onClick={onSelect}
        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all pr-8 ${
          isActive
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground border border-transparent'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {isPinned && <Pin className="h-2.5 w-2.5 text-gold shrink-0" />}
          <p className="font-medium truncate text-[12px]">{conversation.title || 'Untitled'}</p>
        </div>
        <p className="text-[10px] mt-0.5 opacity-50">
          {conversation.message_count} msgs · {format(new Date(conversation.last_message_at), 'MMM d')}
        </p>
      </button>

      <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded hover:bg-muted/60"><MoreHorizontal className="h-3.5 w-3.5" /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onPin} className="text-xs gap-2">
              {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
              {isPinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onStartEdit} className="text-xs gap-2">
              <Pencil className="h-3 w-3" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onClear} className="text-xs gap-2">
              <Eraser className="h-3 w-3" /> Clear
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-xs gap-2 text-destructive">
              <Trash2 className="h-3 w-3" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// ===== Chat Message =====
const ChatMessage = ({ msg, onCopy, copiedId, compact, showTimestamps, showConfidence, markdownEnabled }: {
  msg: any; onCopy: (c: string, id: string) => void; copiedId: string | null;
  compact: boolean; showTimestamps: boolean; showConfidence: boolean; markdownEnabled: boolean;
}) => {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-3 ${compact ? 'py-2' : 'py-4'} ${isUser ? '' : 'bg-muted/5 -mx-4 px-4 rounded-lg'}`}>
      <div className="shrink-0 mt-1">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isUser ? 'bg-primary/10 border border-primary/15' : 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15'
        }`}>
          {isUser ? <User className="h-3.5 w-3.5 text-primary" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-medium text-foreground/70">{isUser ? 'You' : 'NuruAI'}</span>
          {showTimestamps && <span className="text-[10px] text-muted-foreground/40">{format(new Date(msg.created_at), 'HH:mm')}</span>}
          {msg.processing_time_ms && showTimestamps && (
            <span className="text-[10px] text-muted-foreground/30">{(msg.processing_time_ms / 1000).toFixed(1)}s</span>
          )}
        </div>

        {isUser ? (
          <p className="text-sm leading-relaxed text-foreground">{msg.content}</p>
        ) : markdownEnabled ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&>*:first-child]:mt-0 [&_h2]:text-base [&_h3]:text-sm [&_p]:text-sm [&_li]:text-sm [&_blockquote]:border-primary/30 [&_blockquote]:bg-primary/5 [&_blockquote]:rounded-r-lg [&_blockquote]:py-1">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{msg.content}</p>
        )}

        {!isUser && (
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => onCopy(msg.content, msg.id)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/30"
            >
              {copiedId === msg.id ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
              {copiedId === msg.id ? 'Copied' : 'Copy'}
            </button>
            {showConfidence && msg.confidence != null && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                msg.confidence >= 0.8 ? 'bg-success/10 text-success' : msg.confidence >= 0.5 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
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

// ===== Welcome Screen =====
const WelcomeScreen = ({ setQuestion, user, onNewChat }: { setQuestion: (q: string) => void; user: any; onNewChat: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150" />
      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15">
        <Brain className="h-8 w-8 text-primary" />
      </div>
    </div>
    <h2 className="text-xl font-bold text-foreground mb-1">NuruAI Civic Intelligence</h2>
    <p className="text-sm text-muted-foreground max-w-md mb-2">
      Ask questions about African policy documents. Get evidence-grounded answers with source citations.
    </p>
    <p className="text-xs text-muted-foreground/50 mb-8">
      Just type your question below — a conversation will be created automatically.
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
