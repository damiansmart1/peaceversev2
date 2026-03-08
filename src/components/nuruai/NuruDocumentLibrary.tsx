import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Upload, Eye, MessageSquare, Calendar, Search, Filter, Loader2, BookOpen, 
  FileUp, File, FileSpreadsheet, AlertCircle, CheckCircle, Clock, Globe
} from 'lucide-react';
import { useCivicDocuments, useUploadDocument, useUploadDocumentFile } from '@/hooks/useNuruAI';
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

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  completed: { icon: CheckCircle, color: 'text-green-500', label: 'Ready' },
  processing: { icon: Loader2, color: 'text-yellow-500', label: 'Processing' },
  pending: { icon: Clock, color: 'text-muted-foreground', label: 'Pending' },
  upload_failed: { icon: AlertCircle, color: 'text-red-500', label: 'Failed' },
  text_extraction_failed: { icon: AlertCircle, color: 'text-orange-500', label: 'Needs Text' },
};

const NuruDocumentLibrary = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('file');
  const [newDoc, setNewDoc] = useState({ title: '', description: '', document_type: 'policy', original_text: '', country: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { data: documents, isLoading } = useCivicDocuments(typeFilter);
  const uploadDoc = useUploadDocument();
  const uploadFileDoc = useUploadDocumentFile();
  const { user } = useAuth();

  const filtered = documents?.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.topics?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
    d.country?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleUploadText = () => {
    if (!newDoc.title || !newDoc.original_text) return;
    uploadDoc.mutate(newDoc, {
      onSuccess: () => {
        setUploadOpen(false);
        setNewDoc({ title: '', description: '', document_type: 'policy', original_text: '', country: '' });
      },
    });
  };

  const handleUploadFile = () => {
    if (!selectedFile || !newDoc.title) return;
    uploadFileDoc.mutate({
      file: selectedFile,
      title: newDoc.title,
      description: newDoc.description,
      documentType: newDoc.document_type,
      country: newDoc.country || undefined,
    }, {
      onSuccess: () => {
        setUploadOpen(false);
        setNewDoc({ title: '', description: '', document_type: 'policy', original_text: '', country: '' });
        setSelectedFile(null);
      },
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!newDoc.title) {
        setNewDoc(prev => ({ ...prev, title: file.name.replace(/\.[^.]+$/, '') }));
      }
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documents, topics, countries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {user && (
              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Upload className="h-4 w-4" />Upload Document</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Upload Public Document</DialogTitle></DialogHeader>
                  
                  <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as 'text' | 'file')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="file" className="gap-2"><FileUp className="h-4 w-4" />Upload File</TabsTrigger>
                      <TabsTrigger value="text" className="gap-2"><FileText className="h-4 w-4" />Paste Text</TabsTrigger>
                    </TabsList>

                    <div className="space-y-4 mt-4">
                      <Input placeholder="Document title *" value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} />
                      <Input placeholder="Description" value={newDoc.description} onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })} />
                      <div className="flex gap-3">
                        <Select value={newDoc.document_type} onValueChange={(v) => setNewDoc({ ...newDoc, document_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {DOC_TYPES.filter(t => t.value !== 'all').map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input placeholder="Country" value={newDoc.country} onChange={(e) => setNewDoc({ ...newDoc, country: e.target.value })} />
                      </div>

                      <TabsContent value="file" className="mt-0">
                        <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/30 transition-colors">
                          <input
                            type="file"
                            accept={FILE_ACCEPT}
                            onChange={handleFileSelect}
                            className="hidden"
                            id="doc-file-upload"
                          />
                          <label htmlFor="doc-file-upload" className="cursor-pointer">
                            {selectedFile ? (
                              <div className="space-y-2">
                                <File className="h-10 w-10 mx-auto text-primary" />
                                <p className="text-sm font-medium">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                                <Badge variant="secondary" className="text-xs">{selectedFile.type || 'Unknown type'}</Badge>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <FileUp className="h-10 w-10 mx-auto text-muted-foreground" />
                                <p className="text-sm font-medium">Click to upload or drag & drop</p>
                                <p className="text-xs text-muted-foreground">PDF, Word, TXT, CSV, Excel (max 50MB)</p>
                              </div>
                            )}
                          </label>
                        </div>
                        <Button 
                          onClick={handleUploadFile} 
                          disabled={uploadFileDoc.isPending || !selectedFile || !newDoc.title} 
                          className="w-full gap-2 mt-4"
                        >
                          {uploadFileDoc.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {uploadFileDoc.isPending ? 'Processing...' : 'Upload & Analyze'}
                        </Button>
                      </TabsContent>

                      <TabsContent value="text" className="mt-0">
                        <Textarea 
                          placeholder="Paste the document text content here..." 
                          rows={8} 
                          value={newDoc.original_text} 
                          onChange={(e) => setNewDoc({ ...newDoc, original_text: e.target.value })} 
                        />
                        <Button 
                          onClick={handleUploadText} 
                          disabled={uploadDoc.isPending || !newDoc.title || !newDoc.original_text} 
                          className="w-full gap-2 mt-4"
                        >
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
        </CardContent>
      </Card>

      {/* Stats Bar */}
      {documents && documents.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Documents', value: documents.length, icon: FileText },
            { label: 'Total Questions', value: documents.reduce((s, d) => s + (d.question_count || 0), 0), icon: MessageSquare },
            { label: 'Total Views', value: documents.reduce((s, d) => s + (d.view_count || 0), 0), icon: Eye },
            { label: 'Countries', value: new Set(documents.map(d => d.country).filter(Boolean)).size, icon: Globe },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <div className="p-3 rounded-xl border border-border/50 bg-card/60">
                <stat.icon className="h-4 w-4 text-primary mb-1" />
                <p className="text-lg font-bold">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Document Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/50 bg-card/80">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No documents found</h3>
            <p className="text-muted-foreground mt-1">Upload a public document to get started with NuruAI analysis.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc, i) => {
            const procStatus = statusConfig[doc.processing_status || 'completed'] || statusConfig.completed;
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:border-primary/30 transition-all h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-xs capitalize">{doc.document_type}</Badge>
                        {doc.file_type && (
                          <Badge variant="secondary" className="text-[10px]">
                            {doc.file_type === 'application/pdf' ? 'PDF' : doc.file_type.split('/').pop()?.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      {doc.country && <Badge variant="secondary" className="text-xs">{doc.country}</Badge>}
                    </div>
                    <CardTitle className="text-base mt-2 line-clamp-2">{doc.title}</CardTitle>
                    {doc.summary && <CardDescription className="line-clamp-3 text-xs mt-1">{doc.summary}</CardDescription>}
                  </CardHeader>
                  <CardContent className="pt-0 mt-auto">
                    {doc.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {doc.topics.slice(0, 4).map((t, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">{t}</Badge>
                        ))}
                        {doc.topics.length > 4 && (
                          <Badge variant="outline" className="text-xs">+{doc.topics.length - 4}</Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{doc.view_count?.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{doc.question_count}</span>
                        {doc.file_size_bytes && (
                          <span className="text-[10px]">{formatFileSize(doc.file_size_bytes)}</span>
                        )}
                      </div>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function formatFileSize(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default NuruDocumentLibrary;
