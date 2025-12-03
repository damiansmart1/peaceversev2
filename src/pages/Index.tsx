import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import SponsorsCarousel from "@/components/SponsorsCarousel";
import AfricaMap from "@/components/AfricaMap";
import { useNavigate } from "react-router-dom";
import { 
  Mic, Users, Radio, Award, Shield, Vote, Activity, AlertCircle,
  ArrowRight, Globe, Eye, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FeatureIcon = ({ 
  icon: Icon, 
  color, 
  onClick 
}: { 
  icon: React.ElementType; 
  color: string; 
  onClick?: () => void;
}) => (
  <motion.div
    className={`group cursor-pointer w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${color} flex items-center justify-center shadow-elevated transition-all hover:scale-110`}
    onClick={onClick}
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
  </motion.div>
);

const StatCard = ({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) => (
  <div className="text-center p-6 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
    <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
    <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">{value}</div>
    <div className="text-muted-foreground text-sm">{label}</div>
  </div>
);

const Index = () => {
  const navigate = useNavigate();

  const features = [
    { icon: AlertCircle, color: "bg-destructive", path: "/incidents", label: "Report" },
    { icon: Activity, color: "bg-primary", path: "/peace-pulse", label: "Analytics" },
    { icon: Users, color: "bg-secondary", path: "/community", label: "Community" },
    { icon: Shield, color: "bg-earth", path: "/safety", label: "Safety" },
    { icon: Vote, color: "bg-accent", path: "/proposals", label: "Vote" },
    { icon: Mic, color: "bg-voice-active", path: "/community", label: "Voice" },
    { icon: Radio, color: "bg-success", path: "/community", label: "Radio" },
    { icon: Award, color: "bg-gold", path: "/community", label: "Rewards" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      
      {/* Quick Access Features */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Everything You Need
            </h2>
            <p className="text-muted-foreground">One platform. Complete peace intelligence.</p>
          </motion.div>

          <motion.div 
            className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1 }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-2"
              >
                <FeatureIcon 
                  icon={feature.icon} 
                  color={feature.color} 
                  onClick={() => navigate(feature.path)}
                />
                <span className="text-sm text-muted-foreground font-medium">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">Live Monitoring</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">
              Continental Coverage
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Real-time incident tracking across all African nations
            </p>
          </motion.div>
          
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <AfricaMap />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-primary-foreground/70">Three simple steps to safer communities</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", icon: AlertCircle, title: "Report", desc: "Submit incident with location & evidence" },
              { step: "02", icon: Eye, title: "Verify", desc: "AI + human verification process" },
              { step: "03", icon: CheckCircle, title: "Act", desc: "Coordinated response & prevention" },
            ].map((item, i) => (
              <motion.div 
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-gold" />
                </div>
                <div className="text-gold text-sm font-bold mb-2">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-primary-foreground/70 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button 
              size="lg" 
              variant="secondary"
              className="gap-2 h-12"
              onClick={() => navigate('/incidents')}
            >
              Start Reporting
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <StatCard value="54" label="Countries Covered" icon={Globe} />
            <StatCard value="24/7" label="Real-time Monitoring" icon={Activity} />
            <StatCard value="AI" label="Powered Analysis" icon={Eye} />
            <StatCard value="100%" label="Verified Reports" icon={CheckCircle} />
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <SponsorsCarousel />
      
      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">PeaceVerse</h3>
                <p className="text-muted-foreground text-sm">Detect. Verify. Prevent.</p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate('/about')} className="hover:text-foreground transition-colors">About</button>
              <button onClick={() => navigate('/community')} className="hover:text-foreground transition-colors">Community</button>
              <button onClick={() => navigate('/safety')} className="hover:text-foreground transition-colors">Safety</button>
              <button onClick={() => navigate('/help')} className="hover:text-foreground transition-colors">Help</button>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
            <p>© 2025 PeaceVerse. Building safer communities across Africa.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
