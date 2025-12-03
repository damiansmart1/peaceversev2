import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import SponsorsCarousel from "@/components/SponsorsCarousel";
import AfricaMap from "@/components/AfricaMap";
import { useNavigate } from "react-router-dom";
import { 
  Mic, Users, Radio, Award, Shield, Vote, Activity, AlertCircle,
  ArrowRight, Globe, Eye, CheckCircle, Zap, BarChart3, MapPin, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const Index = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress: featuresProgress } = useScroll({
    target: featuresRef,
    offset: ["start end", "end start"]
  });
  
  const featuresY = useTransform(featuresProgress, [0, 1], [100, -100]);

  const features = [
    { icon: AlertCircle, color: "bg-destructive", path: "/incidents", label: "Report", desc: "Submit incidents" },
    { icon: Activity, color: "bg-primary", path: "/peace-pulse", label: "Analytics", desc: "Live data" },
    { icon: Users, color: "bg-secondary", path: "/community", label: "Community", desc: "Connect" },
    { icon: Shield, color: "bg-earth", path: "/safety", label: "Safety", desc: "Protection" },
    { icon: Vote, color: "bg-accent", path: "/proposals", label: "Vote", desc: "Democracy" },
    { icon: Mic, color: "bg-voice-active", path: "/community", label: "Voice", desc: "Share stories" },
  ];

  const processSteps = [
    { step: "01", icon: AlertCircle, title: "Report", desc: "Citizens submit geo-tagged incidents with evidence" },
    { step: "02", icon: Eye, title: "Verify", desc: "AI + human verification ensures accuracy" },
    { step: "03", icon: Bell, title: "Alert", desc: "Real-time alerts to relevant stakeholders" },
    { step: "04", icon: CheckCircle, title: "Respond", desc: "Coordinated action and prevention" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      <HeroSection />
      
      {/* Features Bento Grid */}
      <section ref={featuresRef} className="py-20 bg-background relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.span 
              className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Platform Features
            </motion.span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Everything in <span className="text-primary">One Place</span>
            </h2>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.label}
                className={`group cursor-pointer relative overflow-hidden rounded-2xl p-6 ${feature.color} transition-all duration-500 hover:shadow-2xl ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => navigate(feature.path)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <feature.icon className={`${i === 0 ? 'w-12 h-12' : 'w-8 h-8'} text-white mb-3 group-hover:scale-110 transition-transform`} />
                <h3 className={`font-bold text-white ${i === 0 ? 'text-2xl mb-2' : 'text-lg'}`}>{feature.label}</h3>
                <p className={`text-white/70 ${i === 0 ? 'text-base' : 'text-xs'}`}>{feature.desc}</p>
                <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section ref={mapRef} className="py-20 bg-muted/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left - Map */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-success/20 rounded-3xl blur-3xl opacity-30" />
              <div className="relative bg-card rounded-2xl border border-border overflow-hidden shadow-elevated">
                <AfricaMap />
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold tracking-wider uppercase mb-4">
                <Globe className="w-4 h-4" />
                Continental Coverage
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
                Real-time Intelligence Across <span className="text-primary">54 Nations</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Our advanced monitoring system tracks incidents, analyzes patterns, and predicts hotspots across the entire African continent in real-time.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: MapPin, label: "Geo-tagged Reports" },
                  { icon: Zap, label: "Instant Alerts" },
                  { icon: BarChart3, label: "Trend Analysis" },
                  { icon: Shield, label: "Verified Data" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              <Button size="lg" className="gap-2 group" onClick={() => navigate('/peace-pulse')}>
                Explore Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - Horizontal Scroll Feel */}
      <section className="py-20 bg-primary relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <motion.div 
          className="absolute top-20 -left-20 w-80 h-80 bg-gold/10 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-gold text-sm font-semibold tracking-wider uppercase mb-3">
              The Process
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              How It Works
            </h2>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 hidden md:block" />
            
            <div className="grid md:grid-cols-4 gap-6 md:gap-4">
              {processSteps.map((item, i) => (
                <motion.div 
                  key={item.step}
                  className="relative text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  {/* Step Circle */}
                  <motion.div 
                    className="relative z-10 w-20 h-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <item.icon className="w-8 h-8 text-gold" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-gold text-primary-dark text-xs font-bold rounded-full flex items-center justify-center">
                      {item.step}
                    </span>
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
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
              className="gap-2 group h-12"
              onClick={() => navigate('/incidents')}
            >
              Start Reporting Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-16 bg-background border-y border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: "54", label: "Countries", suffix: "" },
              { value: "10K", label: "Reports Processed", suffix: "+" },
              { value: "99", label: "Uptime", suffix: "%" },
              { value: "24", label: "Response Time", suffix: "h" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl sm:text-5xl font-bold text-foreground mb-1">
                  {stat.value}<span className="text-primary">{stat.suffix}</span>
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-muted/50 via-background to-muted/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ready to Make a <span className="text-primary">Difference</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join thousands of citizens working together to build safer, more peaceful communities across Africa.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="gap-2 h-14 px-8 text-lg group" onClick={() => navigate('/auth')}>
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg" onClick={() => navigate('/about')}>
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sponsors */}
      <SponsorsCarousel />
      
      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
              {['About', 'Community', 'Safety', 'Help', 'Privacy', 'Terms'].map((link) => (
                <button 
                  key={link}
                  onClick={() => navigate(`/${link.toLowerCase()}`)} 
                  className="hover:text-foreground transition-colors"
                >
                  {link}
                </button>
              ))}
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
