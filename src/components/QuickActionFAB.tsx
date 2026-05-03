import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import ReportWizard from '@/components/ReportWizard';

/**
 * Single global FAB → opens the 3-step Report wizard.
 * Replaces the previous fan-out menu (which duplicated entry-points).
 */
export default function QuickActionFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 hidden lg:block">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            aria-label="New report"
            className="w-14 h-14 rounded-full shadow-xl bg-peace-gradient text-white"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>
      <ReportWizard open={open} onOpenChange={setOpen} />
    </>
  );
}
