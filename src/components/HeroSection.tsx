import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Globe, Activity, Play, Radio, Users, Handshake, HeartHandshake, RefreshCw } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
const unscr2250Pillars = [{
  name: "Participation",
  icon: Users,
  description: "Inclusive youth engagement in peace processes and decision-making",
  color: "primary"
}, {
  name: "Prevention",
  icon: Shield,
  description: "Early warning systems to prevent violence and conflict escalation",
  color: "secondary"
}, {
  name: "Protection",
  icon: HeartHandshake,
  description: "Safeguarding young people's rights, safety and well-being",
  color: "gold"
}, {
  name: "Partnerships",
  icon: Handshake,
  description: "Multi-stakeholder collaboration for sustainable peace",
  color: "accent"
}, {
  name: "Disengagement",
  icon: RefreshCw,
  description: "Reintegration pathways for youth affected by conflict",
  color: "earth"
}];
const HeroSection = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);
  const {
    scrollYProgress
  } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  return <section ref={containerRef} className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image with Parallax */}
      <motion.div className="absolute inset-0 z-0" style={{
      scale
    }}>
        <img src={heroImage} alt="African communities united for peace" className="w-full h-full object-cover" />
        {/* Gradient overlays using brand colors */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20" />
      </motion.div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden z-[1]">
        {/* Gold accent orb */}
        <motion.div className="absolute -top-[15%] -left-[5%] w-[500px] h-[500px] rounded-full" style={{
        background: 'radial-gradient(circle, hsl(44 75% 57% / 0.2) 0%, transparent 60%)'
      }} animate={{
        x: [0, 30, 0],
        y: [0, -20, 0],
        scale: [1, 1.05, 1]
      }} transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
        
        {/* Primary blue orb */}
        <motion.div className="absolute top-[30%] -right-[10%] w-[600px] h-[600px] rounded-full" style={{
        background: 'radial-gradient(circle, hsl(210 93% 31% / 0.15) 0%, transparent 60%)'
      }} animate={{
        x: [0, -40, 0],
        y: [0, 30, 0],
        scale: [1, 1.1, 1]
      }} transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
        
        {/* Forest green orb */}
        <motion.div className="absolute -bottom-[5%] left-[25%] w-[400px] h-[400px] rounded-full" style={{
        background: 'radial-gradient(circle, hsl(136 37% 24% / 0.2) 0%, transparent 60%)'
      }} animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3]
      }} transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
        
        {/* African pattern overlay */}
        <div className="absolute inset-0 bg-african-pattern opacity-40" />
        
        {/* Grid */}
        <div className="absolute inset-0 bg-grid-african opacity-30" />
        
        {/* Floating particles with brand colors */}
        {[...Array(20)].map((_, i) => <motion.div key={i} className="absolute rounded-full" style={{
        left: `${10 + Math.random() * 80}%`,
        top: `${10 + Math.random() * 80}%`,
        width: `${3 + Math.random() * 5}px`,
        height: `${3 + Math.random() * 5}px`,
        background: i % 4 === 0 ? 'hsl(44 75% 57%)' // Gold
        : i % 4 === 1 ? 'hsl(210 93% 45%)' // Blue
        : i % 4 === 2 ? 'hsl(136 37% 35%)' // Green
        : 'hsl(26 47% 50%)',
        // Earth
        boxShadow: `0 0 15px currentColor`
      }} animate={{
        y: [0, -120 - Math.random() * 80, 0],
        x: [0, (Math.random() - 0.5) * 40, 0],
        opacity: [0, 0.8, 0],
        scale: [0, 1, 0]
      }} transition={{
        duration: 5 + Math.random() * 5,
        repeat: Infinity,
        delay: Math.random() * 6,
        ease: "easeInOut"
      }} />)}

        {/* Decorative lines */}
        <svg className="absolute inset-0 w-full h-full opacity-15">
          <motion.line x1="0%" y1="75%" x2="100%" y2="35%" stroke="url(#brandGradient1)" strokeWidth="1" initial={{
          pathLength: 0,
          opacity: 0
        }} animate={{
          pathLength: 1,
          opacity: [0, 0.4, 0]
        }} transition={{
          duration: 5,
          repeat: Infinity,
          repeatDelay: 3
        }} />
          <motion.line x1="15%" y1="100%" x2="85%" y2="0%" stroke="url(#brandGradient2)" strokeWidth="1" initial={{
          pathLength: 0,
          opacity: 0
        }} animate={{
          pathLength: 1,
          opacity: [0, 0.4, 0]
        }} transition={{
          duration: 6,
          repeat: Infinity,
          repeatDelay: 4,
          delay: 1.5
        }} />
          <defs>
            <linearGradient id="brandGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(210 93% 31%)" />
              <stop offset="50%" stopColor="hsl(44 75% 57%)" />
              <stop offset="100%" stopColor="hsl(136 37% 24%)" />
            </linearGradient>
            <linearGradient id="brandGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(44 75% 57%)" />
              <stop offset="100%" stopColor="hsl(26 47% 40%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <motion.div className="relative z-10 container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-20" style={{
      y,
      opacity
    }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div initial={{
            opacity: 0,
            x: -50
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.7,
            ease: "easeOut"
          }}>
              {/* Live Badge */}
              <motion.div className="inline-flex items-center gap-3 bg-card/80 backdrop-blur-sm border border-gold/30 px-4 py-2.5 rounded-full mb-8 shadow-warm" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.3
            }}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
                </span>
                <span className="text-foreground/90 text-sm font-medium">Live Monitoring Active</span>
                <Radio className="w-4 h-4 text-secondary animate-pulse" />
              </motion.div>

              {/* Main Heading */}
              <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-[1.05] tracking-tight">
                <motion.span initial={{
                opacity: 0,
                y: 25
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.4
              }} className="block text-foreground">
                  Detect.
                </motion.span>
                <motion.span initial={{
                opacity: 0,
                y: 25
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.5
              }} className="block text-foreground">
                  Verify.
                </motion.span>
                <motion.span initial={{
                opacity: 0,
                y: 25
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.6
              }} className="block text-gradient-gold text-glow-gold text-white">
                  Prevent.
                </motion.span>
              </h1>
              
              {/* Subtitle */}
              <motion.p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-lg leading-relaxed" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              delay: 0.7
            }}>
                Africa's most advanced early warning system. Real-time AI-powered intelligence for safer communities across the continent.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div className="flex flex-col xs:flex-row flex-wrap gap-4" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.8
            }}>
                <Button size="lg" className="relative overflow-hidden group h-12 sm:h-14 px-6 sm:px-8 rounded-xl text-sm sm:text-base font-semibold bg-primary hover:bg-primary-dark text-primary-foreground shadow-peace" onClick={() => navigate('/incidents')}>
                  <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 flex items-center gap-2">
                    Report Incident
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
                <Button variant="outline" size="lg" className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl text-sm sm:text-base font-semibold border-border bg-card/50 hover:bg-card hover:border-gold/50 text-foreground transition-all" onClick={() => navigate('/peace-pulse')}>
                  <Play className="w-4 h-4 mr-2" />
                  Explore Dashboard
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - UNSCR 2250 Pillars */}
            <motion.div className="space-y-3" initial={{
            opacity: 0,
            x: 50
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.7,
            delay: 0.3
          }}>
              {/* UNSCR 2250 Header */}
              <motion.div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-gold/30 mb-4" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.4
            }}>
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-gold" />
                  <span className="text-sm font-semibold text-gold uppercase tracking-wide">UNSCR 2250</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">Youth, Peace & Security</h3>
                <p className="text-sm text-muted-foreground mt-1">Peaceverse aligns with all five pillars of the UN Security Council Resolution 2250</p>
              </motion.div>

              {/* Pillars Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {unscr2250Pillars.map((pillar, i) => <motion.div key={pillar.name} className="relative overflow-hidden bg-card/80 backdrop-blur-sm rounded-xl p-3.5 border border-border/50 group cursor-pointer hover:border-gold/40 transition-colors" initial={{
                opacity: 0,
                x: 30
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 0.5 + i * 0.08
              }} whileHover={{
                x: 5
              }}>
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-${pillar.color}/15 flex items-center justify-center`}>
                        <pillar.icon className={`w-5 h-5 text-${pillar.color}`} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground text-sm">{pillar.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{pillar.description}</div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-gold group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                    
                    {/* Hover glow */}
                    <div className={`absolute -right-4 -bottom-4 w-16 h-16 bg-${pillar.color}/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </motion.div>)}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />

      {/* Scroll Indicator */}
      <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1.5
    }}>
        <motion.div className="flex flex-col items-center gap-3" animate={{
        y: [0, 8, 0]
      }} transition={{
        duration: 2,
        repeat: Infinity
      }}>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-gold/40 flex items-start justify-center p-1.5">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-gold" animate={{
            y: [0, 16, 0]
          }} transition={{
            duration: 2,
            repeat: Infinity
          }} />
          </div>
        </motion.div>
      </motion.div>
    </section>;
};
export default HeroSection;