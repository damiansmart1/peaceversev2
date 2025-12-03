import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertCircle, CheckCircle2, Clock, MapPin, Shield, Users, 
  FileText, Eye, AlertTriangle, ArrowRight, Activity,
  Calendar, Filter, TrendingUp, Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  severity_level: string;
  verification_status: string;
  location_city: string;
  location_country: string;
  created_at: string;
  incident_date: string | null;
  estimated_people_affected: number | null;
  casualties_reported: number | null;
  injuries_reported: number | null;
}

const statusSteps = [
  { key: 'pending', label: 'Reported', icon: FileText, color: 'bg-muted text-muted-foreground' },
  { key: 'under_review', label: 'Under Review', icon: Eye, color: 'bg-primary/20 text-primary' },
  { key: 'verified', label: 'Verified', icon: CheckCircle2, color: 'bg-secondary/20 text-secondary' },
  { key: 'escalated', label: 'Escalated', icon: AlertTriangle, color: 'bg-destructive/20 text-destructive' },
  { key: 'resolved', label: 'Resolved', icon: Shield, color: 'bg-success/20 text-success' },
];

const getStatusIndex = (status: string) => {
  const index = statusSteps.findIndex(s => s.key === status);
  return index >= 0 ? index : 0;
};

const severityColors: Record<string, string> = {
  critical: 'border-destructive bg-destructive/5',
  high: 'border-warning bg-warning/5',
  medium: 'border-primary bg-primary/5',
  low: 'border-secondary bg-secondary/5',
};

const categoryIcons: Record<string, any> = {
  violence: AlertTriangle,
  environmental: Activity,
  security: Shield,
  social: Users,
  displacement: MapPin,
};

export const IncidentTimeline = () => {
  const [filter, setFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incident-timeline', filter, severityFilter],
    queryFn: async () => {
      let query = supabase
        .from('citizen_reports')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      if (severityFilter !== 'all') {
        query = query.eq('severity_level', severityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TimelineEvent[];
    },
  });

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading timeline...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="ml-auto">
            {incidents?.length || 0} incidents
          </Badge>
        </div>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />

        <AnimatePresence>
          {incidents?.map((incident, index) => {
            const CategoryIcon = categoryIcons[incident.category] || AlertCircle;
            const statusIndex = getStatusIndex(incident.status);
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, x: isLeft ? -50 : 50, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex items-start gap-4 mb-8 ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Node */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                  className="absolute left-4 md:left-1/2 md:-translate-x-1/2 z-10"
                >
                  <div className={`w-5 h-5 rounded-full border-4 border-background ${
                    incident.severity_level === 'critical' ? 'bg-destructive' :
                    incident.severity_level === 'high' ? 'bg-warning' :
                    'bg-primary'
                  } shadow-lg`}>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-full h-full rounded-full bg-current opacity-30"
                    />
                  </div>
                </motion.div>

                {/* Content Card */}
                <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                  <Card className={`border-l-4 ${severityColors[incident.severity_level] || 'border-border'} hover:shadow-xl transition-all duration-300 overflow-hidden`}>
                    {/* Header */}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className={`p-2 rounded-lg ${
                              incident.severity_level === 'critical' ? 'bg-destructive/10' :
                              incident.severity_level === 'high' ? 'bg-warning/10' :
                              'bg-primary/10'
                            }`}
                          >
                            <CategoryIcon className={`w-4 h-4 ${
                              incident.severity_level === 'critical' ? 'text-destructive' :
                              incident.severity_level === 'high' ? 'text-warning' :
                              'text-primary'
                            }`} />
                          </motion.div>
                          <div>
                            <CardTitle className="text-sm font-semibold line-clamp-1">
                              {incident.title}
                            </CardTitle>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="w-3 h-3" />
                              <span>{incident.location_city}, {incident.location_country}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={
                          incident.severity_level === 'critical' ? 'destructive' :
                          incident.severity_level === 'high' ? 'default' :
                          'secondary'
                        } className="shrink-0 text-xs">
                          {incident.severity_level}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Description */}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {incident.description}
                      </p>

                      {/* Stats */}
                      {(incident.estimated_people_affected || incident.casualties_reported || incident.injuries_reported) && (
                        <div className="flex flex-wrap gap-2">
                          {incident.estimated_people_affected && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Users className="w-3 h-3" />
                              {incident.estimated_people_affected.toLocaleString()} affected
                            </Badge>
                          )}
                          {incident.casualties_reported > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {incident.casualties_reported} casualties
                            </Badge>
                          )}
                          {incident.injuries_reported > 0 && (
                            <Badge variant="outline" className="text-xs border-warning text-warning">
                              {incident.injuries_reported} injured
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Progress Steps */}
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          {statusSteps.map((step, stepIndex) => {
                            const StepIcon = step.icon;
                            const isCompleted = stepIndex <= statusIndex;
                            const isCurrent = stepIndex === statusIndex;

                            return (
                              <div key={step.key} className="flex items-center">
                                <motion.div
                                  initial={{ scale: 0.8, opacity: 0.5 }}
                                  animate={{ 
                                    scale: isCurrent ? 1.1 : 1, 
                                    opacity: isCompleted ? 1 : 0.4 
                                  }}
                                  transition={{ duration: 0.3 }}
                                  className={`relative flex flex-col items-center`}
                                >
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isCompleted ? step.color : 'bg-muted/50 text-muted-foreground/50'
                                  } ${isCurrent ? 'ring-2 ring-offset-2 ring-primary' : ''}`}>
                                    <StepIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <span className={`text-[10px] mt-1 whitespace-nowrap ${
                                    isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground/50'
                                  }`}>
                                    {step.label}
                                  </span>
                                  {isCurrent && (
                                    <motion.div
                                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                      transition={{ duration: 1.5, repeat: Infinity }}
                                      className="absolute inset-0 rounded-full bg-primary/30"
                                    />
                                  )}
                                </motion.div>
                                {stepIndex < statusSteps.length - 1 && (
                                  <div className={`w-4 h-0.5 mx-0.5 transition-colors duration-300 ${
                                    stepIndex < statusIndex ? 'bg-primary' : 'bg-muted'
                                  }`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(incident.created_at), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {incidents?.length === 0 && (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No incidents found matching your filters.</p>
          </Card>
        )}
      </div>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4 justify-center">
          <span className="text-sm font-medium text-muted-foreground">Severity:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-xs">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-xs">Low</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
