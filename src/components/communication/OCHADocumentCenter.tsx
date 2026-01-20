import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Plus,
  Download,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  FileWarning,
  Newspaper,
  ClipboardList,
  Users,
  MapPin,
  Calendar,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  useOCHADocuments, 
  useCreateOCHADocument,
  DocumentType,
  AlertSeverityLevel,
  OCHADocument
} from '@/hooks/useCommunication';

const documentTypeConfig: Record<DocumentType, { icon: React.ComponentType<any>; label: string; description: string }> = {
  sitrep: { icon: FileText, label: 'Situation Report', description: 'Comprehensive situation analysis' },
  flash_update: { icon: AlertCircle, label: 'Flash Update', description: 'Urgent situation updates' },
  bulletin: { icon: Newspaper, label: 'Information Bulletin', description: 'Regular information updates' },
  '3w_report': { icon: MapPin, label: '3W Report', description: 'Who does What Where' },
  meeting_notes: { icon: Users, label: 'Meeting Notes', description: 'Coordination meeting records' },
  action_tracker: { icon: ClipboardList, label: 'Action Tracker', description: 'Follow-up actions tracking' },
};

const severityColors: Record<AlertSeverityLevel, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

const OCHADocumentCenter: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<OCHADocument | null>(null);
  const [activeType, setActiveType] = useState<string>('all');
  
  // Form state
  const [docType, setDocType] = useState<DocumentType>('sitrep');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [severity, setSeverity] = useState<AlertSeverityLevel>('green');
  const [country, setCountry] = useState('');
  
  const { data: documents, isLoading } = useOCHADocuments(
    activeType !== 'all' ? { type: activeType as DocumentType } : undefined
  );
  const createDocument = useCreateOCHADocument();

  const handleCreate = async () => {
    await createDocument.mutateAsync({
      document_type: docType,
      title,
      summary,
      severity_level: severity,
      country,
      content: {
        sections: [],
        created_using: 'OCHA Document Center',
      },
    });
    
    setTitle('');
    setSummary('');
    setSeverity('green');
    setCountry('');
    setIsCreateOpen(false);
  };

  const statusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { color: 'bg-gray-500', label: 'Draft' };
      case 'pending_review':
        return { color: 'bg-yellow-500', label: 'Pending Review' };
      case 'approved':
        return { color: 'bg-blue-500', label: 'Approved' };
      case 'published':
        return { color: 'bg-green-500', label: 'Published' };
      case 'archived':
        return { color: 'bg-gray-400', label: 'Archived' };
      default:
        return { color: 'bg-gray-500', label: status };
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Type Tabs */}
      <Tabs value={activeType} onValueChange={setActiveType}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            {Object.entries(documentTypeConfig).map(([type, config]) => (
              <TabsTrigger key={type} value={type} className="gap-2">
                <config.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{config.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Create OCHA Document
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                {/* Document Type Selection */}
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(documentTypeConfig).map(([type, config]) => (
                    <Card 
                      key={type}
                      className={`cursor-pointer transition-all ${
                        docType === type ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setDocType(type as DocumentType)}
                    >
                      <CardContent className="p-4 text-center">
                        <config.icon className={`h-6 w-6 mx-auto mb-2 ${docType === type ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="font-medium text-sm">{config.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Severity Level</Label>
                    <Select value={severity} onValueChange={(v) => setSeverity(v as AlertSeverityLevel)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green">Green - Normal</SelectItem>
                        <SelectItem value="yellow">Yellow - Elevated</SelectItem>
                        <SelectItem value="orange">Orange - High</SelectItem>
                        <SelectItem value="red">Red - Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Country/Region</Label>
                    <Input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g., Kenya, Horn of Africa"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Document Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`${documentTypeConfig[docType].label}: [Title]`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Executive Summary</Label>
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Brief overview of the document content..."
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={!title}>
                    Create Draft
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Documents Grid */}
        <TabsContent value={activeType} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {isLoading ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    Loading documents...
                  </CardContent>
                </Card>
              ) : documents?.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="font-semibold mb-1">No Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first OCHA-standard document
                    </p>
                  </CardContent>
                </Card>
              ) : (
                documents?.map((doc, index) => {
                  const typeConfig = documentTypeConfig[doc.document_type];
                  const TypeIcon = typeConfig?.icon || FileText;
                  const status = statusConfig(doc.status);
                  
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedDoc(doc)}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${severityColors[doc.severity_level]}/10`}>
                                <TypeIcon className={`h-4 w-4`} />
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {typeConfig?.label}
                              </Badge>
                            </div>
                            <Badge className={`${status.color} text-white text-xs`}>
                              {status.label}
                            </Badge>
                          </div>
                          <CardTitle className="text-base mt-2 line-clamp-2">
                            {doc.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {doc.summary && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {doc.summary}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {doc.country && (
                              <Badge variant="secondary" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                {doc.country}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              <span className={`w-2 h-2 rounded-full mr-1 ${severityColors[doc.severity_level]}`} />
                              {doc.severity_level.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(doc.created_at), 'MMM d, yyyy')}
                            </span>
                            {doc.published_at && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Published
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Detail Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedDoc && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${severityColors[selectedDoc.severity_level]}/10`}>
                    {(() => {
                      const Icon = documentTypeConfig[selectedDoc.document_type]?.icon || FileText;
                      return <Icon className="h-6 w-6" />;
                    })()}
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-1">
                      {documentTypeConfig[selectedDoc.document_type]?.label}
                    </Badge>
                    <DialogTitle className="text-xl">{selectedDoc.title}</DialogTitle>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 pt-4">
                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <Badge className={`${statusConfig(selectedDoc.status).color} text-white mt-1`}>
                      {statusConfig(selectedDoc.status).label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Severity</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`w-3 h-3 rounded-full ${severityColors[selectedDoc.severity_level]}`} />
                      <span className="font-medium capitalize">{selectedDoc.severity_level}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Country/Region</Label>
                    <p className="font-medium mt-1">{selectedDoc.country || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Created</Label>
                    <p className="font-medium mt-1">{format(new Date(selectedDoc.created_at), 'PPp')}</p>
                  </div>
                </div>
                
                {/* Summary */}
                {selectedDoc.summary && (
                  <div>
                    <Label className="text-muted-foreground">Executive Summary</Label>
                    <Card className="mt-2">
                      <CardContent className="p-4">
                        <p className="whitespace-pre-wrap">{selectedDoc.summary}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Word
                  </Button>
                  {selectedDoc.status === 'draft' && (
                    <Button className="gap-2">
                      <Send className="h-4 w-4" />
                      Submit for Review
                    </Button>
                  )}
                  {selectedDoc.status === 'approved' && (
                    <Button className="gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OCHADocumentCenter;
