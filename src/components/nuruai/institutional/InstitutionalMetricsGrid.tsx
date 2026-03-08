import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquareText, CheckCircle, AlertCircle, TrendingUp, Clock,
  Users, FileText, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface Metrics {
  totalQuestions: number;
  answered: number;
  unanswered: number;
  responseRate: number;
  avgResponseTime: string;
  documentsPublished: number;
  activeInstitutions: number;
  citizenSatisfaction: number;
}

interface Props {
  metrics: Metrics;
}

const metricConfig = [
  { key: 'totalQuestions', icon: MessageSquareText, label: 'Civic Questions', color: 'text-primary', bgColor: 'bg-primary/10', trend: '+12%', trendUp: true },
  { key: 'answered', icon: CheckCircle, label: 'Responded', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', trend: '+8%', trendUp: true },
  { key: 'unanswered', icon: AlertCircle, label: 'Pending Review', color: 'text-amber-500', bgColor: 'bg-amber-500/10', trend: '-3%', trendUp: false },
  { key: 'responseRate', icon: TrendingUp, label: 'Response Rate', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', suffix: '%', trend: '+5%', trendUp: true },
  { key: 'avgResponseTime', icon: Clock, label: 'Avg Response', color: 'text-violet-500', bgColor: 'bg-violet-500/10', isString: true },
  { key: 'documentsPublished', icon: FileText, label: 'Documents', color: 'text-blue-500', bgColor: 'bg-blue-500/10', trend: '+4', trendUp: true },
  { key: 'activeInstitutions', icon: Users, label: 'Active Institutions', color: 'text-orange-500', bgColor: 'bg-orange-500/10', trend: '+2', trendUp: true },
  { key: 'citizenSatisfaction', icon: BarChart3, label: 'Satisfaction', color: 'text-rose-500', bgColor: 'bg-rose-500/10', suffix: '%', trend: '+7%', trendUp: true },
] as const;

export const InstitutionalMetricsGrid = ({ metrics }: Props) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metricConfig.map((m, i) => {
        const value = m.isString
          ? (metrics as any)[m.key]
          : `${(metrics as any)[m.key]}${m.suffix || ''}`;
        return (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative p-3.5 rounded-xl border border-border/20 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-lg ${m.bgColor}`}>
                <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
              </div>
              {m.trend && (
                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${m.trendUp ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-amber-600 border-amber-200 bg-amber-50'}`}>
                  {m.trendUp ? <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" />}
                  {m.trend}
                </Badge>
              )}
            </div>
            <p className="text-lg font-bold tracking-tight">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
};
