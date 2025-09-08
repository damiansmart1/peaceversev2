import { Button } from "@/components/ui/button";
import { Mic, Users, Award, Map } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Diverse youth coming together for peace building through storytelling and community dialogue"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-peace-gradient bg-clip-text text-transparent leading-tight">
            PeaceVerse
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 mb-4 font-medium">
            Empowering Youth Voices for Peace
          </p>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Join a global community where young people from rural, remote, and conflict-affected areas 
            share their stories, build connections, and create positive change through voice, creativity, and collaboration.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="peace" size="lg" className="text-lg px-8 py-6">
              <Mic className="w-5 h-5" />
              Share Your Story
            </Button>
            <Button variant="community" size="lg" className="text-lg px-8 py-6">
              <Users className="w-5 h-5" />
              Join the Community
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 shadow-story border border-accent/20 hover:shadow-warm transition-all duration-300">
              <div className="w-12 h-12 bg-voice-active rounded-full flex items-center justify-center mb-4 mx-auto">
                <Mic className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">Voice-First Stories</h3>
              <p className="text-muted-foreground">
                Share your experiences through voice recordings, accessible to all literacy levels
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 shadow-story border border-accent/20 hover:shadow-warm transition-all duration-300">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4 mx-auto">
                <Map className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">Safe Community Hubs</h3>
              <p className="text-muted-foreground">
                Find and connect with trusted dialogue spaces in your area
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 shadow-story border border-accent/20 hover:shadow-warm transition-all duration-300">
              <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center mb-4 mx-auto">
                <Award className="w-6 h-6 text-warning-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">Earn Recognition</h3>
              <p className="text-muted-foreground">
                Gain badges and recognition for positive contributions to peace-building
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse-voice" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse-voice" />
    </section>
  );
};

export default HeroSection;