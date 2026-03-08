import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, FileText, MessageSquareText, Building2, BarChart3, Shield, Database, 
  Loader2, Sparkles, Download, RefreshCw, Clock, Users, Globe, CheckCircle,
  AlertTriangle, Activity
} from 'lucide-react';
import { useCivicDocuments, useCivicQuestions, useAllCivicQuestions, useNuruAuditLog, useSeedNuruDemo } from '@/hooks/useNuruAI';
import { format } from 'date-fns';

const AdminNuruAIManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: documents, isLoading: docsLoading } = useCivicDocuments();
  const { data: allQuestions } = useAllCivicQuestions();
  const { data: auditLog } = useNuruAuditLog();
  const seedDemo = useSeedNuruDemo();

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
      {/* Header */}
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

      {/* Stats Cards */}
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
                  <th className="text-right p-3 font-medium">Questions</th>
                  <th className="text-right p-3 font-medium">Views</th>
                  <th className="text-left p-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(filteredDocs || []).map(doc => (
                  <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 max-w-xs truncate font-medium">{doc.title}</td>
                    <td className="p-3"><Badge variant="outline" className="text-xs capitalize">{doc.document_type}</Badge></td>
                    <td className="p-3 text-muted-foreground">{doc.country || '-'}</td>
                    <td className="p-3">
                      <Badge variant={doc.status === 'ready' ? 'secondary' : 'outline'} className="text-xs gap-1">
                        {doc.status === 'ready' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">{doc.question_count}</td>
                    <td className="p-3 text-right">{doc.view_count?.toLocaleString()}</td>
                    <td className="p-3 text-muted-foreground text-xs">{format(new Date(doc.created_at), 'MMM d, yyyy')}</td>
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
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">{q.status}</Badge>
                    </td>
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
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs capitalize">{entry.action.replace(/_/g, ' ')}</Badge>
                    </td>
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
                <p>No audit entries yet. Audit logs are recorded when users interact with NuruAI.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNuruAIManager;
