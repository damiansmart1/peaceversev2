import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Download, RefreshCw, FileText, Zap, BookOpen, Grid3x3 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import type { PartnerAnalyticsData } from '@/hooks/usePartnerAnalytics';

interface Props {
  analytics: PartnerAnalyticsData | undefined;
  dateRange: { from?: string; to?: string };
  countryFilter: string;
}

type BriefingType = 'sitrep' | 'flash' | 'exec_summary' | '3w_matrix';

const TYPES: { value: BriefingType; label: string; icon: any; description: string }[] = [
  { value: 'sitrep', label: 'SITREP', icon: FileText, description: 'OCHA-aligned Situation Report' },
  { value: 'flash', label: 'Flash Update', icon: Zap, description: 'Short, urgent alert' },
  { value: 'exec_summary', label: 'Executive Brief', icon: BookOpen, description: '1-page decision-grade summary' },
  { value: '3w_matrix', label: '3W Matrix', icon: Grid3x3, description: 'Who / What / Where coordination' },
];

export const PartnerIntelligenceBriefings = ({ analytics, dateRange, countryFilter }: Props) => {
  const [active, setActive] = useState<BriefingType>('sitrep');
  const [content, setContent] = useState<Record<BriefingType, string>>({
    sitrep: '', flash: '', exec_summary: '', '3w_matrix': '',
  });
  const [loading, setLoading] = useState<BriefingType | null>(null);

  const generate = async (type: BriefingType) => {
    if (!analytics) {
      toast.error('Analytics data still loading');
      return;
    }
    setLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke('partner-briefing', {
        body: {
          type,
          context: {
            overview: analytics.overview,
            topCategories: analytics.categoryBreakdown.slice(0, 8),
            topCountries: analytics.geographicDistribution.slice(0, 10),
            hotspots: analytics.hotspots.slice(0, 10),
            riskAssessment: analytics.riskAssessment,
            dateRange,
            countryFilter,
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setContent(prev => ({ ...prev, [type]: data.content }));
      toast.success(`${type.toUpperCase()} generated`);
    } catch (e: any) {
      toast.error(e.message || 'Could not generate briefing');
    } finally {
      setLoading(null);
    }
  };

  const download = (type: BriefingType) => {
    const text = content[type];
    if (!text) return;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peaceverse-${type}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Intelligence Briefings
            </CardTitle>
            <CardDescription>
              OCHA-aligned reports generated from current analytics snapshot
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">Lovable AI</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={active} onValueChange={(v) => setActive(v as BriefingType)}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            {TYPES.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="gap-2 text-xs">
                <t.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {TYPES.map(t => (
            <TabsContent key={t.value} value={t.value} className="mt-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <p className="font-medium text-sm">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => generate(t.value)} disabled={loading === t.value} className="gap-2">
                    <RefreshCw className={`w-4 h-4 ${loading === t.value ? 'animate-spin' : ''}`} />
                    {content[t.value] ? 'Regenerate' : 'Generate'}
                  </Button>
                  {content[t.value] && (
                    <Button size="sm" variant="outline" onClick={() => download(t.value)} className="gap-2">
                      <Download className="w-4 h-4" /> .md
                    </Button>
                  )}
                </div>
              </div>

              {loading === t.value ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : content[t.value] ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ScrollArea className="h-[480px] rounded-lg border bg-muted/20 p-4">
                    <article className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{content[t.value]}</ReactMarkdown>
                    </article>
                  </ScrollArea>
                </motion.div>
              ) : (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Click <strong>Generate</strong> to produce an AI {t.label}.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
