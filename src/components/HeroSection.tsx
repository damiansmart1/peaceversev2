import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Globe, Activity, Play, Zap, Radio } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const HeroSection = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.15]);
  
  return (
    <section ref={containerRef} className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-background">
      {/* Parallax Background Image */}
      <motion.div className="absolute inset-0 z-0" style={{ scale }}>
        <img
          src={heroImage}
          alt="African communities united for peace"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </motion.div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden z-[1]">
        {/* Large gradient orbs */}
        <motion.div 
          className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, hsl(270 70% 55% / 0.4) 0%, transparent 70%)'
          }}
          animate={{ 
            x: [0, 50, 0], 
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[40%] -right-[15%] w-[700px] h-[700px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(175 80% 50% / 0.4) 0%, transparent 70%)'
          }}
          animate={{ 
            x: [0, -60, 0], 
            y: [0, 40, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-[10%] left-[30%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, hsl(25 100% 55% / 0.4) 0%, transparent 70%)'
          }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.35, 0.2]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* African geometric pattern overlay */}
        <div className="absolute inset-0 bg-african-pattern opacity-30" />
        
        {/* Grid lines */}
        <div className="absolute inset-0 bg-grid-futuristic opacity-40" />
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: i % 3 === 0 
                ? 'hsl(270 70% 60%)' 
                : i % 3 === 1 
                  ? 'hsl(175 80% 50%)' 
                  : 'hsl(38 95% 55%)',
              boxShadow: `0 0 ${10 + Math.random() * 10}px currentColor`,
            }}
            animate={{
              y: [0, -150 - Math.random() * 100, 0],
              x: [0, (Math.random() - 0.5) * 50, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Animated lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <motion.line 
            x1="0%" y1="80%" x2="100%" y2="40%"
            stroke="url(#lineGradient1)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.line 
            x1="20%" y1="100%" x2="80%" y2="0%"
            stroke="url(#lineGradient2)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
            transition={{ duration: 5, repeat: Infinity, repeatDelay: 3, delay: 1 }}
          />
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(270 70% 60%)" />
              <stop offset="100%" stopColor="hsl(175 80% 50%)" />
            </linearGradient>
            <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(25 100% 55%)" />
              <stop offset="100%" stopColor="hsl(38 95% 55%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-20"
        style={{ y, opacity }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center gap-3 glass px-4 py-2.5 rounded-full mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                </span>
                <span className="text-foreground/80 text-sm font-medium">Live Monitoring Active</span>
                <Radio className="w-4 h-4 text-success animate-pulse" />
              </motion.div>

              {/* Main Heading */}
              <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-[1.05] tracking-tight">
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="block text-foreground"
                >
                  Detect.
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="block text-foreground"
                >
                  Verify.
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="block text-gradient-sunset text-glow-gold"
                >
                  Prevent.
                </motion.span>
              </h1>
              
              {/* Subtitle */}
              <motion.p 
                className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-lg leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Africa's most advanced early warning system. Real-time AI-powered intelligence for safer communities across the continent.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col xs:flex-row flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button 
                  size="lg" 
                  className="relative overflow-hidden group h-12 sm:h-14 px-6 sm:px-8 rounded-xl text-sm sm:text-base font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, hsl(270 70% 55%) 0%, hsl(175 80% 50%) 100%)'
                  }}
                  onClick={() => navigate('/incidents')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 flex items-center gap-2">
                    Report Incident
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl text-sm sm:text-base font-semibold border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-all"
                  onClick={() => navigate('/peace-pulse')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - Stats Cards */}
            <motion.div
              className="grid grid-cols-2 gap-4 sm:gap-5"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {[
                { value: "54", label: "Countries", icon: Globe, gradient: "from-primary/30 to-primary/5", glow: "shadow-[0_0_30px_hsl(270_70%_55%/0.3)]" },
                { value: "24/7", label: "Monitoring", icon: Shield, gradient: "from-success/30 to-success/5", glow: "shadow-[0_0_30px_hsl(160_70%_45%/0.3)]" },
                { value: "AI", label: "Powered", icon: Zap, gradient: "from-accent/30 to-accent/5", glow: "shadow-[0_0_30px_hsl(25_100%_55%/0.3)]" },
                { value: "Live", label: "Intelligence", icon: Activity, gradient: "from-secondary/30 to-secondary/5", glow: "shadow-[0_0_30px_hsl(175_80%_50%/0.3)]" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className={`relative overflow-hidden glass-card rounded-2xl p-5 sm:p-6 group cursor-pointer ${stat.glow}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
                  
                  {/* Icon */}
                  <stat.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary mb-3 sm:mb-4 relative z-10 group-hover:scale-110 transition-transform" />
                  
                  {/* Value */}
                  <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1 relative z-10">{stat.value}</div>
                  
                  {/* Label */}
                  <div className="text-muted-foreground text-sm sm:text-base relative z-10">{stat.label}</div>
                  
                  {/* Hover glow effect */}
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div 
          className="flex flex-col items-center gap-3"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-1.5">
            <motion.div 
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
