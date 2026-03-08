import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BookOpen, FileText, Globe, Building2, ArrowLeftRight, BookmarkIcon,
} from 'lucide-react';
import { useCivicDocuments } from '@/hooks/useNuruAI';
import { usePolicyBookmarks, useReadingProgress } from '@/hooks/usePolicyExplorer';
import { useContentTranslation } from '@/hooks/useContentTranslation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import PolicySearchFilter from './explorer/PolicySearchFilter';
import PolicyTableOfContents from './explorer/PolicyTableOfContents';
import PolicySectionCard from './explorer/PolicySectionCard';
import PolicyCompareView from './explorer/PolicyCompareView';
import PolicyExportShare from './explorer/PolicyExportShare';

interface PolicySection {
  title: string;
  content: string;
}

const NuruPolicyExplorer = () => {
  const { data: documents } = useCivicDocuments();
  const [selectedDocId, setSelectedDocId] = useState('');
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [sectionExplanations, setSectionExplanations] = useState<Record<number, { explanation: string; impact: string }>>({});
  const [loadingSection, setLoadingSection] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopics, setActiveTopics] = useState<string[]>([]);
  const [translatedSections, setTranslatedSections] = useState<Record<number, string>>({});
  const [translatingSections, setTranslatingSections] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState('explore');

  const selectedDoc = useMemo(() => documents?.find((d: any) => d.id === selectedDocId), [documents, selectedDocId]);

  const { bookmarks, addBookmark, removeBookmark, updateBookmark } = usePolicyBookmarks(selectedDocId);

  const sections: PolicySection[] = useMemo(() => {
    if (!selectedDoc) return [];
    if (selectedDoc.parsed_sections && Array.isArray(selectedDoc.parsed_sections) && selectedDoc.parsed_sections.length > 0) {
      const mapped = (selectedDoc.parsed_sections as any[])
        .filter((s: any) => (s.content || s.text) && (s.content || s.text).length > 20)
        .map((s: any) => ({
          title: s.title || s.heading || 'Section',
          content: s.content || s.text || '',
        }));
      if (mapped.length > 0) return mapped;
    }
    if (selectedDoc.original_text) {
      const paragraphs = selectedDoc.original_text.split(/\n\n+/).filter((p: string) => p.trim().length > 50);
      return paragraphs.slice(0, 40).map((p: string, i: number) => {
        const lines = p.trim().split('\n');
        const firstLine = lines[0].trim();
        const isHeading = firstLine.length < 100 && (firstLine === firstLine.toUpperCase() || /^(PART|CHAPTER|SECTION|ARTICLE|SCHEDULE|\d+\.)/i.test(firstLine));
        return {
          title: isHeading ? firstLine : `Section ${i + 1}`,
          content: isHeading && lines.length > 1 ? lines.slice(1).join('\n').trim() : p.trim(),
        };
      });
    }
    if (selectedDoc.summary) return [{ title: 'Document Summary', content: selectedDoc.summary }];
    return [{ title: 'Document Overview', content: 'This document has not yet been fully processed.' }];
  }, [selectedDoc]);

  const { progress, markSectionRead, percentComplete } = useReadingProgress(selectedDocId, sections.length);

  const topics = useMemo(() => selectedDoc?.topics || [], [selectedDoc]);

  const filteredSections = useMemo(() => {
    if (!searchQuery && activeTopics.length === 0) return sections.map((s, i) => ({ ...s, originalIndex: i }));
    return sections
      .map((s, i) => ({ ...s, originalIndex: i }))
      .filter(s => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q);
        }
        return true;
      });
  }, [sections, searchQuery, activeTopics]);

  const bookmarkedSectionIndices = useMemo(
    () => bookmarks.map(b => b.section_index),
    [bookmarks]
  );

  const { translateText } = useContentTranslation();

  const handleExplainSection = useCallback(async (index: number, section: PolicySection) => {
    if (sectionExplanations[index]) {
      setExpandedSection(expandedSection === index ? null : index);
      return;
    }
    setLoadingSection(index);
    setExpandedSection(index);
    markSectionRead.mutate(index);

    try {
      const { data, error } = await supabase.functions.invoke('nuru-ai-chat', {
        body: {
          message: `Please explain this policy section in plain, accessible language that any citizen can understand. Also describe the potential impact on citizens and communities:\n\n"${section.content.substring(0, 2000)}"`,
          conversationId: null,
          documentId: selectedDocId,
        },
      });
      if (error) throw new Error(error?.message || error?.context?.message || JSON.stringify(error));
      if (data?.error) throw new Error(data.error);

      const response = data?.response || data?.message || 'Unable to generate explanation.';
      const parts = response.split(/impact|effects|consequences/i);
      setSectionExplanations(prev => ({
        ...prev,
        [index]: {
          explanation: parts[0]?.trim() || response,
          impact: parts[1]?.trim() || 'Impact analysis not available.',
        },
      }));
    } catch (err: any) {
      const msg = err?.message || err?.error || '';
      if (msg.includes('credits') || msg.includes('402')) {
        toast.error('AI credits depleted. Please top up your workspace credits to continue.');
      } else if (msg.includes('429') || msg.includes('rate limit')) {
        toast.error('Rate limit reached. Please wait a moment and try again.');
      } else {
        toast.error('Failed to generate explanation. Please try again.');
      }
      setSectionExplanations(prev => ({
        ...prev,
        [index]: { explanation: msg.includes('credits') ? 'AI credits depleted. Please contact your administrator to top up credits.' : 'Unable to generate explanation. Please try again.', impact: '' },
      }));
    } finally {
      setLoadingSection(null);
    }
  }, [sectionExplanations, expandedSection, selectedDocId, markSectionRead]);

  const handleToggleBookmark = useCallback((index: number, title: string) => {
    const existing = bookmarks.find(b => b.section_index === index);
    if (existing) {
      removeBookmark.mutate(existing.id);
    } else {
      addBookmark.mutate({ sectionIndex: index, sectionTitle: title, bookmarkType: 'bookmark' });
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  const handleAddNote = useCallback((index: number, title: string, note: string) => {
    const existing = bookmarks.find(b => b.section_index === index);
    if (existing) {
      updateBookmark.mutate({ id: existing.id, note });
    } else {
      addBookmark.mutate({ sectionIndex: index, sectionTitle: title, bookmarkType: 'annotation', note });
    }
  }, [bookmarks, addBookmark, updateBookmark]);

  const handleTranslateSection = useCallback(async (index: number, content: string) => {
    setTranslatingSections(prev => ({ ...prev, [index]: true }));
    try {
      const translated = await translateText(content);
      setTranslatedSections(prev => ({ ...prev, [index]: translated }));
    } catch {
      toast.error('Translation failed');
    } finally {
      setTranslatingSections(prev => ({ ...prev, [index]: false }));
    }
  }, [translateText]);

  const handleShareSection = useCallback(async (section: PolicySection, index: number) => {
    const text = `§${index + 1} ${section.title}\n\n${section.content.substring(0, 200)}...\n\nExplored on PeaceVerse`;
    if (navigator.share) {
      try { await navigator.share({ title: section.title, text, url: window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Section link copied');
    }
  }, []);

  const handleSelectSection = useCallback((index: number) => {
    setExpandedSection(index);
    document.getElementById(`policy-section-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleToggleTopic = useCallback((topic: string) => {
    setActiveTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/15">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Interactive Policy Explorer</h2>
              <p className="text-[11px] text-muted-foreground">Browse, annotate, translate, and compare policy documents with AI</p>
            </div>
          </div>
          {selectedDoc && sections.length > 0 && (
            <PolicyExportShare documentTitle={selectedDoc.title} sections={sections} explanations={sectionExplanations} />
          )}
        </div>

        <Select value={selectedDocId} onValueChange={(v) => { setSelectedDocId(v); setSearchQuery(''); setActiveTopics([]); setSectionExplanations({}); setTranslatedSections({}); setExpandedSection(null); }}>
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

      {/* Tabs: Explore vs Compare */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9">
          <TabsTrigger value="explore" className="text-xs gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Explore</TabsTrigger>
          <TabsTrigger value="compare" className="text-xs gap-1.5"><ArrowLeftRight className="h-3.5 w-3.5" /> Compare</TabsTrigger>
          <TabsTrigger value="bookmarks" className="text-xs gap-1.5"><BookmarkIcon className="h-3.5 w-3.5" /> Bookmarks ({bookmarks.length})</TabsTrigger>
        </TabsList>

        {/* EXPLORE TAB */}
        <TabsContent value="explore" className="mt-4">
          {selectedDoc && (
            <>
              {/* Document overview + progress */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5 mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">{selectedDoc.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px]">{selectedDoc.document_type}</Badge>
                      {selectedDoc.country && <Badge variant="outline" className="text-[10px] gap-1"><Globe className="h-3 w-3" />{selectedDoc.country}</Badge>}
                      {selectedDoc.institutions?.map((inst: any, idx: number) => {
                        const name = typeof inst === 'string' ? inst : (inst?.NAME || inst?.name || JSON.stringify(inst));
                        return (
                          <Badge key={idx} variant="outline" className="text-[10px] gap-1"><Building2 className="h-3 w-3" />{name}</Badge>
                        );
                      })}
                    </div>
                    {selectedDoc.summary && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{selectedDoc.summary}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-muted-foreground">Reading Progress</span>
                    <p className="text-lg font-bold text-primary">{percentComplete}%</p>
                    <Progress value={percentComplete} className="w-24 h-1.5 mt-1" />
                  </div>
                </div>
              </motion.div>

              {/* Search + Filter */}
              <div className="mb-4">
                <PolicySearchFilter
                  topics={topics}
                  activeTopics={activeTopics}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onToggleTopic={handleToggleTopic}
                  onClearFilters={() => { setSearchQuery(''); setActiveTopics([]); }}
                  resultCount={filteredSections.length}
                  totalCount={sections.length}
                />
              </div>

              {/* Main content with TOC sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
                <div className="hidden lg:block">
                  <PolicyTableOfContents
                    sections={sections}
                    activeSectionIndex={expandedSection}
                    onSelectSection={handleSelectSection}
                    sectionsRead={progress?.sections_read || []}
                    bookmarkedSections={bookmarkedSectionIndices}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground">
                      POLICY SECTIONS ({filteredSections.length}{filteredSections.length !== sections.length ? ` / ${sections.length}` : ''})
                    </h3>
                    <p className="text-[10px] text-muted-foreground/60">Click "Explain" for AI breakdown</p>
                  </div>

                  {filteredSections.map(section => {
                    const i = section.originalIndex;
                    const bookmark = bookmarks.find(b => b.section_index === i);
                    return (
                      <PolicySectionCard
                        key={i}
                        index={i}
                        title={section.title}
                        content={section.content}
                        explanation={sectionExplanations[i]?.explanation}
                        impact={sectionExplanations[i]?.impact}
                        isExpanded={expandedSection === i}
                        isLoading={loadingSection === i}
                        isBookmarked={!!bookmark}
                        isRead={(progress?.sections_read || []).includes(i)}
                        bookmarkNote={bookmark?.note || undefined}
                        onExplain={() => handleExplainSection(i, section)}
                        onToggleBookmark={() => handleToggleBookmark(i, section.title)}
                        onAddNote={(note) => handleAddNote(i, section.title, note)}
                        onTranslate={() => handleTranslateSection(i, section.content)}
                        onShare={() => handleShareSection(section, i)}
                        isTranslating={translatingSections[i]}
                        translatedContent={translatedSections[i]}
                        searchHighlight={searchQuery}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {!selectedDoc && (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Select a document to explore its policy sections</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Search, annotate, translate, and export with AI explanations</p>
            </div>
          )}
        </TabsContent>

        {/* COMPARE TAB */}
        <TabsContent value="compare" className="mt-4">
          <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
            <PolicyCompareView documents={documents || []} />
          </div>
        </TabsContent>

        {/* BOOKMARKS TAB */}
        <TabsContent value="bookmarks" className="mt-4">
          <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BookmarkIcon className="h-4 w-4 text-primary" />
              Your Bookmarks & Annotations
            </h3>
            {bookmarks.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <BookmarkIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No bookmarks yet. Bookmark sections while exploring to save them here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {bookmarks.map(bm => (
                  <div key={bm.id} className="rounded-lg border border-border/20 p-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-primary/60">§{bm.section_index + 1}</span>
                        <span className="text-xs font-semibold">{bm.section_title}</span>
                        <Badge variant="outline" className="text-[9px]">{bm.bookmark_type}</Badge>
                      </div>
                      {bm.note && <p className="text-[11px] text-muted-foreground">{bm.note}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => handleSelectSection(bm.section_index)}>
                        Go to
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] text-destructive" onClick={() => removeBookmark.mutate(bm.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NuruPolicyExplorer;
