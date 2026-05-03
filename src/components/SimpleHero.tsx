import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import heroImage from "@/assets/hero-image.jpg";
import { HUBS } from "@/lib/hubs";
import ReportWizard from "@/components/ReportWizard";

/**
 * Personalized homepage hero.
 * - Guests: "What do you need right now?" + 4 big hub buttons.
 * - Logged-in: warm greeting + clear primary action toward their dashboard.
 * Replaces the dense HeroSection at the top of /; the rest of the marketing
 * page (frameworks, map, how-it-works) still scrolls below.
 */
const SimpleHero = () => {
  const navigate = useNavigate();
  const { user, isAnonymous } = useAuth();
  const { data: profile } = useUserProfile();
  const [wizardOpen, setWizardOpen] = useState(false);

  const isLoggedIn = !!user && !isAnonymous;
  const safeProfile = profile as any;
  const firstName =
    safeProfile?.display_name?.split(" ")[0] ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "friend";

  return (
    <section className="relative min-h-[88svh] flex items-center justify-center overflow-hidden bg-background">
      {/* Background image with calm overlay */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="African communities united for peace" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <p className="eyebrow text-gold">PeaceVerse · Detect. Verify. Prevent.</p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              {isLoggedIn ? (
                <>Welcome back, <span className="text-primary">{firstName}</span>.</>
              ) : (
                <>What do you need <span className="text-gradient-gold">right now?</span></>
              )}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              {isLoggedIn
                ? "Pick up where you left off, or jump into one of the four hubs."
                : "PeaceVerse organises everything around four simple jobs. Tap one to begin."}
            </p>
          </motion.div>

          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <Button size="lg" onClick={() => navigate("/dashboard")} className="gap-2">
                Go to my dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setWizardOpen(true)} className="gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                New report
              </Button>
            </motion.div>
          )}

          {/* 4 hub buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4"
          >
            {HUBS.map((hub) => {
              const Icon = hub.icon;
              const onClick =
                hub.key === "report"
                  ? () => setWizardOpen(true)
                  : () => navigate(hub.primaryPath);
              return (
                <motion.button
                  key={hub.key}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClick}
                  className="group relative bg-card/80 backdrop-blur-sm border border-border/60 hover:border-primary/40 rounded-2xl p-5 sm:p-6 text-left transition-all"
                >
                  <Icon className={`w-6 h-6 sm:w-7 sm:h-7 mb-3 ${hub.accent}`} />
                  <p className="font-bold text-base sm:text-lg text-foreground">{hub.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{hub.tagline}</p>
                  <ArrowRight className="absolute top-5 right-5 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </motion.button>
              );
            })}
          </motion.div>

          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 pt-2"
            >
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth">
                  <Sparkles className="w-4 h-4" />
                  Sign in or join
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/about">Learn more</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <ReportWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </section>
  );
};

export default SimpleHero;
