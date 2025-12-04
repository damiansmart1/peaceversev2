import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  AlertTriangle, 
  Clock, 
  Shield, 
  Users, 
  Building2, 
  Heart, 
  Radio, 
  MapPin,
  CheckCircle2,
  ArrowRight,
  Zap,
  Calendar,
  Target
} from 'lucide-react';

interface RecommendedAction {
  action: string;
  priority: 'immediate' | 'urgent' | 'high' | 'medium' | 'low';
  target: string;
  category: string;
  timeframe: string;
  rationale?: string;
  resources?: string[];
  kpis?: string[];
}

interface RecommendedActionsPanelProps {
  actions: RecommendedAction[];
  threatLevel: string;
  incidentCategory?: string;
}

const priorityConfig = {
  immediate: { 
    color: 'bg-red-600 text-white border-red-600', 
    icon: Zap,
    label: 'Immediate (0-6 hrs)',
    bgColor: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
  },
  urgent: { 
    color: 'bg-orange-500 text-white border-orange-500', 
    icon: AlertTriangle,
    label: 'Urgent (6-24 hrs)',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
  },
  high: { 
    color: 'bg-yellow-500 text-black border-yellow-500', 
    icon: Clock,
    label: 'High (24-72 hrs)',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
  },
  medium: { 
    color: 'bg-forest text-white border-forest', 
    icon: Calendar,
    label: 'Medium (3-14 days)',
    bgColor: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
  },
  low: { 
    color: 'bg-primary text-white border-primary', 
    icon: Target,
    label: 'Long-term (2+ weeks)',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
  }
};

const categoryConfig: Record<string, { icon: typeof Shield; label: string }> = {
  security: { icon: Shield, label: 'Security & Protection' },
  humanitarian: { icon: Heart, label: 'Humanitarian Response' },
  government: { icon: Building2, label: 'Government Action' },
  community: { icon: Users, label: 'Community Engagement' },
  communication: { icon: Radio, label: 'Communication & Media' },
  logistics: { icon: MapPin, label: 'Logistics & Coordination' }
};

const RecommendedActionsPanel = ({ actions, threatLevel, incidentCategory }: RecommendedActionsPanelProps) => {
  // Group actions by priority
  const groupedByPriority = actions.reduce((acc, action) => {
    const priority = action.priority || 'medium';
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(action);
    return acc;
  }, {} as Record<string, RecommendedAction[]>);

  // Group actions by category
  const groupedByCategory = actions.reduce((acc, action) => {
    const category = action.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(action);
    return acc;
  }, {} as Record<string, RecommendedAction[]>);

  const priorityOrder = ['immediate', 'urgent', 'high', 'medium', 'low'];

  return (
    <Card className="border-2 border-gold/30 bg-gradient-to-br from-cream/5 to-gold/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="w-5 h-5 text-forest" />
            Evidence-Based Recommended Actions
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {actions.length} Actions
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Based on UN OCHA, OECD Crisis Management, and Red Cross humanitarian response protocols
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Priority-based view */}
        <Accordion type="single" collapsible defaultValue="immediate" className="space-y-2">
          {priorityOrder.map(priority => {
            const actionsForPriority = groupedByPriority[priority];
            if (!actionsForPriority || actionsForPriority.length === 0) return null;
            
            const config = priorityConfig[priority as keyof typeof priorityConfig];
            const PriorityIcon = config.icon;
            
            return (
              <AccordionItem 
                key={priority} 
                value={priority}
                className={`border rounded-lg ${config.bgColor}`}
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge className={config.color}>
                      <PriorityIcon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                    <span className="text-sm font-medium">
                      {actionsForPriority.length} action{actionsForPriority.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {actionsForPriority.map((action, idx) => {
                      const catConfig = categoryConfig[action.category] || categoryConfig.community;
                      const CategoryIcon = catConfig.icon;
                      
                      return (
                        <div 
                          key={idx} 
                          className="bg-background/80 rounded-lg p-3 border border-border/50 space-y-2"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded bg-primary/10">
                              <CategoryIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="font-medium text-sm leading-tight">{action.action}</p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <ArrowRight className="w-3 h-3" />
                                  <span className="font-medium text-foreground">{action.target}</span>
                                </span>
                                {action.timeframe && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {action.timeframe}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {action.rationale && (
                            <div className="pl-9 text-xs text-muted-foreground italic">
                              <span className="font-semibold not-italic">Rationale:</span> {action.rationale}
                            </div>
                          )}
                          
                          {action.resources && action.resources.length > 0 && (
                            <div className="pl-9">
                              <p className="text-xs font-semibold mb-1">Required Resources:</p>
                              <div className="flex flex-wrap gap-1">
                                {action.resources.map((resource, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs py-0">
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {action.kpis && action.kpis.length > 0 && (
                            <div className="pl-9">
                              <p className="text-xs font-semibold mb-1">Success Indicators:</p>
                              <ul className="text-xs text-muted-foreground space-y-0.5">
                                {action.kpis.map((kpi, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <CheckCircle2 className="w-3 h-3 mt-0.5 text-forest flex-shrink-0" />
                                    {kpi}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Category Summary */}
        <div className="border-t pt-4 mt-4">
          <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Actions by Stakeholder
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(groupedByCategory).map(([category, categoryActions]) => {
              const config = categoryConfig[category] || { icon: Users, label: category };
              const Icon = config.icon;
              return (
                <Badge key={category} variant="outline" className="gap-1 py-1">
                  <Icon className="w-3 h-3" />
                  {config.label}: {categoryActions.length}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Framework Reference */}
        <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
          <p className="font-semibold mb-1">Response Framework Standards Applied:</p>
          <ul className="grid grid-cols-2 gap-1">
            <li>• UN OCHA Emergency Response</li>
            <li>• Sphere Humanitarian Standards</li>
            <li>• OECD Crisis Management</li>
            <li>• ICRC Protection Guidelines</li>
            <li>• Community Early Warning (CEWARN)</li>
            <li>• AU Continental Framework</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedActionsPanel;
