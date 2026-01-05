import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Map, 
  FileText, 
  Shield, 
  Bell, 
  Download, 
  Users,
  Radio,
  AlertTriangle,
  Megaphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const QuickActionsPanel = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: BarChart3,
      label: 'Analytics Dashboard',
      description: 'View comprehensive metrics',
      color: 'text-blue-500',
      bgColor: 'hover:bg-blue-500/10',
      onClick: () => navigate('/peace-pulse'),
    },
    {
      icon: Map,
      label: 'Incident Heatmap',
      description: 'Geographic incident analysis',
      color: 'text-orange-500',
      bgColor: 'hover:bg-orange-500/10',
      onClick: () => navigate('/incidents'),
    },
    {
      icon: FileText,
      label: 'Policy Proposals',
      description: 'Review community proposals',
      color: 'text-purple-500',
      bgColor: 'hover:bg-purple-500/10',
      onClick: () => navigate('/proposals'),
    },
    {
      icon: Shield,
      label: 'Safety Resources',
      description: 'Manage safety information',
      color: 'text-green-500',
      bgColor: 'hover:bg-green-500/10',
      onClick: () => navigate('/safety'),
    },
    {
      icon: AlertTriangle,
      label: 'Early Warning',
      description: 'Predictive risk analysis',
      color: 'text-red-500',
      bgColor: 'hover:bg-red-500/10',
      onClick: () => navigate('/dashboard/early-warning'),
    },
    {
      icon: Users,
      label: 'Community Hub',
      description: 'Engage with citizens',
      color: 'text-teal-500',
      bgColor: 'hover:bg-teal-500/10',
      onClick: () => navigate('/community'),
    },
    {
      icon: Radio,
      label: 'Radio Broadcasts',
      description: 'Peace radio programs',
      color: 'text-amber-500',
      bgColor: 'hover:bg-amber-500/10',
      onClick: () => navigate('/radio'),
    },
    {
      icon: Download,
      label: 'Export Reports',
      description: 'Download data reports',
      color: 'text-indigo-500',
      bgColor: 'hover:bg-indigo-500/10',
      onClick: () => {},
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant="outline"
                className={`w-full h-auto flex flex-col items-center gap-2 p-4 ${action.bgColor} transition-colors`}
                onClick={action.onClick}
              >
                <action.icon className={`h-6 w-6 ${action.color}`} />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
