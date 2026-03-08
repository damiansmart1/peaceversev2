import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, FileText, Globe, Shield, Loader2, Search, CheckCircle, 
  AlertCircle, BookOpen, Scale, Trash2, Edit, Eye, RefreshCw
} from 'lucide-react';
import { useConstitutions, useUploadConstitution, useDeleteConstitution, useProcessConstitution } from '@/hooks/useConstitutions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
];

const AdminConstitutionsManager = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConstitution, setSelectedConstitution] = useState<any>(null);
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    country_name: '',
    country_code: '',
    constitution_title: '',
    original_text: '',
    language: 'en',
    effective_date: '',
    amendment_date: '',
    source_url: '',
  });

  const { data: constitutions, isLoading } = useConstitutions();
  const uploadMutation = useUploadConstitution();
  const deleteMutation = useDeleteConstitution();
  const processMutation = useProcessConstitution();

  const filtered = constitutions?.filter((c: any) =>
    c.country_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.constitution_title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const countriesWithConstitution = new Set(constitutions?.map((c: any) => c.country_name) || []);
  const countriesWithout = AFRICAN_COUNTRIES.filter(c => !countriesWithConstitution.has(c));

  const handleSubmit = async () => {
    if (!form.country_name || !form.constitution_title) {
      toast.error('Country and title are required');
      return;
    }

    let textContent = form.original_text;

    if (uploadMode === 'file' && selectedFile) {
      const isPdf = selectedFile.name.toLowerCase().endsWith('.pdf');
      const isDoc = selectedFile.name.toLowerCase().endsWith('.doc') || selectedFile.name.toLowerCase().endsWith('.docx');

      if (isPdf || isDoc) {
        // Upload file to storage, then extract text via edge function
        toast.info('Extracting text from document...');
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Must be logged in');

          const filePath = `constitutions/${user.id}/${Date.now()}_${selectedFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('nuru-documents')
            .upload(filePath, selectedFile);
          if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`);

          const { data: { publicUrl } } = supabase.storage
            .from('nuru-documents')
            .getPublicUrl(filePath);

          const { data: extractResult, error: extractError } = await supabase.functions.invoke('extract-document-text', {
            body: { fileUrl: publicUrl, fileName: selectedFile.name },
          });
          if (extractError) throw new Error(`Text extraction failed: ${extractError.message}`);

          textContent = extractResult?.text || '';
          if (!textContent || textContent.length < 100) {
            throw new Error('Could not extract sufficient text from the document. Try pasting the text directly.');
          }
          toast.success(`Extracted ${textContent.length.toLocaleString()} characters from document`);
        } catch (e: any) {
          toast.error(e.message || 'Failed to process document');
          return;
        }
      } else {
        // Plain text file - read directly but sanitize
        textContent = await selectedFile.text();
      }
    }

    // Sanitize: remove null bytes and other problematic characters
    textContent = textContent.replace(/\u0000/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    if (!textContent || textContent.length < 100) {
      toast.error('Constitution text must be at least 100 characters');
      return;
    }

    uploadMutation.mutate({
      ...form,
      original_text: textContent,
    }, {
      onSuccess: () => {
        setUploadOpen(false);
        setForm({ country_name: '', country_code: '', constitution_title: '', original_text: '', language: 'en', effective_date: '', amendment_date: '', source_url: '' });
        setSelectedFile(null);
      }
    });
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
      processing: { label: 'Processing', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
      completed: { label: 'Ready', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      failed: { label: 'Failed', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    };
    const s = map[status] || map.pending;
    return <Badge variant="outline" className={s.className}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Constitutional Repository
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload national constitutions for cross-referencing in NuruAI document analysis
          </p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Upload className="h-4 w-4" />Upload Constitution</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Upload National Constitution
              </DialogTitle>
              <DialogDescription>
                Add a country's constitution for automatic cross-referencing in all NuruAI document analyses.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[65vh] pr-2">
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Country <span className="text-destructive">*</span></Label>
                    <Select value={form.country_name} onValueChange={(v) => setForm(p => ({ ...p, country_name: v, country_code: v.substring(0, 2).toUpperCase() }))}>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>
                        {AFRICAN_COUNTRIES.map(c => (
                          <SelectItem key={c} value={c} disabled={countriesWithConstitution.has(c)}>
                            {c} {countriesWithConstitution.has(c) ? '(uploaded)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Language</Label>
                    <Select value={form.language} onValueChange={(v) => setForm(p => ({ ...p, language: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Constitution Title <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="e.g., Constitution of the Republic of Kenya, 2010"
                    value={form.constitution_title}
                    onChange={(e) => setForm(p => ({ ...p, constitution_title: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Effective Date</Label>
                    <Input type="date" value={form.effective_date} onChange={(e) => setForm(p => ({ ...p, effective_date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Last Amendment Date</Label>
                    <Input type="date" value={form.amendment_date} onChange={(e) => setForm(p => ({ ...p, amendment_date: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Source URL</Label>
                  <Input placeholder="https://..." value={form.source_url} onChange={(e) => setForm(p => ({ ...p, source_url: e.target.value }))} />
                </div>

                <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as 'text' | 'file')}>
                  <TabsList className="w-full">
                    <TabsTrigger value="text" className="flex-1 gap-1.5"><FileText className="h-3.5 w-3.5" />Paste Text</TabsTrigger>
                    <TabsTrigger value="file" className="flex-1 gap-1.5"><Upload className="h-3.5 w-3.5" />Upload File</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text">
                    <Textarea
                      placeholder="Paste the full text of the constitution here..."
                      value={form.original_text}
                      onChange={(e) => setForm(p => ({ ...p, original_text: e.target.value }))}
                      className="min-h-[200px] font-mono text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">{form.original_text.length.toLocaleString()} characters</p>
                  </TabsContent>
                  <TabsContent value="file">
                    <div
                      className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); }}
                      />
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="font-medium">{selectedFile.name}</span>
                          <Badge variant="outline">{(selectedFile.size / 1024).toFixed(0)} KB</Badge>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload TXT, PDF, or Word file</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <Button onClick={handleSubmit} disabled={uploadMutation.isPending} className="w-full gap-2">
                  {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload Constitution
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Globe className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{constitutions?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Constitutions Uploaded</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><CheckCircle className="h-5 w-5 text-emerald-500" /></div>
            <div>
              <p className="text-2xl font-bold">{constitutions?.filter((c: any) => c.processing_status === 'completed').length || 0}</p>
              <p className="text-xs text-muted-foreground">Ready for Analysis</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><AlertCircle className="h-5 w-5 text-amber-500" /></div>
            <div>
              <p className="text-2xl font-bold">{countriesWithout.length}</p>
              <p className="text-xs text-muted-foreground">Countries Missing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search constitutions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {/* Constitution List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card/60">
          <CardContent className="p-12 text-center">
            <Scale className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold mb-1">No Constitutions Uploaded Yet</h3>
            <p className="text-sm text-muted-foreground">Upload national constitutions to enable constitutional cross-referencing in NuruAI.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c: any) => (
            <Card key={c.id} className="bg-card/60 hover:bg-card/80 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{c.constitution_title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">{c.country_name}</Badge>
                      {c.effective_date && <span className="text-[10px] text-muted-foreground">{c.effective_date}</span>}
                      <span className="text-[10px] text-muted-foreground">{(c.original_text?.length || 0).toLocaleString()} chars</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge(c.processing_status)}
                  {c.processing_status !== 'completed' && (
                    <Button size="sm" variant="outline" onClick={() => processMutation.mutate(c.id)} disabled={processMutation.isPending}>
                      <RefreshCw className={`h-3.5 w-3.5 ${processMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setSelectedConstitution(c)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => {
                    if (confirm(`Delete constitution for ${c.country_name}?`)) deleteMutation.mutate(c.id);
                  }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Missing Countries */}
      {countriesWithout.length > 0 && (
        <Card className="bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-500" />Countries Without Constitutions</CardTitle>
            <CardDescription className="text-xs">These countries need constitutions uploaded for comprehensive cross-referencing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {countriesWithout.map(c => (
                <Badge key={c} variant="outline" className="text-[10px] cursor-pointer hover:bg-primary/10" onClick={() => { setForm(p => ({ ...p, country_name: c, constitution_title: `Constitution of ${c}` })); setUploadOpen(true); }}>
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Dialog */}
      <Dialog open={!!selectedConstitution} onOpenChange={() => setSelectedConstitution(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{selectedConstitution?.constitution_title}</DialogTitle>
            <DialogDescription>{selectedConstitution?.country_name}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh]">
            {selectedConstitution?.ai_summary && (
              <div className="mb-4 p-4 bg-primary/5 rounded-xl">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" />AI Summary</h4>
                <p className="text-sm text-muted-foreground">{typeof selectedConstitution.ai_summary === 'object' ? selectedConstitution.ai_summary.summary : selectedConstitution.summary}</p>
              </div>
            )}
            <pre className="text-xs whitespace-pre-wrap font-mono bg-muted/30 p-4 rounded-xl max-h-[50vh] overflow-auto">
              {selectedConstitution?.original_text?.substring(0, 50000)}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminConstitutionsManager;
