import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import SponsorsCarousel from "@/components/SponsorsCarousel";
import AfricaMap from "@/components/AfricaMap";
import { useNavigate } from "react-router-dom";
import { 
  Mic, Users, Radio, Award, Shield, Vote, Activity, AlertCircle,
  ArrowRight, Globe, Eye, CheckCircle, Zap, BarChart3, MapPin, Bell, Heart, Leaf,
  Scale, Target, Handshake, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    { icon: AlertCircle, color: "bg-destructive", path: "/incidents", label: "Report", desc: "Submit incidents securely" },
    { icon: Activity, color: "bg-primary", path: "/peace-pulse", label: "Analytics", desc: "Real-time intelligence" },
    { icon: Users, color: "bg-secondary", path: "/community", label: "Community", desc: "Connect & collaborate" },
    { icon: Shield, color: "bg-earth", path: "/safety", label: "Safety", desc: "Find safe spaces" },
    { icon: Vote, color: "bg-gold", path: "/proposals", label: "Vote", desc: "Shape policies" },
    { icon: Mic, color: "bg-accent", path: "/community", label: "Voice", desc: "Share your story" },
  ];

  const processSteps = [
    { step: "01", icon: AlertCircle, title: "Report", desc: "Citizens submit geo-tagged incidents with evidence" },
    { step: "02", icon: Eye, title: "Verify", desc: "AI + human verification ensures accuracy" },
    { step: "03", icon: Bell, title: "Alert", desc: "Real-time alerts to relevant stakeholders" },
    { step: "04", icon: CheckCircle, title: "Respond", desc: "Coordinated action and prevention" },
  ];

  const impactStats = [
    { value: "54", label: "Countries Covered", suffix: "" },
    { value: "10K", label: "Reports Processed", suffix: "+" },
    { value: "99", label: "System Uptime", suffix: "%" },
    { value: "24", label: "Average Response", suffix: "h" },
  ];

  const frameworks = [
    {
      icon: Users,
      badge: "UNSCR 2250",
      title: "Youth, Peace & Security",
      description: "Empowering young Africans as agents of peace through participation, protection, prevention, partnerships, and disengagement & reintegration.",
      highlights: ["Youth-led reporting", "Community participation", "Preventive action"],
      color: "primary"
    },
    {
      icon: Globe,
      badge: "Agenda 2063",
      title: "The Africa We Want",
      description: "Contributing to the African Union's 50-year vision for an integrated, prosperous, and peaceful Africa driven by its own citizens.",
      highlights: ["Pan-African coverage", "Continental solidarity", "African-led solutions"],
      color: "secondary"
    },
    {
      icon: Shield,
      badge: "Aspiration 4",
      title: "A Peaceful & Secure Africa",
      description: "Advancing conflict prevention, peacekeeping, and post-conflict reconstruction through citizen-powered early warning systems.",
      highlights: ["Early warning", "Conflict prevention", "Peace infrastructure"],
      color: "gold"
    },
    {
      icon: Scale,
      badge: "SDG 16",
      title: "Peace, Justice & Strong Institutions",
      description: "Promoting peaceful and inclusive societies, providing access to justice for all, and building effective, accountable institutions.",
      highlights: ["Inclusive participation", "Transparent reporting", "Accountable governance"],
      color: "earth"
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      <HeroSection />

      {/* International Frameworks Alignment Section */}
      <section className="py-24 bg-gradient-to-b from-muted/50 via-background to-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-semibold tracking-wider uppercase">International Alignment</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Grounded in <span className="text-gradient-gold">Global Frameworks</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
              PeaceVerse is strategically aligned with international peace and security frameworks, ensuring our approach contributes to globally recognized goals for sustainable peace in Africa.
            </p>
          </motion.div>

          {/* Frameworks Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {frameworks.map((framework, i) => (
              <motion.div
                key={framework.badge}
                className="group relative bg-card border border-border rounded-2xl p-8 hover:border-gold/50 transition-all duration-500 hover:shadow-elevated overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${framework.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 bg-${framework.color}/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <framework.icon className={`w-7 h-7 text-${framework.color}`} />
                    </div>
                    <div>
                      <span className={`inline-block px-3 py-1 bg-${framework.color}/10 text-${framework.color} text-xs font-bold rounded-full mb-2`}>
                        {framework.badge}
                      </span>
                      <h3 className="text-xl font-bold text-foreground">{framework.title}</h3>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-muted-foreground mb-5 leading-relaxed">
                    {framework.description}
                  </p>
                  
                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2">
                    {framework.highlights.map((highlight) => (
                      <span 
                        key={highlight}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border/50 rounded-lg text-sm text-foreground/80"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-gold" />
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground mb-4">
              Learn more about how PeaceVerse contributes to these global initiatives
            </p>
            <Button 
              variant="outline" 
              className="gap-2 group border-gold/30 hover:border-gold hover:bg-gold/5"
              onClick={() => navigate('/about')}
            >
              <Target className="w-4 h-4" />
              Explore Our Impact
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Features Grid Section */}
      <section className="py-24 bg-background relative">
        {/* Subtle pattern background */}
        <div className="absolute inset-0 bg-adinkra-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-4 py-2 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Leaf className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-semibold tracking-wider uppercase">Platform Features</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Everything You Need in <span className="text-gradient-gold">One Place</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A comprehensive suite of tools designed to empower communities and build lasting peace across Africa.
            </p>
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
                <p className={`text-white/80 ${i === 0 ? 'text-base' : 'text-xs'}`}>{feature.desc}</p>
                <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left - Map */}
            <motion.div 
              className="relative order-2 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/15 via-gold/15 to-secondary/15 rounded-3xl blur-3xl opacity-50" />
              <div className="relative bg-card rounded-2xl border border-border overflow-hidden shadow-elevated">
                <AfricaMap />
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full mb-6">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-primary text-sm font-semibold tracking-wider uppercase">Continental Coverage</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
                Real-time Intelligence Across <span className="text-gradient-primary">54 Nations</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
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
                    className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 hover-lift"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gold" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              <Button size="lg" className="gap-2 group bg-primary hover:bg-primary-dark text-primary-foreground shadow-peace" onClick={() => navigate('/peace-pulse')}>
                Explore Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating orbs */}
        <motion.div 
          className="absolute top-20 -left-20 w-80 h-80 bg-gold/15 rounded-full blur-3xl"
          animate={{ x: [0, 40, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 -right-20 w-60 h-60 bg-secondary/20 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6">
              <Activity className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-semibold tracking-wider uppercase">The Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              How It <span className="text-gold text-glow-gold">Works</span>
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
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-gold text-primary-dark text-xs font-bold rounded-full flex items-center justify-center shadow-warm">
                      {item.step}
                    </span>
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            className="text-center mt-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button 
              size="lg" 
              className="gap-2 group h-12 bg-gold hover:bg-gold-light text-primary-dark font-semibold shadow-warm"
              onClick={() => navigate('/incidents')}
            >
              Start Reporting Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {impactStats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                  {stat.value}<span className="text-gold">{stat.suffix}</span>
                </div>
                <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-muted/30 via-background to-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-african-pattern opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/30 px-4 py-2 rounded-full mb-6">
              <Heart className="w-4 h-4 text-secondary" />
              <span className="text-secondary text-sm font-semibold tracking-wider uppercase">Join the Movement</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ready to Make a <span className="text-gradient-gold">Difference</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of citizens working together to build safer, more peaceful communities across Africa.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="gap-2 h-14 px-8 text-lg group bg-primary hover:bg-primary-dark text-primary-foreground shadow-peace" onClick={() => navigate('/auth')}>
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-border hover:border-gold/50 hover:bg-gold/5" onClick={() => navigate('/about')}>
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
                  className="hover:text-gold transition-colors"
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
