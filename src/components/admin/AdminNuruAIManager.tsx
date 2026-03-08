import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, FileText, MessageSquareText, Shield, Database, 
  Loader2, Activity, CheckCircle, Clock, Trash2, Eye, 
  AlertTriangle, Building2, ChevronRight, Coins
} from 'lucide-react';
import AdminTokenLimitsManager from './AdminTokenLimitsManager';
import { 
  useCivicDocuments, useAllCivicQuestions, useNuruAuditLog, useSeedNuruDemo,
  useDeleteDocument, useUpdateDocumentStatus, useDocumentQuestions
} from '@/hooks/useNuruAI';
import { format } from 'date-fns';

const AdminNuruAIManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const { data: documents, isLoading: docsLoading } = useCivicDocuments();
  const { data: allQuestions } = useAllCivicQuestions();
  const { data: auditLog } = useNuruAuditLog();
  const seedDemo = useSeedNuruDemo();
  const deleteDoc = useDeleteDocument();
  const updateStatus = useUpdateDocumentStatus();

  const totalDocs = documents?.length || 0;
  const totalQuestions = allQuestions?.length || 0;
  const avgConfidence = allQuestions?.length 
    ? Math.round((allQuestions.reduce((sum: number, q: any) => sum + (q.ai_confidence || 0), 0) / allQuestions.length) * 100) 
    : 0;

  const filteredDocs = documents?.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-primary" />NuruAI Management</h2>
          <p className="text-sm text-muted-foreground">Manage civic documents, questions, audit trails, and AI governance</p>
        </div>
        <Button onClick={() => seedDemo.mutate()} disabled={seedDemo.isPending} variant="outline" className="gap-2">
          {seedDemo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
          Seed Demo Data
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Documents', value: totalDocs, icon: FileText, color: 'text-blue-500' },
          { label: 'Questions', value: totalQuestions, icon: MessageSquareText, color: 'text-green-500' },
          { label: 'Avg Confidence', value: `${avgConfidence}%`, icon: Activity, color: 'text-purple-500' },
          { label: 'Audit Entries', value: auditLog?.length || 0, icon: Shield, color: 'text-orange-500' },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents" className="gap-2"><FileText className="h-4 w-4" />Documents</TabsTrigger>
          <TabsTrigger value="questions" className="gap-2"><MessageSquareText className="h-4 w-4" />Questions</TabsTrigger>
          <TabsTrigger value="token-limits" className="gap-2"><Coins className="h-4 w-4" />Token Limits</TabsTrigger>
          <TabsTrigger value="audit" className="gap-2"><Shield className="h-4 w-4" />Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Input placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-md" />
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Title</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Country</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Q&A</th>
                  <th className="text-right p-3 font-medium">Views</th>
                  <th className="text-left p-3 font-medium">Created</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(filteredDocs || []).map(doc => (
                  <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 max-w-xs truncate font-medium">{doc.title}</td>
                    <td className="p-3"><Badge variant="outline" className="text-xs capitalize">{doc.document_type}</Badge></td>
                    <td className="p-3 text-muted-foreground">{doc.country || '-'}</td>
                    <td className="p-3">
                      <Select
                        value={doc.status}
                        onValueChange={(val) => updateStatus.mutate({ documentId: doc.id, status: val })}
                      >
                        <SelectTrigger className="h-7 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-right">{doc.question_count}</td>
                    <td className="p-3 text-right">{doc.view_count?.toLocaleString()}</td>
                    <td className="p-3 text-muted-foreground text-xs">{format(new Date(doc.created_at), 'MMM d, yyyy')}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedDocId(doc.id)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" 
                          onClick={() => { if (confirm('Delete this document and all related data?')) deleteDoc.mutate(doc.id); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!filteredDocs || filteredDocs.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No documents found. Click "Seed Demo Data" to populate.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Question</th>
                  <th className="text-left p-3 font-medium">Document</th>
                  <th className="text-left p-3 font-medium">Confidence</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Upvotes</th>
                  <th className="text-left p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(allQuestions || []).slice(0, 50).map((q: any) => (
                  <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 max-w-xs truncate">{q.question_text}</td>
                    <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">{q.civic_documents?.title || '-'}</td>
                    <td className="p-3">
                      {q.ai_confidence != null && (
                        <Badge variant="outline" className={`text-xs ${q.ai_confidence >= 0.8 ? 'text-green-500' : q.ai_confidence >= 0.5 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {Math.round(q.ai_confidence * 100)}%
                        </Badge>
                      )}
                    </td>
                    <td className="p-3"><Badge variant="secondary" className="text-xs">{q.status}</Badge></td>
                    <td className="p-3 text-right">{q.upvote_count}</td>
                    <td className="p-3 text-muted-foreground text-xs">{format(new Date(q.created_at), 'MMM d')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!allQuestions || allQuestions.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquareText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No questions found yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Action</th>
                  <th className="text-left p-3 font-medium">Entity Type</th>
                  <th className="text-left p-3 font-medium">Details</th>
                  <th className="text-left p-3 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(auditLog || []).map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3"><Badge variant="outline" className="text-xs capitalize">{entry.action.replace(/_/g, ' ')}</Badge></td>
                    <td className="p-3 text-muted-foreground text-xs">{entry.entity_type}</td>
                    <td className="p-3 text-xs max-w-md truncate text-muted-foreground">
                      {entry.details?.processingTime ? `${entry.details.processingTime}ms` : ''}
                      {entry.details?.confidence ? ` | Confidence: ${Math.round(entry.details.confidence * 100)}%` : ''}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{format(new Date(entry.created_at), 'MMM d, HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!auditLog || auditLog.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No audit entries yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Detail Dialog */}
      {selectedDocId && (
        <DocumentDetailDialog documentId={selectedDocId} onClose={() => setSelectedDocId(null)} />
      )}
    </div>
  );
};

function DocumentDetailDialog({ documentId, onClose }: { documentId: string; onClose: () => void }) {
  const { data: questions, isLoading } = useDocumentQuestions(documentId);
  const doc = useCivicDocuments().data?.find(d => d.id === documentId);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {doc?.title || 'Document Details'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          {doc && (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="font-medium capitalize">{doc.document_type}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground text-xs">Country</p>
                  <p className="font-medium">{doc.country || '-'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground text-xs">Status</p>
                  <Badge variant={doc.status === 'ready' ? 'secondary' : 'outline'} className="mt-1">{doc.status}</Badge>
                </div>
              </div>
              {doc.summary && (
                <div className="p-3 rounded-lg border border-border/50 text-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Summary</p>
                  <p className="text-foreground">{doc.summary}</p>
                </div>
              )}
            </div>
          )}

          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <MessageSquareText className="h-4 w-4" /> Questions & Responses ({questions?.length || 0})
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-3">
              {questions?.map((q: any) => (
                <div key={q.id} className="rounded-lg border border-border/50 p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium">{q.question_text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {q.ai_confidence != null && (
                        <Badge variant="outline" className="text-[10px]">
                          {Math.round(q.ai_confidence * 100)}% confidence
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">{format(new Date(q.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  
                  {q.ai_answer && (
                    <div className="bg-primary/5 rounded-lg p-3 text-sm text-foreground">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">AI Answer</p>
                      <p className="text-xs">{q.ai_answer}</p>
                    </div>
                  )}

                  {q.institutional_responses?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> Institutional Responses
                      </p>
                      {q.institutional_responses.map((r: any) => (
                        <div key={r.id} className="bg-muted/30 rounded-lg p-3 text-xs border border-border/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-foreground">{r.institution_name}</span>
                            <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                          </div>
                          <p className="text-muted-foreground">{r.response_text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {(!questions || questions.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <MessageSquareText className="h-6 w-6 mx-auto mb-2 opacity-30" />
                  <p>No questions for this document yet.</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default AdminNuruAIManager;
