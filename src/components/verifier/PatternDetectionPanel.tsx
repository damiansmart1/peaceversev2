import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, MapPin, Clock, Users, AlertTriangle, 
  ArrowUpRight, Target, Network, Calendar, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface Pattern {
  id: string;
  type: 'geographic' | 'temporal' | 'actor' | 'escalation';
  name: string;
  description: string;
  confidence: number;
  incidentCount: number;
  countries: string[];
  trend: 'increasing' | 'stable' | 'decreasing';
  lastDetected: string;
}

export const PatternDetectionPanel = () => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatterns = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('incident_patterns')
          .select('*')
          .eq('is_active', true)
          .order('confidence_score', { ascending: false })
          .limit(20);

        if (data) {
          setPatterns(data.map(p => ({
            id: p.id,
            type: p.pattern_type as any,
            name: p.pattern_name || 'Unnamed Pattern',
            description: p.description || '',
            confidence: p.confidence_score || 0,
            incidentCount: p.incident_count || 0,
            countries: p.countries_affected || [],
            trend: 'stable' as const,
            lastDetected: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'Unknown',
          })));
        }
      } catch (error) {
        console.error('Error fetching patterns:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatterns();
  }, []);

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'geographic': return MapPin;
      case 'temporal': return Calendar;
      case 'actor': return Users;
      case 'escalation': return TrendingUp;
      default: return Target;
    }
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'geographic': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      case 'temporal': return 'text-purple-500 bg-purple-500/10 border-purple-500/30';
      case 'actor': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'escalation': return 'text-red-500 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <ArrowUpRight className="w-4 h-4 text-green-500 rotate-90" />;
      default: return <div className="w-4 h-1 bg-gray-400 rounded" />;
    }
  };

  const filteredPatterns = activeTab === 'all' 
    ? patterns 
    : patterns.filter(p => p.type === activeTab);

  // Mock data for demo if no patterns exist
  const displayPatterns = patterns.length > 0 ? filteredPatterns : [
    {
      id: '1',
      type: 'geographic' as const,
      name: 'Cross-Border Activity Cluster',
      description: 'Increased incident correlation detected across Kenya-Uganda border regions',
      confidence: 87,
      incidentCount: 24,
      countries: ['Kenya', 'Uganda'],
      trend: 'increasing' as const,
      lastDetected: new Date().toLocaleDateString(),
    },
    {
      id: '2',
      type: 'temporal' as const,
      name: 'Weekly Peak Pattern',
      description: 'Incident spikes observed on weekends in urban centers',
      confidence: 72,
      incidentCount: 45,
      countries: ['Nigeria'],
      trend: 'stable' as const,
      lastDetected: new Date().toLocaleDateString(),
    },
    {
      id: '3',
      type: 'escalation' as const,
      name: 'Conflict Escalation Chain',
      description: 'Linked incidents showing progressive escalation pattern',
      confidence: 91,
      incidentCount: 12,
      countries: ['South Sudan', 'Ethiopia'],
      trend: 'increasing' as const,
      lastDetected: new Date().toLocaleDateString(),
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Network className="w-5 h-5 text-primary" />
            Pattern Detection
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Zap className="w-3 h-3" />
            AI-Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4">
            <TabsList className="grid w-full grid-cols-5 h-9">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="geographic" className="text-xs">Geo</TabsTrigger>
              <TabsTrigger value="temporal" className="text-xs">Time</TabsTrigger>
              <TabsTrigger value="actor" className="text-xs">Actor</TabsTrigger>
              <TabsTrigger value="escalation" className="text-xs">Escal</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[350px] mt-4">
            <div className="space-y-3 px-4 pb-4">
              {displayPatterns.map((pattern, index) => {
                const Icon = getPatternIcon(pattern.type);
                return (
                  <motion.div
                    key={pattern.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border ${getPatternColor(pattern.type)} cursor-pointer hover:shadow-md transition-all`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getPatternColor(pattern.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium text-sm truncate">{pattern.name}</h4>
                          {getTrendIcon(pattern.trend)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {pattern.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {pattern.confidence}% confidence
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {pattern.incidentCount} incidents
                          </span>
                        </div>
                        {pattern.countries.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            {pattern.countries.map(country => (
                              <Badge key={country} variant="outline" className="text-xs">
                                {country}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};
