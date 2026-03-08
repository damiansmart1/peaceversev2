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
  ThumbsUp, ThumbsDown, RefreshCw, ArrowRight, MessageCircleQuestion,
  Square, Mic, MicOff, Paperclip, Share2, Keyboard,
  FileUp, Image, File, XCircle, ExternalLink, Languages,
  BarChart3, GitCompare, ListChecks
} from 'lucide-react';
import {
  useCivicDocuments, useNuruConversations, useNuruMessages,
  useCreateConversation, useStreamChatMessage,
  useDeleteConversation, useRenameConversation, useClearConversation,
  extractTextFromAttachment, type ChatAttachment,
} from '@/hooks/useNuruAI';
import { useSubmitAIFeedback } from '@/hooks/useNuruGovernance';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';

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

const QUICK_ACTIONS = [
  { id: 'summarize', label: 'Summarize', icon: ListChecks, prompt: 'Please provide a concise summary of this document, highlighting the key points, financial figures, and citizen impact.' },
  { id: 'extract', label: 'Extract Data', icon: BarChart3, prompt: 'Extract all key data points, statistics, financial figures, dates, and metrics from this document in a structured format.' },
  { id: 'compare', label: 'Compare', icon: GitCompare, prompt: 'Compare the key provisions, allocations, and commitments in this document against stated objectives. Identify any gaps or inconsistencies.' },
  { id: 'translate', label: 'Simplify', icon: Languages, prompt: 'Rewrite the most important parts of this document in simple, everyday language that any citizen can understand. Avoid jargon.' },
];

const NuruQuestionInterface = () => {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const selectedDocId = selectedDocIds[0] || '';
  const setSelectedDocId = (id: string) => setSelectedDocIds(id && id !== 'none' ? [id] : []);
  const [question, setQuestion] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const [feedbackDialogMsg, setFeedbackDialogMsg] = useState<any>(null);
  const [feedbackType, setFeedbackType] = useState('inaccurate');
  const [feedbackSeverity, setFeedbackSeverity] = useState('medium');
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isDragOver, setIsDragOver] = useState(false);
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('nuru_pinned') || '[]')); } catch { return new Set(); }
  });
  const [settings, setSettings] = useState<ChatSettings>(() => {
    try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('nuru_chat_settings') || '{}') }; } catch { return DEFAULT_SETTINGS; }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const { data: documents } = useCivicDocuments();
  const { user } = useAuth();
  const { data: conversations } = useNuruConversations();
  const { data: chatMessages } = useNuruMessages(activeConversationId || '');
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const renameConversation = useRenameConversation();
  const clearConversation = useClearConversation();
  const { streamChat, abort: abortStream } = useStreamChatMessage();
  const submitAIFeedback = useSubmitAIFeedback();

  // Persist settings & pinned
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + N → new conversation
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        handleStartChat();
      }
      // Ctrl/Cmd + Shift + S → toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setLeftSidebarOpen(p => !p);
      }
      // Escape → stop generation or close dialogs
      if (e.key === 'Escape') {
        if (isStreaming) {
          e.preventDefault();
          handleStopGeneration();
        }
      }
      // Ctrl + ? → shortcuts dialog
      if ((e.metaKey || e.ctrlKey) && e.key === '?') {
        e.preventDefault();
        setShowShortcutsDialog(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStreaming]);

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

  const handleStopGeneration = useCallback(() => {
    abortStream();
    setIsStreaming(false);
    setStreamingContent('');
    toast.info('Generation stopped');
  }, [abortStream]);

  // File attachment handling
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsExtractingText(true);
    const newAttachments: ChatAttachment[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 20MB)`);
        continue;
      }

      const attachment: ChatAttachment = {
        file,
        name: file.name,
        type: file.type,
        size: file.size,
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        attachment.previewUrl = URL.createObjectURL(file);
      }

      // Extract text from text-based files
      const extractedText = await extractTextFromAttachment(file);
      if (extractedText) {
        attachment.extractedText = extractedText;
      }

      newAttachments.push(attachment);
    }

    setAttachments(prev => [...prev, ...newAttachments].slice(0, 5)); // Max 5 attachments
    setIsExtractingText(false);
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => {
      const next = [...prev];
      if (next[index]?.previewUrl) URL.revokeObjectURL(next[index].previewUrl!);
      next.splice(index, 1);
      return next;
    });
  }, []);

  // Drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Voice input
  const toggleVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input is not supported in this browser');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setQuestion(prev => {
        // Replace the last interim result with the final one
        const parts = prev.split('|VOICE|');
        return (parts[0] || '') + transcript;
      });
    };

    recognition.onerror = (e: any) => {
      console.error('Speech recognition error:', e.error);
      setIsListening(false);
      if (e.error === 'not-allowed') toast.error('Microphone access denied');
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    toast.info('Listening... speak your question', { duration: 2000 });
  }, [isListening]);

  const handleSendMessage = useCallback(async (msg: string, convId?: string) => {
    const targetConvId = convId || activeConversationId;
    if (!msg.trim() || !targetConvId || isStreaming) return;
    setQuestion('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsStreaming(true);
    setStreamingContent('');
    setLastUserMessage(msg);

    // Build attachment context
    const attachmentContext = attachments
      .map(a => a.extractedText ? `[File: ${a.name}]\n${a.extractedText.substring(0, 15000)}` : `[File: ${a.name} - binary, no text extracted]`)
      .join('\n\n');

    // Clear attachments after sending
    attachments.forEach(a => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
    setAttachments([]);

    try {
      await streamChat(targetConvId, msg, (delta) => setStreamingContent(prev => prev + delta), () => {
        setIsStreaming(false);
        setStreamingContent('');
      }, attachmentContext || undefined);
    } catch (e: any) {
      setIsStreaming(false);
      setStreamingContent('');
      const errorMsg = e.message || 'Failed to send message';
      if (e.name === 'AbortError') return; // User cancelled
      if (errorMsg.includes('Rate limit') || errorMsg.includes('429')) {
        toast.error(errorMsg, { duration: 8000, description: 'Wait a moment and try again.' });
      } else if (errorMsg.includes('credits') || errorMsg.includes('402')) {
        toast.error(errorMsg, { duration: 10000, description: 'Go to Settings → Workspace → Usage to add credits.' });
      } else {
        toast.error(errorMsg);
      }
    }
  }, [activeConversationId, isStreaming, streamChat, attachments]);

  const handleSend = useCallback(() => {
    if (!question.trim() || isStreaming) return;
    handleSendMessage(question);
  }, [question, isStreaming, handleSendMessage]);

  const handleQuickAction = useCallback((action: typeof QUICK_ACTIONS[0]) => {
    if (isStreaming) return;
    setQuestion('');
    handleSendMessage(action.prompt);
  }, [isStreaming, handleSendMessage]);

  const handleEditMessage = useCallback((msg: any) => {
    setEditingMessageId(msg.id);
    setEditMessageContent(msg.content);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editMessageContent.trim() || !activeConversationId) return;
    setEditingMessageId(null);
    handleSendMessage(editMessageContent);
  }, [editMessageContent, activeConversationId, handleSendMessage]);

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
      if (e.name !== 'AbortError') toast.error(e.message || 'Regeneration failed');
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

  const handleExportConversation = (fmt?: string) => {
    if (!chatMessages || chatMessages.length === 0) return;
    const conv = conversations?.find(c => c.id === activeConversationId);
    const title = conv?.title || 'NuruAI Conversation';
    const dateStr = format(new Date(), 'yyyy-MM-dd-HHmm');
    const selectedFormat = fmt || exportFormat;

    if (selectedFormat === 'json') {
      const jsonData = {
        title,
        exportedAt: new Date().toISOString(),
        messageCount: chatMessages.length,
        messages: chatMessages.map(m => ({
          role: m.role, content: m.content, timestamp: m.created_at,
          model: m.model_used || undefined, processingTime: m.processing_time_ms || undefined,
        })),
      };
      downloadBlob(new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' }), `nuru-chat-${dateStr}.json`);
    } else if (selectedFormat === 'csv') {
      const rows = [['Role', 'Content', 'Timestamp', 'Model'].join(',')];
      chatMessages.forEach(m => {
        rows.push([m.role, `"${m.content.replace(/"/g, '""')}"`, m.created_at, m.model_used || ''].join(','));
      });
      downloadBlob(new Blob([rows.join('\n')], { type: 'text/csv' }), `nuru-chat-${dateStr}.csv`);
    } else if (selectedFormat === 'word') {
      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"><title>${title}</title>
        <style>body{font-family:Calibri,sans-serif;margin:40px;color:#333}h1{color:#074F98;font-size:20px;border-bottom:2px solid #074F98;padding-bottom:8px}
        .user{background:#f0f4f8;padding:12px;border-radius:8px;margin:8px 0;border-left:4px solid #275432}
        .assistant{background:#fafbfc;padding:12px;border-radius:8px;margin:8px 0;border-left:4px solid #074F98}
        .meta{color:#888;font-size:10px}.footer{margin-top:30px;border-top:1px solid #ccc;padding-top:10px;font-size:9px;color:#999}</style></head>
        <body><p class="meta">PEACEVERSE — NuruAI Civic Intelligence | Exported: ${new Date().toLocaleDateString()}</p>
        <h1>${title}</h1>
        ${chatMessages.map(m => `<div class="${m.role}"><p class="meta"><strong>${m.role === 'user' ? '👤 You' : '🤖 NuruAI'}</strong> · ${m.created_at ? format(new Date(m.created_at), 'MMM d, yyyy HH:mm') : ''}</p><p>${m.content.replace(/\n/g, '<br>')}</p></div>`).join('')}
        <div class="footer">PeaceVerse — NuruAI Civic Intelligence Platform</div></body></html>`;
      downloadBlob(new Blob([html], { type: 'application/msword' }), `nuru-chat-${dateStr}.doc`);
    } else if (selectedFormat === 'pdf') {
      import('jspdf').then(({ jsPDF }) => {
        import('jspdf-autotable').then((autoTableMod) => {
          const pdf = new jsPDF('p', 'mm', 'a4');
          const autoTable = autoTableMod.default;
          pdf.setFontSize(8); pdf.setTextColor(120);
          pdf.text('PEACEVERSE — NuruAI Civic Intelligence | Conversation Export', 14, 12);
          pdf.text(`Generated: ${new Date().toISOString().split('T')[0]}`, 14, 17);
          pdf.setDrawColor(200); pdf.line(14, 19, 196, 19);
          pdf.setFontSize(14); pdf.setTextColor(30);
          pdf.text(title, 14, 28);
          pdf.setFontSize(9); pdf.setTextColor(80);
          pdf.text(`${chatMessages.length} messages`, 14, 34);

          const rows = chatMessages.map(m => [
            m.role === 'user' ? 'You' : 'NuruAI',
            m.content.substring(0, 2000),
            m.created_at ? format(new Date(m.created_at), 'MMM d HH:mm') : '',
          ]);
          autoTable(pdf, {
            startY: 38, head: [['Speaker', 'Message', 'Time']], body: rows,
            theme: 'grid', headStyles: { fillColor: [7, 79, 152], fontSize: 8 },
            bodyStyles: { fontSize: 7, cellPadding: 3 },
            columnStyles: { 0: { cellWidth: 18 }, 1: { cellWidth: 145 }, 2: { cellWidth: 23 } },
            margin: { left: 14, right: 14 },
          });
          const pageCount = pdf.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i); pdf.setFontSize(7); pdf.setTextColor(150);
            pdf.text(`PeaceVerse — NuruAI | Page ${i} of ${pageCount}`, 14, 290);
          }
          pdf.save(`nuru-chat-${dateStr}.pdf`);
        });
      });
    } else {
      // Markdown fallback
      const content = chatMessages.map(m => `## ${m.role === 'user' ? 'You' : 'NuruAI'}\n${m.content}\n`).join('\n---\n\n');
      const header = `# ${title}\nExported: ${new Date().toISOString()}\n\n---\n\n`;
      downloadBlob(new Blob([header + content], { type: 'text/markdown' }), `nuru-chat-${dateStr}.md`);
    }

    toast.success(`Conversation exported as ${selectedFormat.toUpperCase()}`);
    setShowExportDialog(false);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleShareConversation = useCallback(() => {
    if (!activeConversationId || !chatMessages?.length) return;
    const conv = conversations?.find(c => c.id === activeConversationId);
    const text = chatMessages
      .map(m => `${m.role === 'user' ? '👤 You' : '🤖 NuruAI'}: ${m.content.substring(0, 500)}${m.content.length > 500 ? '...' : ''}`)
      .join('\n\n');
    const shareText = `📋 NuruAI Conversation: ${conv?.title || 'Untitled'}\n\n${text}`;

    if (navigator.share) {
      navigator.share({ title: `NuruAI: ${conv?.title}`, text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Conversation copied to clipboard');
    }
  }, [activeConversationId, chatMessages, conversations]);

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
  const hasDocContext = !!selectedDoc || !!activeConv?.document_id;

  // Auto-create conversation when typing without one
  const ensureConversation = useCallback(async (msg: string) => {
    if (activeConversationId) return activeConversationId;
    if (!user) return null;
    return new Promise<string | null>((resolve) => {
      createConversation.mutate(
        { documentId: selectedDocId || undefined, title: msg.substring(0, 60) || 'New Chat' },
        {
          onSuccess: (conv) => {
            setActiveConversationId(conv.id);
            resolve(conv.id);
          },
          onError: () => resolve(null),
        }
      );
    });
  }, [activeConversationId, user, selectedDocId, createConversation]);

  const handleSmartSend = useCallback(async () => {
    if (!question.trim() || isStreaming || !user) return;
    const msg = question;
    const convId = await ensureConversation(msg);
    if (convId) {
      setTimeout(() => handleSendMessage(msg, convId), 100);
    }
  }, [question, isStreaming, user, ensureConversation, handleSendMessage]);

  return (
    <div
      className="flex h-[calc(100vh-240px)] rounded-2xl border border-primary/10 overflow-hidden bg-gradient-to-br from-primary/[0.02] via-card/30 to-secondary/[0.03] backdrop-blur-sm shadow-xl shadow-primary/[0.06] relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary/40 rounded-2xl flex items-center justify-center backdrop-blur-sm"
          >
            <div className="text-center">
              <FileUp className="h-10 w-10 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-primary">Drop files to attach</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, CSV, images (max 20MB)</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.csv,.md,.rtf,.xlsx,.xls,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* ===== LEFT SIDEBAR: Conversations ===== */}
      <AnimatePresence>
        {leftSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r border-primary/10 bg-gradient-to-b from-card/90 via-card/60 to-primary/[0.03] backdrop-blur-md flex flex-col overflow-hidden"
          >
            {/* New Chat Button */}
            <div className="p-3 border-b border-border/20">
              <Button onClick={handleStartChat} disabled={createConversation.isPending || !user} className="w-full gap-2 rounded-xl h-10 text-xs shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-primary-dark hover:from-primary/90 hover:to-primary-dark/90" size="sm">
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

            {/* Document Context — Multi-select */}
            <div className="px-3 pb-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Context Documents</p>
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
              {/* Additional document chips */}
              {selectedDocIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectedDocIds.map(id => {
                    const doc = documents?.find(d => d.id === id);
                    return doc ? (
                      <Badge key={id} variant="secondary" className="text-[8px] gap-1 pr-0.5">
                        <FileText className="h-2 w-2" />
                        <span className="truncate max-w-[80px]">{doc.title}</span>
                        <button onClick={() => setSelectedDocIds(prev => prev.filter(i => i !== id))} className="ml-0.5 p-0.5 rounded hover:bg-muted">
                          <X className="h-2 w-2" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
              {selectedDocIds.length > 0 && documents && documents.length > selectedDocIds.length && (
                <button
                  className="text-[9px] text-primary/60 hover:text-primary mt-1 flex items-center gap-1"
                  onClick={() => {
                    const nextDoc = documents.find(d => !selectedDocIds.includes(d.id));
                    if (nextDoc) setSelectedDocIds(prev => [...prev, nextDoc.id]);
                  }}
                >
                  <Plus className="h-2.5 w-2.5" /> Add another document
                </button>
              )}
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
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setShowShortcutsDialog(true)} className="h-7 w-7 p-0">
                        <Keyboard className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">Keyboard shortcuts</TooltipContent>
                  </Tooltip>
                  <Button variant="ghost" size="sm" onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className="h-7 px-2 text-[10px] gap-1">
                    <Settings2 className="h-3 w-3" /> Settings
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MAIN CHAT AREA ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-13 border-b border-primary/10 flex items-center justify-between px-4 bg-gradient-to-r from-primary/[0.04] via-card/50 to-secondary/[0.04] backdrop-blur-sm">
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
              <p className="text-sm font-semibold truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {activeConv?.title || 'NuruAI Civic Chat'}
              </p>
              {activeConversationId && (
                <p className="text-[10px] text-muted-foreground/50">{messageCount} messages</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {selectedDocIds.length > 0 && (
              <Badge variant="outline" className="text-[9px] gap-1 font-normal max-w-[160px] truncate hidden sm:flex">
                <FileText className="h-2.5 w-2.5 shrink-0" />
                {selectedDocIds.length === 1 ? selectedDoc?.title : `${selectedDocIds.length} documents`}
              </Badge>
            )}
            <Badge className="text-[9px] gap-1 font-semibold hidden sm:flex bg-primary text-primary-foreground border-primary/50" variant="outline">
              <Sparkles className="h-2.5 w-2.5 text-gold" />
              {MODELS.find(m => m.value === settings.model)?.label || 'Gemini Pro'}
            </Badge>
            {activeConversationId && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleShareConversation}>
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Share conversation</TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setShowExportDialog(true)} className="text-xs gap-2">
                      <Download className="h-3.5 w-3.5" /> Export conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShareConversation} className="text-xs gap-2">
                      <Share2 className="h-3.5 w-3.5" /> Share conversation
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
              </>
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
              <WelcomeScreen
                setQuestion={setQuestion}
                user={user}
                onNewChat={handleStartChat}
                documents={documents}
                selectedDocId={selectedDocId}
                onQuickAction={(action) => {
                  if (!user) return;
                  setQuestion(action.prompt);
                }}
              />
            ) : (
              <div className="space-y-1">
                {/* Quick Actions Bar (when document is attached) */}
                {hasDocContext && chatMessages && chatMessages.length === 0 && (
                  <div className="mb-6 p-4 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.04] to-secondary/[0.03]">
                    <p className="text-xs font-medium text-foreground/70 mb-3 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-gold" /> Quick Actions
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {QUICK_ACTIONS.map(action => (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action)}
                          disabled={isStreaming}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-primary/10 hover:border-primary/30 bg-card/40 hover:bg-gradient-to-br hover:from-primary/10 hover:to-transparent transition-all text-center group disabled:opacity-40 shadow-sm hover:shadow-md"
                        >
                          <action.icon className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
                          <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {chatMessages?.map((msg, idx) => (
                  <ChatMessage
                    key={msg.id}
                    msg={msg}
                    onCopy={handleCopy}
                    copiedId={copiedId}
                    compact={settings.compactMode}
                    showTimestamps={settings.showTimestamps}
                    showConfidence={settings.showConfidence}
                    markdownEnabled={settings.markdownEnabled}
                    isLastAssistant={msg.role === 'assistant' && (!chatMessages[idx + 1] || chatMessages[idx + 1]?.role !== 'assistant')}
                    onFollowUpClick={handleFollowUpClick}
                    onRegenerate={handleRegenerate}
                    isStreaming={isStreaming}
                    feedback={feedbackGiven[msg.id]}
                    onFeedback={(type) => {
                      setFeedbackGiven(prev => ({ ...prev, [msg.id]: type }));
                      if (type === 'up') {
                        toast.success('Thanks for the positive feedback!');
                      } else {
                        setFeedbackDialogMsg(msg);
                        setFeedbackDescription('');
                        setFeedbackType('inaccurate');
                        setFeedbackSeverity('medium');
                      }
                    }}
                    isEditing={editingMessageId === msg.id}
                    editContent={editMessageContent}
                    onStartEdit={() => handleEditMessage(msg)}
                    onEditChange={setEditMessageContent}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={() => setEditingMessageId(null)}
                  />
                ))}

                {isStreaming && streamingContent && (
                  <div className={`flex gap-3 ${settings.compactMode ? 'py-2' : 'py-4'}`}>
                    <div className="shrink-0 mt-1">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/30 to-gold/10 border border-primary/20 flex items-center justify-center animate-pulse shadow-sm shadow-primary/20">
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStopGeneration}
                          className="h-6 text-[10px] gap-1 px-2 rounded-md border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                          <Square className="h-2.5 w-2.5 fill-current" /> Stop
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {isStreaming && !streamingContent && (
                  <div className="flex gap-3 py-4">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center shrink-0">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground py-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs">Analyzing...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStopGeneration}
                        className="h-6 text-[10px] gap-1 px-2 rounded-md border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <Square className="h-2.5 w-2.5 fill-current" /> Stop
                      </Button>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Attachment Preview */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/30 bg-muted/10 px-4 py-2"
            >
              <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border/30 bg-background/60 text-xs group">
                    {att.previewUrl ? (
                      <img src={att.previewUrl} alt={att.name} className="h-6 w-6 rounded object-cover" />
                    ) : (
                      <File className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate max-w-[120px] text-muted-foreground">{att.name}</span>
                    <span className="text-[9px] text-muted-foreground/50">
                      {att.extractedText ? `${(att.extractedText.length / 1000).toFixed(1)}k chars` : att.type.startsWith('image/') ? 'image' : 'binary'}
                    </span>
                    <button onClick={() => removeAttachment(i)} className="opacity-50 group-hover:opacity-100 transition-opacity">
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
                {isExtractingText && (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Extracting text...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="border-t border-border/20 p-4 bg-gradient-to-t from-card/40 to-transparent backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 rounded-2xl border border-border/30 bg-background/70 backdrop-blur-md p-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all">
              {/* Attach button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isStreaming}
                    className="shrink-0 p-2 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Attach files (PDF, DOCX, images...)</TooltipContent>
              </Tooltip>

              <textarea
                ref={textareaRef}
                placeholder={activeConversationId ? "Ask about policies, budgets, legislation..." : "Type your question — a conversation will be created automatically..."}
                rows={1}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!activeConversationId && user && question.trim()) {
                      handleSmartSend();
                      return;
                    }
                    handleSend();
                  }
                }}
                disabled={isStreaming || !user}
                className="flex-1 resize-none bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground/40 py-2 px-1 max-h-40 disabled:opacity-40"
              />

              {/* Voice input */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleVoiceInput}
                    disabled={isStreaming}
                    className={`shrink-0 p-2 rounded-lg transition-colors disabled:opacity-30 ${
                      isListening
                        ? 'bg-destructive/10 text-destructive animate-pulse'
                        : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">{isListening ? 'Stop listening' : 'Voice input'}</TooltipContent>
              </Tooltip>

              {/* Send / Stop button */}
              {isStreaming ? (
                <Button
                  onClick={handleStopGeneration}
                  size="icon"
                  variant="destructive"
                  className="shrink-0 h-8 w-8 rounded-lg"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (!activeConversationId && user && question.trim()) {
                      handleSmartSend();
                      return;
                    }
                    handleSend();
                  }}
                  disabled={!question.trim() || !user}
                  size="icon"
                  className="shrink-0 h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary-dark hover:from-primary/90 hover:to-primary-dark/90 shadow-md shadow-primary/20 disabled:shadow-none transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
              <p className="text-[9px] text-muted-foreground/30">
                NuruAI grounds answers in source documents · Enter to send · Shift+Enter for new line · Esc to stop
              </p>
              <div className="flex items-center gap-2">
                {attachments.length > 0 && (
                  <span className="text-[9px] text-primary/60">{attachments.length} file{attachments.length > 1 ? 's' : ''} attached</span>
                )}
              </div>
            </div>
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
            className="border-l border-border/20 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-md flex flex-col overflow-hidden"
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
                    <Zap className="h-3.5 w-3.5 text-yellow-500" /> Response
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
                    <Globe className="h-3.5 w-3.5 text-blue-500" /> Display
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

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcutsDialog} onOpenChange={setShowShortcutsDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><Keyboard className="h-4 w-4" /> Keyboard Shortcuts</DialogTitle>
            <DialogDescription>Quick actions for NuruAI Chat</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {[
              { keys: 'Enter', desc: 'Send message' },
              { keys: 'Shift + Enter', desc: 'New line' },
              { keys: 'Escape', desc: 'Stop generation' },
              { keys: 'Ctrl/⌘ + Shift + N', desc: 'New conversation' },
              { keys: 'Ctrl/⌘ + Shift + S', desc: 'Toggle sidebar' },
              { keys: 'Ctrl/⌘ + ?', desc: 'Show shortcuts' },
            ].map(s => (
              <div key={s.keys} className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">{s.desc}</span>
                <kbd className="px-2 py-0.5 rounded border border-border/50 bg-muted/30 text-[10px] font-mono text-foreground/70">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Feedback Dialog */}
      <Dialog open={!!feedbackDialogMsg} onOpenChange={() => setFeedbackDialogMsg(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-sm">Flag AI Response</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Help us improve NuruAI by describing the issue with this response.</p>
            {feedbackDialogMsg?.content && (
              <div className="p-2 rounded-lg bg-muted/30 text-[11px] text-muted-foreground/70 italic border-l-2 border-primary/20 max-h-24 overflow-auto">
                "{feedbackDialogMsg.content.substring(0, 200)}..."
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Issue Type</label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inaccurate">Inaccurate Information</SelectItem>
                  <SelectItem value="hallucination">Hallucination (made up facts)</SelectItem>
                  <SelectItem value="bias">Biased Response</SelectItem>
                  <SelectItem value="outdated">Outdated Information</SelectItem>
                  <SelectItem value="offensive">Offensive Content</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Severity</label>
              <Select value={feedbackSeverity} onValueChange={setFeedbackSeverity}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — Minor issue</SelectItem>
                  <SelectItem value="medium">Medium — Noticeable problem</SelectItem>
                  <SelectItem value="high">High — Significantly misleading</SelectItem>
                  <SelectItem value="critical">Critical — Dangerous misinformation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
              <Textarea className="text-xs" placeholder="Describe what was wrong with this response..." value={feedbackDescription} onChange={e => setFeedbackDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setFeedbackDialogMsg(null)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={async () => {
              try {
                await submitAIFeedback.mutateAsync({
                  message_id: feedbackDialogMsg?.id,
                  conversation_id: activeConversationId || undefined,
                  feedback_type: feedbackType,
                  severity: feedbackSeverity,
                  description: feedbackDescription || undefined,
                  ai_response_snippet: feedbackDialogMsg?.content?.substring(0, 500),
                });
                toast.success('Thank you — your feedback has been submitted for review');
                setFeedbackDialogMsg(null);
              } catch {
                toast.error('Failed to submit feedback');
              }
            }}>Submit Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Conversation Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" /> Export Conversation
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              Download this conversation in your preferred format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Export Format</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="h-9 text-xs mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf" className="text-xs">📄 PDF — Professional formatted report</SelectItem>
                  <SelectItem value="word" className="text-xs">📝 Word (.doc) — Editable document</SelectItem>
                  <SelectItem value="markdown" className="text-xs">📋 Markdown — Plain text with formatting</SelectItem>
                  <SelectItem value="json" className="text-xs">🔧 JSON — Structured data with metadata</SelectItem>
                  <SelectItem value="csv" className="text-xs">📊 CSV — Spreadsheet-compatible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/10">
              <p className="text-[10px] text-muted-foreground">
                {exportFormat === 'pdf' && 'Generates a branded PDF with speaker columns, timestamps, and PeaceVerse headers.'}
                {exportFormat === 'word' && 'Creates a styled Word document with formatted Q&A pairs for institutional sharing.'}
                {exportFormat === 'markdown' && 'Clean markdown with headers per speaker — ideal for documentation.'}
                {exportFormat === 'json' && 'Full JSON export including metadata, model info, and processing times.'}
                {exportFormat === 'csv' && 'Tabular format with Role, Content, Timestamp, and Model columns.'}
              </p>
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <MessageSquareText className="h-3 w-3" /> {chatMessages?.length || 0} messages will be exported
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowExportDialog(false)}>Cancel</Button>
            <Button size="sm" className="text-xs gap-1.5" onClick={() => handleExportConversation()}>
              <Download className="h-3 w-3" /> Download {exportFormat.toUpperCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all pr-8 ${
          isActive
            ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary border border-primary/25 shadow-sm shadow-primary/10'
            : 'hover:bg-primary/[0.04] text-muted-foreground hover:text-foreground border border-transparent'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {isPinned && <Pin className="h-2.5 w-2.5 text-yellow-500 shrink-0" />}
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

// ===== Follow-Up Question Extractor =====
function extractFollowUpQuestions(content: string): string[] {
  const questions: string[] = [];
  const sectionMatch = content.match(/#{1,3}\s*🔍.*?(?=\n#{1,3}\s[^🔍]|$)/s) 
    || content.match(/#{1,3}\s*Strategic Questions.*?(?=\n#{1,3}\s|$)/si)
    || content.match(/#{1,3}\s*Follow[\s-]?[Uu]p.*?(?=\n#{1,3}\s|$)/si);
  
  if (sectionMatch) {
    const section = sectionMatch[0];
    const lines = section.split('\n');
    for (const line of lines) {
      const cleaned = line.replace(/^[\s\-*\d.)+]+/, '').replace(/\*\*/g, '').replace(/"/g, '').trim();
      if (cleaned.endsWith('?') && cleaned.length > 15 && cleaned.length < 300) {
        questions.push(cleaned);
      }
    }
  }
  
  if (questions.length === 0) {
    const lastThird = content.slice(Math.floor(content.length * 0.6));
    const qMatches = lastThird.match(/(?:\*\*|"|")([^*""\n]{20,200}\?)(?:\*\*|"|")/g);
    if (qMatches) {
      for (const m of qMatches.slice(0, 6)) {
        questions.push(m.replace(/\*\*/g, '').replace(/[""]/g, '').trim());
      }
    }
  }
  
  return questions.slice(0, 6);
}

// ===== Chat Message =====
const ChatMessage = ({ msg, onCopy, copiedId, compact, showTimestamps, showConfidence, markdownEnabled, isLastAssistant, onFollowUpClick, onRegenerate, isStreaming, feedback, onFeedback, isEditing, editContent, onStartEdit, onEditChange, onSaveEdit, onCancelEdit }: {
  msg: any; onCopy: (c: string, id: string) => void; copiedId: string | null;
  compact: boolean; showTimestamps: boolean; showConfidence: boolean; markdownEnabled: boolean;
  isLastAssistant?: boolean; onFollowUpClick?: (q: string) => void; onRegenerate?: () => void;
  isStreaming?: boolean; feedback?: 'up' | 'down'; onFeedback?: (type: 'up' | 'down') => void;
  isEditing?: boolean; editContent?: string; onStartEdit?: () => void; onEditChange?: (v: string) => void;
  onSaveEdit?: () => void; onCancelEdit?: () => void;
}) => {
  const isUser = msg.role === 'user';
  const followUps = !isUser && isLastAssistant ? extractFollowUpQuestions(msg.content) : [];

  const renderContent = msg.content;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3.5 ${compact ? 'py-2.5' : 'py-5'} ${isUser ? '' : 'bg-gradient-to-r from-primary/[0.03] via-transparent to-secondary/[0.02] -mx-4 px-4 rounded-xl border border-primary/[0.08]'}`}
    >
      <div className="shrink-0 mt-1">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
          isUser 
            ? 'bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20' 
            : 'bg-gradient-to-br from-primary/25 to-gold/10 border border-primary/20 shadow-primary/10'
        }`}>
          {isUser ? <User className="h-3.5 w-3.5 text-secondary-foreground" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[11px] font-semibold ${isUser ? 'text-foreground/70' : 'text-primary'}`}>{isUser ? 'You' : 'NuruAI'}</span>
          {showTimestamps && <span className="text-[10px] text-muted-foreground/40">{format(new Date(msg.created_at), 'HH:mm')}</span>}
          {msg.processing_time_ms && showTimestamps && (
            <span className="text-[10px] text-muted-foreground/30">{(msg.processing_time_ms / 1000).toFixed(1)}s</span>
          )}
        </div>

        {/* Editable user message */}
        {isUser && isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent || ''}
              onChange={(e) => onEditChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSaveEdit?.(); }
                if (e.key === 'Escape') onCancelEdit?.();
              }}
              className="w-full text-sm p-2 rounded-lg border border-primary/30 bg-background/80 outline-none resize-none min-h-[60px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onSaveEdit} className="h-7 text-xs gap-1">
                <Send className="h-3 w-3" /> Send edited
              </Button>
              <Button size="sm" variant="outline" onClick={onCancelEdit} className="h-7 text-xs">Cancel</Button>
            </div>
          </div>
        ) : isUser ? (
          <div className="group/msg">
            <p className="text-sm leading-relaxed text-foreground">{renderContent}</p>
            {!isStreaming && (
              <button
                onClick={onStartEdit}
                className="opacity-0 group-hover/msg:opacity-100 transition-opacity mt-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground flex items-center gap-1"
              >
                <Pencil className="h-2.5 w-2.5" /> Edit
              </button>
            )}
          </div>
        ) : markdownEnabled ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&>*:first-child]:mt-0 [&_h2]:text-base [&_h2]:text-primary/80 [&_h3]:text-sm [&_h3]:text-foreground/80 [&_p]:text-sm [&_li]:text-sm [&_blockquote]:border-l-primary/40 [&_blockquote]:bg-primary/[0.04] [&_blockquote]:rounded-r-lg [&_blockquote]:py-1 [&_code]:bg-primary/10 [&_code]:text-primary [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_strong]:text-foreground">
            <ReactMarkdown>{renderContent}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{renderContent}</p>
        )}

        {/* Action bar for AI messages */}
        {!isUser && (
          <div className="flex flex-wrap items-center gap-1 mt-3 pt-2 border-t border-primary/10">
            <button
              onClick={() => onCopy(msg.content, msg.id)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/30"
            >
              {copiedId === msg.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              {copiedId === msg.id ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={() => onFeedback?.('up')}
              className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-colors ${
                feedback === 'up' ? 'text-green-500 bg-green-500/10' : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/30'
              }`}
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => onFeedback?.('down')}
              className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-colors ${
                feedback === 'down' ? 'text-destructive bg-destructive/10' : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/30'
              }`}
            >
              <ThumbsDown className="h-3 w-3" />
            </button>

            {isLastAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isStreaming}
                className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/30 disabled:opacity-30"
              >
                <RefreshCw className="h-3 w-3" /> Regenerate
              </button>
            )}

            {showConfidence && msg.confidence != null && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ml-auto ${
                msg.confidence >= 0.8 ? 'bg-green-500/10 text-green-500' : msg.confidence >= 0.5 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-destructive/10 text-destructive'
              }`}>
                {Math.round(msg.confidence * 100)}% confidence
              </span>
            )}
          </div>
        )}

        {/* Follow-up question chips */}
        {!isUser && isLastAssistant && followUps.length > 0 && !isStreaming && (
          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground/60 flex items-center gap-1">
              <MessageCircleQuestion className="h-3 w-3" /> Follow-up questions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {followUps.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onFollowUpClick?.(q)}
                  className="group text-left text-[11px] px-3 py-1.5 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.04] to-transparent hover:border-primary/30 hover:from-primary/10 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 max-w-full shadow-sm hover:shadow-md"
                >
                  <ArrowRight className="h-3 w-3 text-primary/40 group-hover:text-primary shrink-0 transition-colors" />
                  <span className="truncate">{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ===== Welcome Screen =====
const WelcomeScreen = ({ setQuestion, user, onNewChat, documents, selectedDocId, onQuickAction }: {
  setQuestion: (q: string) => void; user: any; onNewChat: () => void;
  documents?: any[]; selectedDocId?: string; onQuickAction?: (action: typeof QUICK_ACTIONS[0]) => void;
}) => {
  const selectedDoc = documents?.find(d => d.id === selectedDocId);
  const recentDocs = documents?.slice(0, 3);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <motion.div 
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-gold/10 blur-3xl rounded-full scale-[2.5]" />
        <div className="absolute inset-0 bg-gold/10 blur-2xl rounded-full scale-150 animate-pulse" />
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-primary/25 via-primary/15 to-gold/10 border border-primary/20 shadow-2xl shadow-primary/15">
          <Brain className="h-12 w-12 text-primary drop-shadow-lg" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-gold to-gold/60 border-2 border-card animate-pulse shadow-md shadow-gold/30" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent mb-2 tracking-tight">NuruAI Civic Intelligence</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-1.5 leading-relaxed">
          Ask questions about African policy documents. Get evidence-grounded answers with source citations.
        </p>
        <p className="text-xs text-muted-foreground/40 mb-8">
          Just type your question below — a conversation will be created automatically.
        </p>
      </motion.div>

      {/* Document-aware quick actions */}
      {selectedDoc && (
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="w-full max-w-lg mb-8"
        >
          <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center justify-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Quick actions for "{selectedDoc.title}"
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.id}
                onClick={() => onQuickAction?.(action)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-primary/15 hover:border-primary/30 bg-gradient-to-br from-card/60 to-primary/[0.03] hover:from-primary/10 hover:to-primary/[0.05] hover:shadow-lg hover:shadow-primary/10 transition-all text-center group"
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <action.icon className="h-5 w-5 text-primary/70 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Suggested prompts */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid gap-3 sm:grid-cols-2 w-full max-w-lg"
      >
        {(selectedDoc ? [
          { q: `What are the key financial allocations in "${selectedDoc.title}"?`, icon: '💰' },
          { q: `How does "${selectedDoc.title}" impact ordinary citizens?`, icon: '👥' },
          { q: `What accountability mechanisms are in "${selectedDoc.title}"?`, icon: '⚖️' },
          { q: `What are the implementation risks in "${selectedDoc.title}"?`, icon: '⚠️' },
        ] : [
          { q: 'What does this budget allocate to healthcare?', icon: '🏥' },
          { q: 'How will this policy affect education?', icon: '📚' },
          { q: 'What environmental targets are set?', icon: '🌍' },
          { q: 'What accountability measures exist?', icon: '⚖️' },
        ]).map((item, i) => (
          <motion.button
            key={i}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 + i * 0.05 }}
            onClick={() => setQuestion(item.q)}
            className="text-left p-4 rounded-xl border border-primary/10 hover:border-primary/25 bg-gradient-to-br from-card/50 to-primary/[0.02] hover:from-primary/[0.06] hover:to-primary/[0.02] hover:shadow-lg hover:shadow-primary/10 transition-all text-xs group backdrop-blur-sm"
          >
            <span className="text-base mb-2 block">{item.icon}</span>
            <span className="text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">{item.q}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Recent documents hint */}
      {!selectedDoc && recentDocs && recentDocs.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 w-full max-w-lg"
        >
          <p className="text-[10px] text-muted-foreground/40 mb-2">Recent documents available for analysis:</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {recentDocs.map(d => (
              <Badge key={d.id} variant="outline" className="text-[10px] font-normal cursor-default hover:border-primary/30 transition-colors">
                <FileText className="h-2.5 w-2.5 mr-1" />{d.title.substring(0, 30)}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Feature hints */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-10 flex flex-wrap justify-center gap-4 text-[10px] text-muted-foreground/40"
      >
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/20 bg-card/30"><Paperclip className="h-3 w-3 text-primary/40" /> Attach files</span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/20 bg-card/30"><Mic className="h-3 w-3 text-primary/40" /> Voice input</span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/20 bg-card/30"><Share2 className="h-3 w-3 text-primary/40" /> Share chats</span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/20 bg-card/30"><Keyboard className="h-3 w-3 text-primary/40" /> Shortcuts</span>
      </motion.div>

      {!user && (
        <p className="text-xs text-muted-foreground mt-8 flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-transparent shadow-sm">
          <AlertCircle className="h-3.5 w-3.5 text-primary" />Sign in to start a conversation
        </p>
      )}
    </div>
  );
};

export default NuruQuestionInterface;
