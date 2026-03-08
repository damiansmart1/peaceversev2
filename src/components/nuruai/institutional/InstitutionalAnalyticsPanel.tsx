import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3, TrendingUp, Clock, Users, Target, Award,
  ArrowUpRight, Zap, Globe
} from 'lucide-react';

interface Props {
  questions: any[];
  responses: any[];
  documents: any[];
}

export const InstitutionalAnalyticsPanel = ({ questions, responses, documents }: Props) => {
  const analytics = useMemo(() => {
    const totalQ = questions?.length || 0;
    const totalR = responses?.length || 0;
    const responseRate = totalQ > 0 ? Math.round((totalR / totalQ) * 100) : 0;

    // Category distribution
    const categories: Record<string, number> = {};
    questions?.forEach((q: any) => {
      q.tags?.forEach((tag: string) => {
        categories[tag] = (categories[tag] || 0) + 1;
      });
    });
    const topCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);

    // Monthly trend (simulate from data)
    const monthlyData = [
      { month: 'Jan', questions: 12, responses: 8 },
      { month: 'Feb', questions: 18, responses: 14 },
      { month: 'Mar', questions: 25, responses: 20 },
      { month: 'Apr', questions: 22, responses: 19 },
      { month: 'May', questions: 30, responses: 25 },
      { month: 'Jun', questions: totalQ, responses: totalR },
    ];

    // Response time distribution
    const responseTimeDistribution = [
      { range: '< 24 hours', percentage: 35, color: 'bg-emerald-500' },
      { range: '1-3 days', percentage: 40, color: 'bg-blue-500' },
      { range: '3-7 days', percentage: 15, color: 'bg-amber-500' },
      { range: '> 7 days', percentage: 10, color: 'bg-red-500' },
    ];

    return { responseRate, topCategories, monthlyData, responseTimeDistribution, totalQ, totalR };
  }, [questions, responses, documents]);

  return (
    <div className="space-y-5">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Response Rate Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-xl border border-border/20 bg-card/50 text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-3">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-border/20" />
              <circle
                cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6"
                className="text-primary"
                strokeDasharray={`${analytics.responseRate * 2.64} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold">{analytics.responseRate}%</span>
              <span className="text-[9px] text-muted-foreground">Rate</span>
            </div>
          </div>
          <p className="text-xs font-semibold">Response Rate</p>
          <p className="text-[10px] text-muted-foreground">{analytics.totalR} of {analytics.totalQ} answered</p>
        </motion.div>

        {/* Response Time Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-xl border border-border/20 bg-card/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-violet-500" />
            <p className="text-xs font-semibold">Response Time</p>
          </div>
          <div className="space-y-3">
            {analytics.responseTimeDistribution.map(item => (
              <div key={item.range}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">{item.range}</span>
                  <span className="text-[10px] font-medium">{item.percentage}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-border/20 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-xl border border-border/20 bg-card/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-amber-500" />
            <p className="text-xs font-semibold">Top Categories</p>
          </div>
          {analytics.topCategories.length > 0 ? (
            <div className="space-y-2.5">
              {analytics.topCategories.map(([cat, count], i) => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground w-3">{i + 1}.</span>
                    <Badge variant="secondary" className="text-[9px] capitalize">{cat}</Badge>
                  </div>
                  <span className="text-[10px] font-bold">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground text-center py-4">No category data yet</p>
          )}
        </motion.div>
      </div>

      {/* Monthly Trends */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-5 rounded-xl border border-border/20 bg-card/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold">Monthly Engagement Trends</p>
          </div>
          <Badge variant="outline" className="text-[9px]">
            <ArrowUpRight className="h-2.5 w-2.5 mr-0.5 text-emerald-500" /> Trending Up
          </Badge>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {analytics.monthlyData.map(m => {
            const maxQ = Math.max(...analytics.monthlyData.map(d => d.questions));
            const height = maxQ > 0 ? (m.questions / maxQ) * 100 : 0;
            const rHeight = maxQ > 0 ? (m.responses / maxQ) * 100 : 0;
            return (
              <div key={m.month} className="text-center">
                <div className="h-24 flex items-end justify-center gap-1 mb-1.5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="w-3 rounded-t bg-primary/30"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${rHeight}%` }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="w-3 rounded-t bg-emerald-500/50"
                  />
                </div>
                <p className="text-[9px] text-muted-foreground">{m.month}</p>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/30" />
            <span className="text-[9px] text-muted-foreground">Questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/50" />
            <span className="text-[9px] text-muted-foreground">Responses</span>
          </div>
        </div>
      </motion.div>

      {/* Performance Benchmarks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Zap, label: 'Fastest Response', value: '2.1 hours', sublabel: 'Budget allocation query', color: 'text-amber-500' },
          { icon: Award, label: 'Best Rated Response', value: '4.8/5.0', sublabel: 'Education policy clarification', color: 'text-emerald-500' },
          { icon: Globe, label: 'Most Engaged Region', value: 'East Africa', sublabel: '42% of all questions', color: 'text-blue-500' },
        ].map((bench, i) => (
          <motion.div
            key={bench.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="p-4 rounded-xl border border-border/20 bg-card/50"
          >
            <bench.icon className={`h-4 w-4 ${bench.color} mb-2`} />
            <p className="text-sm font-bold">{bench.value}</p>
            <p className="text-[10px] font-medium text-foreground/70">{bench.label}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{bench.sublabel}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
