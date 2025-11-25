import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Mic, FileText, Users, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const quickActions = [
  { icon: Mic, label: 'Share Story', path: '/community', color: 'bg-voice-active' },
  { icon: FileText, label: 'Create Proposal', path: '/proposals', color: 'bg-primary' },
  { icon: Users, label: 'Community Hub', path: '/community', color: 'bg-accent' },
  { icon: HelpCircle, label: 'Safety Portal', path: '/safety', color: 'bg-success' },
];

export default function QuickActionFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <>
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.path}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className={`${action.color} text-white shadow-lg hover:scale-110 transition-transform w-12 h-12`}
                        onClick={() => handleAction(action.path)}
                      >
                        <Icon className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className={`w-14 h-14 rounded-full shadow-xl transition-all ${
          isOpen ? 'rotate-45 bg-destructive hover:bg-destructive/90' : 'bg-peace-gradient'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
}
