import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RateLimitWarningProps {
  remainingRequests?: number;
  resetTime?: Date;
}

export default function RateLimitWarning({ remainingRequests = 5, resetTime }: RateLimitWarningProps) {
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (remainingRequests <= 5) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [remainingRequests]);

  useEffect(() => {
    if (!resetTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = resetTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('');
        setShow(false);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [resetTime]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <Alert variant={remainingRequests === 0 ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {remainingRequests === 0 ? 'Rate Limit Reached' : 'Approaching Rate Limit'}
            </AlertTitle>
            <AlertDescription className="flex items-center gap-2">
              {remainingRequests === 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Please wait {timeLeft} before trying again</span>
                </>
              ) : (
                <span>You have {remainingRequests} requests remaining</span>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
