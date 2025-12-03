import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Globe, Activity } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="African communities united for peace"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/90 via-primary-dark/80 to-background" />
      </div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 z-[1]" />

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-[10%] w-2 h-2 bg-gold rounded-full animate-pulse-voice z-[1]" />
      <div className="absolute top-1/3 right-[15%] w-3 h-3 bg-accent rounded-full animate-pulse-voice z-[1]" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/3 left-[20%] w-2 h-2 bg-success rounded-full animate-pulse-voice z-[1]" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-12">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Continental Early Warning System</span>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Detect. Verify.
            <span className="block bg-gradient-to-r from-gold via-accent to-gold-light bg-clip-text text-transparent">
              Prevent.
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Real-time peace intelligence across Africa
          </p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 h-14 gap-2 shadow-elevated"
              onClick={() => navigate('/incidents')}
            >
              Report Incident
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 text-lg px-8 h-14"
              onClick={() => navigate('/peace-pulse')}
            >
              View Dashboard
            </Button>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-gold" />
                <span className="text-3xl sm:text-4xl font-bold text-white">54</span>
              </div>
              <span className="text-white/60 text-sm">Countries</span>
            </div>
            <div className="text-center border-x border-white/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-success" />
                <span className="text-3xl sm:text-4xl font-bold text-white">24/7</span>
              </div>
              <span className="text-white/60 text-sm">Monitoring</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-accent" />
                <span className="text-3xl sm:text-4xl font-bold text-white">Live</span>
              </div>
              <span className="text-white/60 text-sm">Intelligence</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div 
            className="w-1.5 h-3 bg-white/60 rounded-full mt-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
