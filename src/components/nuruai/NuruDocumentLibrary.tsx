import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Upload, Eye, MessageSquare, Search, Filter, Loader2, BookOpen, 
  FileUp, File, Globe, CheckCircle, Clock, Bookmark, BookmarkCheck, BarChart3,
  X, AlertCircle, Link2, Calendar, Languages, Building2, Tag, MapPin,
  Shield, Info, ChevronRight, Sparkles, FileCheck
} from 'lucide-react';
import { useCivicDocuments, useUploadDocument, useUploadDocumentFile, useToggleBookmark, useDocumentBookmarks } from '@/hooks/useNuruAI';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

const DOC_TYPES = [
  { value: 'all', label: 'All Documents' },
  { value: 'budget', label: 'Government Budgets' },
  { value: 'legislation', label: 'Legislative Bills & Acts' },
  { value: 'policy', label: 'Policy Drafts & Frameworks' },
  { value: 'regulation', label: 'Regulatory Documents' },
  { value: 'report', label: 'Public Reports & Audits' },
  { value: 'consultation', label: 'Public Consultation Papers' },
  { value: 'treaty', label: 'Treaties & Agreements' },
  { value: 'manifesto', label: 'Party Manifestos' },
  { value: 'judicial', label: 'Court Rulings & Judgments' },
  { value: 'procurement', label: 'Procurement Notices' },
];

const AFRICAN_COUNTRIES = [
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde',
  'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Côte d\'Ivoire',
  'DR Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia',
  'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia',
  'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco',
  'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'São Tomé and Príncipe',
  'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan',
  'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe',
];

const LANGUAGES = [
  { value: 'en', label: 'English' }, { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' }, { value: 'pt', label: 'Portuguese' },
  { value: 'sw', label: 'Swahili' }, { value: 'am', label: 'Amharic' },
  { value: 'ha', label: 'Hausa' }, { value: 'yo', label: 'Yoruba' },
  { value: 'ig', label: 'Igbo' }, { value: 'zu', label: 'Zulu' },
  { value: 'so', label: 'Somali' }, { value: 'rw', label: 'Kinyarwanda' },
];

const FILE_ACCEPT = '.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.rtf,.odt,.pptx';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_TEXT_LENGTH = 500000; // 500K chars

const typeColors: Record<string, string> = {
  budget: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  legislation: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  policy: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  regulation: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  report: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  consultation: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  treaty: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  manifesto: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  judicial: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  procurement: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
};

interface UploadFormData {
  title: string;
  description: string;
  document_type: string;
  original_text: string;
  country: string;
  region: string;
  source_url: string;
  publish_date: string;
  language: string;
  topics: string;
  institutions: string;
}

const INITIAL_FORM: UploadFormData = {
  title: '', description: '', document_type: 'policy', original_text: '',
  country: '', region: '', source_url: '', publish_date: '', language: 'en',
  topics: '', institutions: '',
};

const NuruDocumentLibrary = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('file');
  const [formData, setFormData] = useState<UploadFormData>(INITIAL_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStep, setUploadStep] = useState(1); // 1: details, 2: content, 3: metadata
  const [errors, setErrors] = useState<Partial<Record<keyof UploadFormData | 'file', string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents, isLoading } = useCivicDocuments(typeFilter);
  const { data: bookmarks } = useDocumentBookmarks();
  const uploadDoc = useUploadDocument();
  const uploadFileDoc = useUploadDocumentFile();
  const toggleBookmark = useToggleBookmark();
  const { user } = useAuth();

  const bookmarkedIds = new Set(bookmarks?.map((b: any) => b.document_id) || []);
  const isUploading = uploadDoc.isPending || uploadFileDoc.isPending;

  const filtered = documents?.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.topics?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
    d.country?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const updateField = (field: keyof UploadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateStep1 = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.title.trim()) newErrors.title = 'Document title is required';
    else if (formData.title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters';
    else if (formData.title.trim().length > 300) newErrors.title = 'Title must be under 300 characters';
    if (formData.description && formData.description.length > 2000) newErrors.description = 'Description must be under 2000 characters';
    if (formData.source_url && !/^https?:\/\/.+/.test(formData.source_url)) newErrors.source_url = 'Must be a valid URL starting with http:// or https://';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: typeof errors = {};
    if (uploadMode === 'text') {
      if (!formData.original_text.trim()) newErrors.original_text = 'Document text content is required';
      else if (formData.original_text.trim().length < 100) newErrors.original_text = 'Content must be at least 100 characters for meaningful AI analysis';
      else if (formData.original_text.length > MAX_TEXT_LENGTH) newErrors.original_text = `Content exceeds ${(MAX_TEXT_LENGTH / 1000).toFixed(0)}K character limit`;
    } else {
      if (!selectedFile) newErrors.file = 'Please select a file to upload';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (uploadStep === 1 && validateStep1()) setUploadStep(2);
    else if (uploadStep === 2 && validateStep2()) setUploadStep(3);
  };

  const handleBack = () => {
    if (uploadStep > 1) setUploadStep(uploadStep - 1);
  };

  const parseTags = (input: string): string[] =>
    input.split(',').map(s => s.trim()).filter(s => s.length > 0);

  const handleSubmit = () => {
    const topics = parseTags(formData.topics);
    const institutions = parseTags(formData.institutions);

    if (uploadMode === 'text') {
      uploadDoc.mutate({
        title: formData.title.trim(),
        description: formData.description.trim(),
        document_type: formData.document_type,
        original_text: formData.original_text,
        country: formData.country || undefined,
        region: formData.region || undefined,
        source_url: formData.source_url || undefined,
        publish_date: formData.publish_date || undefined,
        language: formData.language || undefined,
        topics: topics.length ? topics : undefined,
        institutions: institutions.length ? institutions : undefined,
      }, { onSuccess: () => { setUploadOpen(false); resetForm(); } });
    } else if (selectedFile) {
      uploadFileDoc.mutate({
        file: selectedFile,
        title: formData.title.trim(),
        description: formData.description.trim(),
        documentType: formData.document_type,
        country: formData.country || undefined,
        region: formData.region || undefined,
        source_url: formData.source_url || undefined,
        publish_date: formData.publish_date || undefined,
        language: formData.language || undefined,
        topics: topics.length ? topics : undefined,
        institutions: institutions.length ? institutions : undefined,
      }, { onSuccess: () => { setUploadOpen(false); resetForm(); } });
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setSelectedFile(null);
    setUploadStep(1);
    setErrors({});
  };

  const handleFileSelect = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!FILE_ACCEPT.split(',').includes(ext)) {
      toast.error('Unsupported file type. Accepted: PDF, Word, TXT, CSV, Excel, RTF, ODT, PPTX');
      return;
    }
    setSelectedFile(file);
    if (errors.file) setErrors(prev => ({ ...prev, file: undefined }));
    if (!formData.title) updateField('title', file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
  };

  const handleInputFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx', 'rtf', 'odt'].includes(ext || '')) return '📝';
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return '📊';
    if (ext === 'pptx') return '📑';
    return '📎';
  };

  const stepLabels = ['Document Details', 'Content Upload', 'Metadata & Review'];

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents, topics, countries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 rounded-xl h-10 bg-card/60 border-border/40" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl h-10 bg-card/60 border-border/40">
            <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue />
          </SelectTrigger>
          <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
        {user && (
          <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl h-10"><Upload className="h-4 w-4" />Upload Document</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-hidden p-0">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/30">
                <DialogTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Upload Public Document for AI Analysis
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Submit official documents for NuruAI civic intelligence processing. All documents are publicly accessible.
                </DialogDescription>
              </DialogHeader>

              {/* Step Indicator */}
              <div className="px-6 py-3 border-b border-border/20 bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  {stepLabels.map((label, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                        uploadStep > i + 1 ? 'bg-primary text-primary-foreground' :
                        uploadStep === i + 1 ? 'bg-primary text-primary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {uploadStep > i + 1 ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                      </div>
                      <span className={`text-xs hidden sm:inline ${uploadStep === i + 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
                      {i < 2 && <ChevronRight className="h-3 w-3 text-muted-foreground/40 mx-1" />}
                    </div>
                  ))}
                </div>
                <Progress value={(uploadStep / 3) * 100} className="h-1" />
              </div>

              <ScrollArea className="max-h-[55vh]">
                <div className="px-6 py-5 space-y-4">
                  <AnimatePresence mode="wait">
                    {/* STEP 1: Document Details */}
                    {uploadStep === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            Document Title <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            placeholder="e.g., Kenya National Budget 2025/2026 - Education Sector"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            className={`rounded-xl ${errors.title ? 'border-destructive' : ''}`}
                            maxLength={300}
                          />
                          {errors.title && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.title}</p>}
                          <p className="text-[10px] text-muted-foreground text-right">{formData.title.length}/300</p>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">Description</Label>
                          <Textarea
                            placeholder="Brief summary of what this document contains and its significance..."
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            className={`rounded-xl min-h-[80px] ${errors.description ? 'border-destructive' : ''}`}
                            maxLength={2000}
                          />
                          {errors.description && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.description}</p>}
                          <p className="text-[10px] text-muted-foreground text-right">{formData.description.length}/2000</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5" /> Document Type <span className="text-destructive">*</span>
                            </Label>
                            <Select value={formData.document_type} onValueChange={(v) => updateField('document_type', v)}>
                              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {DOC_TYPES.filter(t => t.value !== 'all').map(t => (
                                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium flex items-center gap-1.5">
                              <Globe className="h-3.5 w-3.5" /> Country
                            </Label>
                            <Select value={formData.country} onValueChange={(v) => updateField('country', v)}>
                              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select country" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">-- Not specified --</SelectItem>
                                {AFRICAN_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium flex items-center gap-1.5">
                              <Link2 className="h-3.5 w-3.5" /> Source URL
                            </Label>
                            <Input
                              placeholder="https://official-source.gov/document"
                              value={formData.source_url}
                              onChange={(e) => updateField('source_url', e.target.value)}
                              className={`rounded-xl ${errors.source_url ? 'border-destructive' : ''}`}
                            />
                            {errors.source_url && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.source_url}</p>}
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" /> Publish Date
                            </Label>
                            <Input
                              type="date"
                              value={formData.publish_date}
                              onChange={(e) => updateField('publish_date', e.target.value)}
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: Content Upload */}
                    {uploadStep === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as 'text' | 'file')}>
                          <TabsList className="grid w-full grid-cols-2 rounded-xl">
                            <TabsTrigger value="file" className="gap-2 rounded-lg"><FileUp className="h-4 w-4" />Upload File</TabsTrigger>
                            <TabsTrigger value="text" className="gap-2 rounded-lg"><FileText className="h-4 w-4" />Paste Text</TabsTrigger>
                          </TabsList>

                          <TabsContent value="file" className="mt-4">
                            <div
                              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                                dragActive ? 'border-primary bg-primary/5 scale-[1.01]' :
                                errors.file ? 'border-destructive/50 bg-destructive/5' :
                                'border-border/40 hover:border-primary/30 hover:bg-muted/20'
                              }`}
                              onClick={() => fileInputRef.current?.click()}
                              onDragEnter={handleDrag}
                              onDragLeave={handleDrag}
                              onDragOver={handleDrag}
                              onDrop={handleDrop}
                            >
                              <input ref={fileInputRef} type="file" accept={FILE_ACCEPT} onChange={handleInputFileSelect} className="hidden" />
                              {selectedFile ? (
                                <div className="space-y-3">
                                  <div className="text-4xl">{getFileIcon(selectedFile.name)}</div>
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {formatFileSize(selectedFile.size)} · {selectedFile.type || 'Unknown type'}
                                    </p>
                                  </div>
                                  <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFile(null);
                                  }}>
                                    <X className="h-3 w-3" /> Remove
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/5 flex items-center justify-center">
                                    <FileUp className="h-8 w-8 text-primary/40" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {dragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      PDF, Word, Excel, TXT, CSV, RTF, ODT, PPTX · Max {MAX_FILE_SIZE / (1024 * 1024)}MB
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            {errors.file && <p className="text-xs text-destructive flex items-center gap-1 mt-2"><AlertCircle className="h-3 w-3" />{errors.file}</p>}

                            {/* File handling info */}
                            <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/20">
                              <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-primary/60 mt-0.5 shrink-0" />
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <p className="font-medium text-foreground/80">What happens after upload:</p>
                                  <ul className="list-disc pl-4 space-y-0.5">
                                    <li>Text is automatically extracted from the document</li>
                                    <li>NuruAI generates a structured summary with key findings</li>
                                    <li>Topics, institutions, and financial allocations are identified</li>
                                    <li>The document becomes available for public civic Q&A</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="text" className="mt-4 space-y-3">
                            <Textarea
                              placeholder="Paste the full document text content here. Include headers, sections, financial data, and any relevant legislative text for the most comprehensive AI analysis..."
                              rows={12}
                              value={formData.original_text}
                              onChange={(e) => updateField('original_text', e.target.value)}
                              className={`rounded-xl font-mono text-xs leading-relaxed ${errors.original_text ? 'border-destructive' : ''}`}
                              maxLength={MAX_TEXT_LENGTH}
                            />
                            {errors.original_text && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.original_text}</p>}
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>{formData.original_text.length > 0 ? `${(formData.original_text.length).toLocaleString()} characters` : 'Minimum 100 characters required'}</span>
                              <span>{(formData.original_text.length / 1000).toFixed(1)}K / {(MAX_TEXT_LENGTH / 1000).toFixed(0)}K</span>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </motion.div>
                    )}

                    {/* STEP 3: Metadata & Review */}
                    {uploadStep === 3 && (
                      <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium flex items-center gap-1.5">
                              <Languages className="h-3.5 w-3.5" /> Document Language
                            </Label>
                            <Select value={formData.language} onValueChange={(v) => updateField('language', v)}>
                              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" /> Region / Jurisdiction
                            </Label>
                            <Input
                              placeholder="e.g., East Africa, Nairobi County"
                              value={formData.region}
                              onChange={(e) => updateField('region', e.target.value)}
                              className="rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5" /> Topics / Tags
                          </Label>
                          <Input
                            placeholder="e.g., Education, Budget, Healthcare (comma-separated)"
                            value={formData.topics}
                            onChange={(e) => updateField('topics', e.target.value)}
                            className="rounded-xl"
                          />
                          {formData.topics && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {parseTags(formData.topics).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px]">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" /> Referenced Institutions
                          </Label>
                          <Input
                            placeholder="e.g., Ministry of Education, Parliament, Central Bank (comma-separated)"
                            value={formData.institutions}
                            onChange={(e) => updateField('institutions', e.target.value)}
                            className="rounded-xl"
                          />
                          {formData.institutions && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {parseTags(formData.institutions).map((inst, i) => (
                                <Badge key={i} variant="outline" className="text-[10px]">{inst}</Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Review Summary */}
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2.5">
                          <h4 className="text-sm font-semibold flex items-center gap-1.5 text-primary">
                            <FileCheck className="h-4 w-4" /> Submission Summary
                          </h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                            <span className="text-muted-foreground">Title:</span>
                            <span className="font-medium text-foreground truncate">{formData.title || '—'}</span>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium capitalize">{formData.document_type}</span>
                            <span className="text-muted-foreground">Content:</span>
                            <span className="font-medium">{uploadMode === 'file' ? (selectedFile?.name || '—') : `${(formData.original_text.length / 1000).toFixed(1)}K chars`}</span>
                            <span className="text-muted-foreground">Country:</span>
                            <span className="font-medium">{formData.country && formData.country !== 'none' ? formData.country : '—'}</span>
                            <span className="text-muted-foreground">Language:</span>
                            <span className="font-medium">{LANGUAGES.find(l => l.value === formData.language)?.label || '—'}</span>
                            {formData.source_url && <>
                              <span className="text-muted-foreground">Source:</span>
                              <span className="font-medium truncate text-primary">{formData.source_url}</span>
                            </>}
                          </div>
                        </div>

                        {/* Compliance Notice */}
                        <div className="p-3 rounded-xl bg-muted/30 border border-border/20">
                          <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-primary/60 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-muted-foreground">
                              By submitting, you confirm this is a <strong>publicly available official document</strong> and you have the right to share it.
                              Documents are processed by NuruAI for civic transparency and public accountability purposes in accordance with open governance principles.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-border/30 flex items-center justify-between bg-muted/10">
                <Button variant="ghost" onClick={uploadStep === 1 ? () => setUploadOpen(false) : handleBack} className="rounded-xl" disabled={isUploading}>
                  {uploadStep === 1 ? 'Cancel' : 'Back'}
                </Button>
                <div className="flex items-center gap-2">
                  {uploadStep < 3 ? (
                    <Button onClick={handleNext} className="rounded-xl gap-1.5">
                      Continue <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={isUploading} className="rounded-xl gap-1.5 min-w-[160px]">
                      {isUploading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> Submit for AI Analysis</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
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
                {doc.topics && doc.topics.length > 0 && (
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
