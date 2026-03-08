import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, ArrowLeftRight, Globe, Building2 } from 'lucide-react';

interface CivicDocument {
  id: string;
  title: string;
  document_type: string;
  country?: string;
  original_text?: string;
  parsed_sections?: any[];
  summary?: string;
}

interface PolicyCompareViewProps {
  documents: CivicDocument[];
}

const parseSections = (doc: CivicDocument) => {
  if (doc.parsed_sections && Array.isArray(doc.parsed_sections)) {
    return doc.parsed_sections.map((s: any) => ({
      title: s.title || s.heading || 'Section',
      content: s.content || s.text || '',
    }));
  }
  if (doc.original_text) {
    return doc.original_text.split(/\n\n+/).filter((p: string) => p.trim().length > 50)
      .slice(0, 20).map((p: string, i: number) => ({ title: `Section ${i + 1}`, content: p.trim() }));
  }
  if (doc.summary) return [{ title: 'Summary', content: doc.summary }];
  return [{ title: 'No content', content: 'Document not yet processed.' }];
};

const PolicyCompareView = ({ documents }: PolicyCompareViewProps) => {
  const [leftDocId, setLeftDocId] = useState('');
  const [rightDocId, setRightDocId] = useState('');

  const leftDoc = documents.find(d => d.id === leftDocId);
  const rightDoc = documents.find(d => d.id === rightDocId);
  const leftSections = useMemo(() => leftDoc ? parseSections(leftDoc) : [], [leftDoc]);
  const rightSections = useMemo(() => rightDoc ? parseSections(rightDoc) : [], [rightDoc]);

  const maxSections = Math.max(leftSections.length, rightSections.length);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm font-semibold">
        <ArrowLeftRight className="h-4 w-4 text-primary" />
        Side-by-Side Document Comparison
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left selector */}
        <Select value={leftDocId} onValueChange={setLeftDocId}>
          <SelectTrigger className="h-9 text-xs">
            <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Select first document..." />
          </SelectTrigger>
          <SelectContent>
            {documents.map(doc => (
              <SelectItem key={doc.id} value={doc.id} className="text-xs" disabled={doc.id === rightDocId}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">{doc.document_type}</Badge>
                  {doc.title}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Right selector */}
        <Select value={rightDocId} onValueChange={setRightDocId}>
          <SelectTrigger className="h-9 text-xs">
            <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Select second document..." />
          </SelectTrigger>
          <SelectContent>
            {documents.map(doc => (
              <SelectItem key={doc.id} value={doc.id} className="text-xs" disabled={doc.id === leftDocId}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">{doc.document_type}</Badge>
                  {doc.title}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Document headers */}
      {leftDoc && rightDoc && (
        <div className="grid grid-cols-2 gap-4">
          {[leftDoc, rightDoc].map((doc, di) => (
            <div key={di} className="rounded-lg border border-border/30 bg-card/40 p-3">
              <h4 className="text-xs font-semibold mb-1">{doc.title}</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[9px]">{doc.document_type}</Badge>
                {doc.country && <Badge variant="outline" className="text-[9px] gap-1"><Globe className="h-2.5 w-2.5" />{doc.country}</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Side-by-side sections */}
      {leftDoc && rightDoc && (
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {Array.from({ length: maxSections }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                {[leftSections[i], rightSections[i]].map((section, si) => (
                  <div key={si} className={`rounded-lg border border-border/20 p-3 ${!section ? 'opacity-30' : ''}`}>
                    {section ? (
                      <>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold text-primary/60">§{i + 1}</span>
                          <h5 className="text-xs font-semibold">{section.title}</h5>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-6">{section.content}</p>
                      </>
                    ) : (
                      <p className="text-[10px] text-muted-foreground italic">No corresponding section</p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {(!leftDoc || !rightDoc) && (
        <div className="text-center py-12 text-muted-foreground">
          <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p className="text-xs">Select two documents to compare side by side</p>
        </div>
      )}
    </div>
  );
};

export default PolicyCompareView;
