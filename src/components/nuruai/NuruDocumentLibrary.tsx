import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Upload, Eye, MessageSquare, Search, Filter, Loader2, BookOpen, 
  FileUp, File, Globe, CheckCircle, Clock, Bookmark, BookmarkCheck, BarChart3
} from 'lucide-react';
import { useCivicDocuments, useUploadDocument, useUploadDocumentFile, useToggleBookmark, useDocumentBookmarks } from '@/hooks/useNuruAI';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const DOC_TYPES = [
  { value: 'all', label: 'All Documents' },
  { value: 'budget', label: 'Government Budgets' },
  { value: 'legislation', label: 'Legislative Bills' },
  { value: 'policy', label: 'Policy Drafts' },
  { value: 'regulation', label: 'Regulatory Documents' },
  { value: 'report', label: 'Public Reports' },
  { value: 'consultation', label: 'Consultation Documents' },
];

const FILE_ACCEPT = '.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx';

const typeColors: Record<string, string> = {
  budget: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  legislation: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  policy: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  regulation: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  report: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  consultation: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

const NuruDocumentLibrary = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('file');
  const [newDoc, setNewDoc] = useState({ title: '', description: '', document_type: 'policy', original_text: '', country: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { data: documents, isLoading } = useCivicDocuments(typeFilter);
  const { data: bookmarks } = useDocumentBookmarks();
  const uploadDoc = useUploadDocument();
  const uploadFileDoc = useUploadDocumentFile();
  const toggleBookmark = useToggleBookmark();
  const { user } = useAuth();

  const bookmarkedIds = new Set(bookmarks?.map((b: any) => b.document_id) || []);

  const filtered = documents?.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.topics?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
    d.country?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleUploadText = () => {
    if (!newDoc.title || !newDoc.original_text) return;
    uploadDoc.mutate(newDoc, { onSuccess: () => { setUploadOpen(false); resetForm(); } });
  };

  const handleUploadFile = () => {
    if (!selectedFile || !newDoc.title) return;
    uploadFileDoc.mutate({
      file: selectedFile, title: newDoc.title, description: newDoc.description,
      documentType: newDoc.document_type, country: newDoc.country || undefined,
    }, { onSuccess: () => { setUploadOpen(false); resetForm(); } });
  };

  const resetForm = () => {
    setNewDoc({ title: '', description: '', document_type: 'policy', original_text: '', country: '' });
    setSelectedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!newDoc.title) setNewDoc(prev => ({ ...prev, title: file.name.replace(/\.[^.]+$/, '') }));
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents, topics, countries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 rounded-xl h-10 bg-card/60 border-border/40" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-44 rounded-xl h-10 bg-card/60 border-border/40">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue />
          </SelectTrigger>
          <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
        {user && (
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl h-10"><Upload className="h-4 w-4" />Upload</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl">
              <DialogHeader><DialogTitle className="text-lg">Upload Public Document</DialogTitle></DialogHeader>
              <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as 'text' | 'file')}>
                <TabsList className="grid w-full grid-cols-2 rounded-xl">
                  <TabsTrigger value="file" className="gap-2 rounded-lg"><FileUp className="h-4 w-4" />Upload File</TabsTrigger>
                  <TabsTrigger value="text" className="gap-2 rounded-lg"><FileText className="h-4 w-4" />Paste Text</TabsTrigger>
                </TabsList>
                <div className="space-y-3 mt-4">
                  <Input placeholder="Document title *" value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} className="rounded-xl" />
                  <Input placeholder="Description" value={newDoc.description} onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })} className="rounded-xl" />
                  <div className="flex gap-3">
                    <Select value={newDoc.document_type} onValueChange={(v) => setNewDoc({ ...newDoc, document_type: v })}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>{DOC_TYPES.filter(t => t.value !== 'all').map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="Country" value={newDoc.country} onChange={(e) => setNewDoc({ ...newDoc, country: e.target.value })} className="rounded-xl" />
                  </div>
                  <TabsContent value="file" className="mt-0">
                    <div className="border-2 border-dashed border-border/40 rounded-2xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer" onClick={() => document.getElementById('doc-file-upload')?.click()}>
                      <input type="file" accept={FILE_ACCEPT} onChange={handleFileSelect} className="hidden" id="doc-file-upload" />
                      {selectedFile ? (
                        <div className="space-y-2"><File className="h-10 w-10 mx-auto text-primary" /><p className="text-sm font-medium">{selectedFile.name}</p><p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p></div>
                      ) : (
                        <div className="space-y-2"><FileUp className="h-10 w-10 mx-auto text-muted-foreground/40" /><p className="text-sm text-muted-foreground">Click to upload · PDF, Word, TXT, CSV, Excel</p></div>
                      )}
                    </div>
                    <Button onClick={handleUploadFile} disabled={uploadFileDoc.isPending || !selectedFile || !newDoc.title} className="w-full gap-2 mt-3 rounded-xl">
                      {uploadFileDoc.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadFileDoc.isPending ? 'Processing...' : 'Upload & Analyze'}
                    </Button>
                  </TabsContent>
                  <TabsContent value="text" className="mt-0">
                    <Textarea placeholder="Paste the document text content here..." rows={8} value={newDoc.original_text} onChange={(e) => setNewDoc({ ...newDoc, original_text: e.target.value })} className="rounded-xl" />
                    <Button onClick={handleUploadText} disabled={uploadDoc.isPending || !newDoc.title || !newDoc.original_text} className="w-full gap-2 mt-3 rounded-xl">
                      {uploadDoc.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadDoc.isPending ? 'Processing...' : 'Upload & Analyze'}
                    </Button>
                  </TabsContent>
                </div>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      {documents && documents.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Documents', value: documents.length, icon: FileText },
            { label: 'Questions', value: documents.reduce((s, d) => s + (d.question_count || 0), 0), icon: MessageSquare },
            { label: 'Views', value: documents.reduce((s, d) => s + (d.view_count || 0), 0), icon: Eye },
            { label: 'Countries', value: new Set(documents.map(d => d.country).filter(Boolean)).size, icon: Globe },
            { label: 'Bookmarked', value: bookmarkedIds.size, icon: BookmarkCheck },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="p-3 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm"
            >
              <stat.icon className="h-4 w-4 text-primary/70 mb-1" />
              <p className="text-lg font-bold text-foreground">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Document Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-14 w-14 text-muted-foreground/20 mb-4" />
          <h3 className="text-base font-semibold text-foreground">No documents found</h3>
          <p className="text-sm text-muted-foreground mt-1">Upload a public document to start NuruAI analysis.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc, i) => (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <div className="group p-4 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all h-full flex flex-col relative">
                {/* Bookmark button */}
                {user && (
                  <button
                    onClick={() => toggleBookmark.mutate({ documentId: doc.id })}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    {bookmarkedIds.has(doc.id) ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground" />
                    )}
                  </button>
                )}

                <div className="flex items-center gap-2 mb-3 pr-8">
                  <Badge variant="outline" className={`text-[10px] capitalize font-medium ${typeColors[doc.document_type] || ''}`}>{doc.document_type}</Badge>
                  {doc.country && <Badge variant="secondary" className="text-[10px] font-normal">{doc.country}</Badge>}
                  {doc.processing_status && doc.processing_status !== 'completed' && (
                    <Badge variant="outline" className="text-[10px] gap-1 text-amber-500">
                      <Clock className="h-2.5 w-2.5" />{doc.processing_status}
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">{doc.title}</h3>
                {doc.summary && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{doc.summary}</p>}
                {doc.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3 mt-auto">
                    {doc.topics.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary/70">{t}</span>
                    ))}
                    {doc.topics.length > 3 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{doc.topics.length - 3}</span>}
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/20">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{doc.view_count?.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{doc.question_count}</span>
                  </div>
                  <span>{format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NuruDocumentLibrary;
