import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import dashboardBg from '@/assets/dashboard-hero-bg.jpg';

interface DashboardHeroBannerProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actions?: ReactNode;
  backgroundImage?: string;
  accentColor?: string;
}

const DashboardHeroBanner = ({
  icon,
  title,
  subtitle,
  onRefresh,
  isRefreshing,
  actions,
  backgroundImage,
  accentColor = 'primary',
}: DashboardHeroBannerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-border/50"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage || dashboardBg}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 sm:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              className={`p-3 bg-${accentColor}/15 rounded-xl border border-${accentColor}/30 shadow-lg`}
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {icon}
            </motion.div>
            <div>
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.h1>
              <motion.p
                className="text-muted-foreground mt-1 text-sm sm:text-base"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {subtitle}
              </motion.p>
            </div>
          </div>

          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {actions}
            {onRefresh && (
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                className="gap-2 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card hover:border-gold/50 transition-all"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </motion.div>
  );
};

export default DashboardHeroBanner;
