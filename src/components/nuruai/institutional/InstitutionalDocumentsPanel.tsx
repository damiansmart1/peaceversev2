import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Upload, FileText, Search, Eye, MessageSquareText, Calendar,
  Globe, Download, ExternalLink, FileSpreadsheet, FileImage
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Props {
  documents: any[];
}

const fileTypeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  docx: FileText,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  image: FileImage,
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-100 text-amber-700 border-amber-200',
  archived: 'bg-muted text-muted-foreground border-border',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
};

export const InstitutionalDocumentsPanel = ({ documents }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = documents?.filter(d =>
    d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.document_type?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    total: documents?.length || 0,
    active: documents?.filter(d => d.status === 'active').length || 0,
    totalQuestions: documents?.reduce((sum: number, d: any) => sum + (d.question_count || 0), 0) || 0,
    totalViews: documents?.reduce((sum: number, d: any) => sum + (d.view_count || 0), 0) || 0,
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.02] p-6 text-center hover:border-primary/40 transition-colors cursor-pointer group">
        <Upload className="h-8 w-8 mx-auto mb-2 text-primary/30 group-hover:text-primary/50 transition-colors" />
        <p className="text-sm font-medium text-foreground/70">Upload Official Documents</p>
        <p className="text-[10px] text-muted-foreground mt-1">
          Drag & drop or click • PDF, DOCX, XLSX, CSV supported • Max 50MB
        </p>
        <div className="flex justify-center gap-2 mt-3">
          {['PDF', 'DOCX', 'XLSX', 'CSV'].map(type => (
            <Badge key={type} variant="outline" className="text-[9px] px-1.5">{type}</Badge>
          ))}
        </div>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total Documents', value: stats.total, color: 'text-primary' },
          { label: 'Active', value: stats.active, color: 'text-emerald-500' },
          { label: 'Questions Received', value: stats.totalQuestions, color: 'text-amber-500' },
          { label: 'Total Views', value: stats.totalViews, color: 'text-blue-500' },
        ].map(s => (
          <div key={s.label} className="text-center p-2.5 rounded-lg border border-border/20 bg-card/30">
            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search documents by title or type..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </div>

      {/* Documents List */}
      <ScrollArea className="max-h-[450px]">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs">No documents found</p>
          </div>
        ) : (
          filtered.slice(0, 20).map((doc: any, i: number) => {
            const IconComp = fileTypeIcons[doc.file_type?.toLowerCase()] || FileText;
            const engagementRate = doc.view_count > 0 ? Math.round(((doc.question_count || 0) / doc.view_count) * 100) : 0;

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border/30 bg-card/40 p-4 mb-3 hover:bg-card/60 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 shrink-0">
                    <IconComp className="h-4 w-4 text-primary/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold truncate">{doc.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {doc.document_type} {doc.country && `• ${doc.country}`}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-[9px] px-1.5 shrink-0 ${statusColors[doc.status] || ''}`}>
                        {doc.status}
                      </Badge>
                    </div>

                    {/* Engagement Metrics */}
                    <div className="flex items-center gap-3 mt-2.5">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Eye className="h-2.5 w-2.5" /> {doc.view_count || 0} views
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MessageSquareText className="h-2.5 w-2.5" /> {doc.question_count || 0} questions
                      </span>
                      {doc.publish_date && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" /> {format(parseISO(doc.publish_date), 'MMM d, yyyy')}
                        </span>
                      )}
                      {doc.country && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Globe className="h-2.5 w-2.5" /> {doc.country}
                        </span>
                      )}
                    </div>

                    {/* Engagement Progress */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-muted-foreground">Citizen Engagement</span>
                        <span className="text-[9px] font-medium">{engagementRate}%</span>
                      </div>
                      <Progress value={engagementRate} className="h-1" />
                    </div>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="flex justify-end gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2">
                    <ExternalLink className="h-2.5 w-2.5" /> View
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2">
                    <Download className="h-2.5 w-2.5" /> Export
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </ScrollArea>
    </div>
  );
};
