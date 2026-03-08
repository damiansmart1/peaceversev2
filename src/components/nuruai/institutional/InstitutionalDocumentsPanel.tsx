import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Upload, FileText, Search, Eye, MessageSquareText, Calendar,
  Globe, Download, ExternalLink, FileSpreadsheet, FileImage, X
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

// ── Export Utilities ──────────────────────────────────────────────
function exportAsJSON(doc: any) {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${slugify(doc.title)}.json`);
}

function exportAsCSV(doc: any) {
  const headers = ['Field', 'Value'];
  const rows = Object.entries(doc).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv' }), `${slugify(doc.title)}.csv`);
}

function exportAsPDF(doc: any) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  // Header
  pdf.setFontSize(8);
  pdf.setTextColor(120);
  pdf.text('INSTITUTIONAL ENGAGEMENT PORTAL — DOCUMENT EXPORT', 14, 12);
  pdf.text(`Generated: ${new Date().toISOString().split('T')[0]}`, 14, 17);
  pdf.setDrawColor(200);
  pdf.line(14, 19, 196, 19);

  // Title
  pdf.setFontSize(14);
  pdf.setTextColor(30);
  pdf.text(doc.title || 'Untitled Document', 14, 28);

  // Metadata table
  const metaRows = [
    ['Type', doc.document_type || 'N/A'],
    ['Status', doc.status || 'N/A'],
    ['Country', doc.country || 'N/A'],
    ['Region', doc.region || 'N/A'],
    ['Views', String(doc.view_count || 0)],
    ['Questions', String(doc.question_count || 0)],
    ['Published', doc.publish_date ? format(parseISO(doc.publish_date), 'MMM d, yyyy') : 'N/A'],
    ['Created', doc.created_at ? format(parseISO(doc.created_at), 'MMM d, yyyy HH:mm') : 'N/A'],
  ];

  autoTable(pdf, {
    startY: 33,
    head: [['Property', 'Value']],
    body: metaRows,
    theme: 'grid',
    headStyles: { fillColor: [7, 79, 152], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
    margin: { left: 14, right: 14 },
  });

  // Summary section
  const finalY = (pdf as any).lastAutoTable?.finalY || 90;
  if (doc.summary) {
    pdf.setFontSize(11);
    pdf.setTextColor(30);
    pdf.text('Summary', 14, finalY + 10);
    pdf.setFontSize(9);
    pdf.setTextColor(60);
    const lines = pdf.splitTextToSize(doc.summary, 168);
    pdf.text(lines, 14, finalY + 16);
  }

  // Topics
  if (doc.topics?.length) {
    const topicY = doc.summary ? finalY + 30 + (pdf.splitTextToSize(doc.summary, 168).length * 4) : finalY + 10;
    pdf.setFontSize(11);
    pdf.setTextColor(30);
    pdf.text('Topics', 14, topicY);
    pdf.setFontSize(9);
    pdf.setTextColor(60);
    pdf.text(doc.topics.join(', '), 14, topicY + 6);
  }

  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(150);
    pdf.text(`PeaceVerse — Institutional Engagement Portal | Page ${i} of ${pageCount}`, 14, 290);
  }

  pdf.save(`${slugify(doc.title)}.pdf`);
}

function exportAsWord(doc: any) {
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>${doc.title}</title>
    <style>
      body { font-family: Calibri, sans-serif; margin: 40px; color: #333; }
      h1 { color: #074F98; font-size: 20px; border-bottom: 2px solid #074F98; padding-bottom: 8px; }
      h2 { color: #275432; font-size: 14px; margin-top: 20px; }
      table { border-collapse: collapse; width: 100%; margin: 12px 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
      th { background-color: #074F98; color: white; }
      .meta { color: #666; font-size: 10px; }
      .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 9px; color: #999; }
    </style></head>
    <body>
      <p class="meta">INSTITUTIONAL ENGAGEMENT PORTAL — DOCUMENT EXPORT | Generated: ${new Date().toLocaleDateString()}</p>
      <h1>${doc.title || 'Untitled Document'}</h1>
      <h2>Document Metadata</h2>
      <table>
        <tr><th>Property</th><th>Value</th></tr>
        <tr><td>Type</td><td>${doc.document_type || 'N/A'}</td></tr>
        <tr><td>Status</td><td>${doc.status || 'N/A'}</td></tr>
        <tr><td>Country</td><td>${doc.country || 'N/A'}</td></tr>
        <tr><td>Region</td><td>${doc.region || 'N/A'}</td></tr>
        <tr><td>Views</td><td>${doc.view_count || 0}</td></tr>
        <tr><td>Questions</td><td>${doc.question_count || 0}</td></tr>
        <tr><td>Published</td><td>${doc.publish_date ? format(parseISO(doc.publish_date), 'MMM d, yyyy') : 'N/A'}</td></tr>
        <tr><td>Created</td><td>${doc.created_at ? format(parseISO(doc.created_at), 'MMM d, yyyy HH:mm') : 'N/A'}</td></tr>
      </table>
      ${doc.summary ? `<h2>Summary</h2><p>${doc.summary}</p>` : ''}
      ${doc.topics?.length ? `<h2>Topics</h2><p>${doc.topics.join(', ')}</p>` : ''}
      ${doc.institutions?.length ? `<h2>Institutions</h2><p>${doc.institutions.join(', ')}</p>` : ''}
      <div class="footer">PeaceVerse — Institutional Engagement Portal</div>
    </body></html>`;
  downloadBlob(new Blob([html], { type: 'application/msword' }), `${slugify(doc.title)}.doc`);
}

function exportAsExcel(doc: any) {
  const headers = ['Property', 'Value'];
  const rows = Object.entries(doc).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')]);
  let xml = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
  xml += '<Worksheet ss:Name="Document"><Table>';
  xml += '<Row>' + headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('') + '</Row>';
  rows.forEach(row => {
    xml += '<Row>' + row.map(c => `<Cell><Data ss:Type="String">${escapeXml(c)}</Data></Cell>`).join('') + '</Row>';
  });
  xml += '</Table></Worksheet></Workbook>';
  downloadBlob(new Blob([xml], { type: 'application/vnd.ms-excel' }), `${slugify(doc.title)}.xls`);
}

function slugify(text: string) {
  return (text || 'document').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
}

function escapeXml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const InstitutionalDocumentsPanel = ({ documents }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDoc, setViewDoc] = useState<any>(null);
  const [exportDoc, setExportDoc] = useState<any>(null);
  const [exportFormat, setExportFormat] = useState('pdf');

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

  const handleExport = () => {
    if (!exportDoc) return;
    try {
      switch (exportFormat) {
        case 'json': exportAsJSON(exportDoc); break;
        case 'csv': exportAsCSV(exportDoc); break;
        case 'pdf': exportAsPDF(exportDoc); break;
        case 'word': exportAsWord(exportDoc); break;
        case 'excel': exportAsExcel(exportDoc); break;
      }
      toast.success(`Document exported as ${exportFormat.toUpperCase()}`);
      setExportDoc(null);
    } catch (err) {
      toast.error('Export failed. Please try again.');
    }
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

                {/* Actions — now functional */}
                <div className="flex justify-end gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2" onClick={() => setViewDoc(doc)}>
                    <ExternalLink className="h-2.5 w-2.5" /> View
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2" onClick={() => { setExportDoc(doc); setExportFormat('pdf'); }}>
                    <Download className="h-2.5 w-2.5" /> Export
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </ScrollArea>

      {/* ── View Document Dialog ── */}
      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {viewDoc?.title || 'Document'}
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              Full document details and metadata
            </DialogDescription>
          </DialogHeader>
          {viewDoc && (
            <div className="space-y-4">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Document Type', value: viewDoc.document_type },
                  { label: 'Status', value: viewDoc.status },
                  { label: 'Country', value: viewDoc.country || 'N/A' },
                  { label: 'Region', value: viewDoc.region || 'N/A' },
                  { label: 'Views', value: viewDoc.view_count || 0 },
                  { label: 'Questions', value: viewDoc.question_count || 0 },
                  { label: 'File Type', value: viewDoc.file_type || 'N/A' },
                  { label: 'Published', value: viewDoc.publish_date ? format(parseISO(viewDoc.publish_date), 'MMM d, yyyy') : 'N/A' },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-lg border border-border/20 bg-muted/20">
                    <p className="text-[9px] text-muted-foreground font-medium">{item.label}</p>
                    <p className="text-xs font-semibold mt-0.5">{String(item.value)}</p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              {viewDoc.summary && (
                <div className="p-4 rounded-xl border border-border/20 bg-card/30">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">AI Summary</p>
                  <p className="text-xs leading-relaxed text-foreground/80">{viewDoc.summary}</p>
                </div>
              )}

              {/* Topics */}
              {viewDoc.topics?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewDoc.topics.map((t: string) => (
                      <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Institutions */}
              {viewDoc.institutions?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">Related Institutions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewDoc.institutions.map((inst: string) => (
                      <Badge key={inst} variant="outline" className="text-[9px]">{inst}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Source URL */}
              {viewDoc.source_url && (
                <div className="p-3 rounded-lg border border-border/20 bg-primary/5">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">Source</p>
                  <a href={viewDoc.source_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> {viewDoc.source_url}
                  </a>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-[10px] text-muted-foreground space-y-0.5 pt-2 border-t border-border/10">
                <p>Created: {viewDoc.created_at ? format(parseISO(viewDoc.created_at), 'MMMM d, yyyy \'at\' HH:mm') : 'N/A'}</p>
                <p>Updated: {viewDoc.updated_at ? format(parseISO(viewDoc.updated_at), 'MMMM d, yyyy \'at\' HH:mm') : 'N/A'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => { setExportDoc(viewDoc); setExportFormat('pdf'); setViewDoc(null); }}>
              <Download className="h-3 w-3" /> Export
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setViewDoc(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Export Document Dialog ── */}
      <Dialog open={!!exportDoc} onOpenChange={() => setExportDoc(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              Export Document
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              Choose a format to download "{exportDoc?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Export Format</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="h-9 text-xs mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf" className="text-xs">📄 PDF — Professional report</SelectItem>
                  <SelectItem value="word" className="text-xs">📝 Word (.doc) — Editable document</SelectItem>
                  <SelectItem value="excel" className="text-xs">📊 Excel (.xls) — Spreadsheet</SelectItem>
                  <SelectItem value="csv" className="text-xs">📋 CSV — Data format</SelectItem>
                  <SelectItem value="json" className="text-xs">🔧 JSON — Raw data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Format description */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/10">
              <p className="text-[10px] text-muted-foreground">
                {exportFormat === 'pdf' && 'Generates a professionally formatted PDF with metadata tables, summaries, and PeaceVerse branding.'}
                {exportFormat === 'word' && 'Creates an editable Word document with structured sections, tables, and institutional formatting.'}
                {exportFormat === 'excel' && 'Exports all document properties into an Excel spreadsheet for data analysis.'}
                {exportFormat === 'csv' && 'Exports key-value pairs as CSV for use in databases or analytics tools.'}
                {exportFormat === 'json' && 'Raw JSON export containing all document fields and metadata.'}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setExportDoc(null)}>Cancel</Button>
            <Button size="sm" className="text-xs gap-1.5" onClick={handleExport}>
              <Download className="h-3 w-3" /> Download {exportFormat.toUpperCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
