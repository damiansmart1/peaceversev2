import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Upload, Eye, MessageSquare, Calendar, Building2, Search, Filter, Loader2, BookOpen } from 'lucide-react';
import { useCivicDocuments, useUploadDocument } from '@/hooks/useNuruAI';
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

const NuruDocumentLibrary = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', description: '', document_type: 'policy', original_text: '', country: '' });
  const { data: documents, isLoading } = useCivicDocuments(typeFilter);
  const uploadDoc = useUploadDocument();
  const { user } = useAuth();

  const filtered = documents?.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.topics?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleUpload = () => {
    if (!newDoc.title || !newDoc.original_text) return;
    uploadDoc.mutate(newDoc, {
      onSuccess: () => {
        setUploadOpen(false);
        setNewDoc({ title: '', description: '', document_type: 'policy', original_text: '', country: '' });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documents, topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
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
                  <div className="space-y-4">
                    <Input placeholder="Document title" value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} />
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
                    <Textarea placeholder="Paste the document text content here..." rows={8} value={newDoc.original_text} onChange={(e) => setNewDoc({ ...newDoc, original_text: e.target.value })} />
                    <Button onClick={handleUpload} disabled={uploadDoc.isPending} className="w-full gap-2">
                      {uploadDoc.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadDoc.isPending ? 'Processing...' : 'Upload & Analyze'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

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
          {filtered.map((doc, i) => (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:border-primary/30 transition-all h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{doc.document_type}</Badge>
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
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{doc.view_count}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{doc.question_count}</span>
                    </div>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NuruDocumentLibrary;
