import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Mic2, 
  Siren, 
  HeartHandshake, 
  Vote, 
  Globe2, 
  Podcast, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface CitizenQuickActionsProps {
  accessibleFeatures: string[];
}

const CitizenQuickActions = ({ accessibleFeatures }: CitizenQuickActionsProps) => {
  const navigate = useNavigate();
  
  const hasFeature = (featureKey: string) => accessibleFeatures.includes(featureKey);

  const actions = [
    {
      key: 'community',
      icon: Mic2,
      title: 'Share Your Voice',
      description: 'Submit stories through Community Hub',
      path: '/community',
      color: 'from-primary to-primary/80',
    },
    {
      key: 'incidents',
      icon: Siren,
      title: 'Report Incidents',
      description: 'Help keep the community safe',
      path: '/incidents',
      color: 'from-red-500 to-red-600',
    },
    {
      key: 'challenges',
      icon: HeartHandshake,
      title: 'Join Challenges',
      description: 'Participate in peace-building activities',
      path: '/challenges',
      color: 'from-green-500 to-green-600',
    },
    {
      key: 'proposals',
      icon: Vote,
      title: 'Polls & Proposals',
      description: 'Vote on community decisions',
      path: '/proposals',
      color: 'from-blue-500 to-blue-600',
    },
    {
      key: 'peace-pulse',
      icon: Globe2,
      title: 'Peace Pulse',
      description: 'View peace metrics and trends',
      path: '/peace-pulse',
      color: 'from-purple-500 to-purple-600',
    },
    {
      key: 'radio',
      icon: Podcast,
      title: 'Peace Radio',
      description: 'Listen to community broadcasts',
      path: '/radio',
      color: 'from-amber-500 to-amber-600',
    },
    {
      key: 'safety',
      icon: ShieldCheck,
      title: 'Safety Portal',
      description: 'Access safety resources',
      path: '/safety',
      color: 'from-teal-500 to-teal-600',
    },
  ];

  const availableActions = actions.filter(action => hasFeature(action.key));

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-primary" />
          Quick Actions
        </CardTitle>
        <CardDescription>Jump to your most-used features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {availableActions.map((action, index) => (
            <motion.div
              key={action.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant="outline"
                className="w-full h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all hover:border-primary/50 group"
                onClick={() => navigate(action.path)}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {action.description}
                  </p>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CitizenQuickActions;
