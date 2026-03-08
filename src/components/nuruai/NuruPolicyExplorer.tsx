import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BookOpen, ChevronRight, ChevronDown, FileText, Sparkles, AlertTriangle,
  Users, DollarSign, Loader2, ArrowRight, Globe, Building2
} from 'lucide-react';
import { useCivicDocuments } from '@/hooks/useNuruAI';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const sb = supabase as any;

interface PolicySection {
  title: string;
  content: string;
  explanation?: string;
  impact?: string;
  isLoading?: boolean;
}

const NuruPolicyExplorer = () => {
  const { data: documents } = useCivicDocuments();
  const [selectedDocId, setSelectedDocId] = useState('');
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [sectionExplanations, setSectionExplanations] = useState<Record<number, { explanation: string; impact: string }>>({});
  const [loadingSection, setLoadingSection] = useState<number | null>(null);

  const selectedDoc = useMemo(() => documents?.find((d: any) => d.id === selectedDocId), [documents, selectedDocId]);

  // Parse document sections from parsed_sections or break original_text
  const sections: PolicySection[] = useMemo(() => {
    if (!selectedDoc) return [];

    if (selectedDoc.parsed_sections && Array.isArray(selectedDoc.parsed_sections)) {
      return (selectedDoc.parsed_sections as any[]).map((s: any) => ({
        title: s.title || s.heading || 'Section',
        content: s.content || s.text || '',
      }));
    }

    // Fall back to splitting original_text by paragraphs
    if (selectedDoc.original_text) {
      const paragraphs = selectedDoc.original_text.split(/\n\n+/).filter((p: string) => p.trim().length > 50);
      return paragraphs.slice(0, 20).map((p: string, i: number) => ({
        title: `Section ${i + 1}`,
        content: p.trim(),
      }));
    }

    // If we have a summary, show that
    if (selectedDoc.summary) {
      return [{ title: 'Document Summary', content: selectedDoc.summary }];
    }

    return [{ title: 'Document Overview', content: 'This document has been uploaded but has not yet been fully processed. Use the AI Chat to ask questions about it.' }];
  }, [selectedDoc]);

  const handleExplainSection = useCallback(async (index: number, section: PolicySection) => {
    if (sectionExplanations[index]) {
      setExpandedSection(expandedSection === index ? null : index);
      return;
    }

    setLoadingSection(index);
    setExpandedSection(index);

    try {
      const { data, error } = await supabase.functions.invoke('nuru-ai-chat', {
        body: {
          message: `Please explain this policy section in plain, accessible language that any citizen can understand. Also describe the potential impact on citizens and communities:\n\n"${section.content.substring(0, 2000)}"`,
          conversationId: null,
          documentId: selectedDocId,
        },
      });

      if (error) throw error;

      const response = data?.response || data?.message || 'Unable to generate explanation at this time.';

      // Split response into explanation and impact
      const parts = response.split(/impact|effects|consequences/i);
      setSectionExplanations(prev => ({
        ...prev,
        [index]: {
          explanation: parts[0]?.trim() || response,
          impact: parts[1]?.trim() || 'Impact analysis not available for this section.',
        },
      }));
    } catch (e) {
      toast.error('Failed to generate explanation');
      setSectionExplanations(prev => ({
        ...prev,
        [index]: {
          explanation: 'Unable to generate AI explanation at this time. Please try again.',
          impact: '',
        },
      }));
    } finally {
      setLoadingSection(null);
    }
  }, [sectionExplanations, expandedSection, selectedDocId]);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/15">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Interactive Policy Explorer</h2>
            <p className="text-[11px] text-muted-foreground">Browse documents section-by-section with AI-generated plain language explanations</p>
          </div>
        </div>

        {/* Document Selector */}
        <Select value={selectedDocId} onValueChange={setSelectedDocId}>
          <SelectTrigger className="h-10 text-xs">
            <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Select a document to explore..." />
          </SelectTrigger>
          <SelectContent>
            {documents?.map((doc: any) => (
              <SelectItem key={doc.id} value={doc.id} className="text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">{doc.document_type}</Badge>
                  {doc.title}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Document Overview */}
      {selectedDoc && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
          <h3 className="text-sm font-semibold mb-2">{selectedDoc.title}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className="text-[10px]">{selectedDoc.document_type}</Badge>
            {selectedDoc.country && <Badge variant="outline" className="text-[10px] gap-1"><Globe className="h-3 w-3" />{selectedDoc.country}</Badge>}
            {selectedDoc.institutions?.map((inst: string) => (
              <Badge key={inst} variant="outline" className="text-[10px] gap-1"><Building2 className="h-3 w-3" />{inst}</Badge>
            ))}
          </div>
          {selectedDoc.summary && (
            <p className="text-xs text-muted-foreground leading-relaxed">{selectedDoc.summary}</p>
          )}
        </motion.div>
      )}

      {/* Sections */}
      {selectedDoc && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground">POLICY SECTIONS ({sections.length})</h3>
            <p className="text-[10px] text-muted-foreground/60">Click "Explain" to get AI-powered plain language breakdown</p>
          </div>

          {sections.map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-primary/60">§{i + 1}</span>
                      <h4 className="text-sm font-semibold">{section.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{section.content}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 shrink-0"
                    onClick={() => handleExplainSection(i, section)}
                    disabled={loadingSection === i}
                  >
                    {loadingSection === i ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> Analyzing...</>
                    ) : sectionExplanations[i] ? (
                      <>{expandedSection === i ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />} {expandedSection === i ? 'Hide' : 'Show'}</>
                    ) : (
                      <><Sparkles className="h-3 w-3" /> Explain</>
                    )}
                  </Button>
                </div>
              </div>

              {/* AI Explanation */}
              <AnimatePresence>
                {expandedSection === i && sectionExplanations[i] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="border-t border-border/20 bg-gradient-to-b from-primary/[0.03] to-transparent">
                      <div className="p-4 space-y-4">
                        {/* Plain Language Explanation */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[11px] font-semibold text-primary">Plain Language Explanation</span>
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed">{sectionExplanations[i].explanation}</p>
                        </div>

                        {/* Impact Analysis */}
                        {sectionExplanations[i].impact && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Users className="h-3.5 w-3.5 text-amber-500" />
                              <span className="text-[11px] font-semibold text-amber-500">Citizen Impact</span>
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed">{sectionExplanations[i].impact}</p>
                          </div>
                        )}

                        <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          AI-generated explanation — verify with official sources
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {!selectedDoc && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Select a document to explore its policy sections</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Each section can be explained in plain language with impact analysis</p>
        </div>
      )}
    </div>
  );
};

export default NuruPolicyExplorer;
