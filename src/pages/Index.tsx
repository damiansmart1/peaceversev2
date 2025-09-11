import HeroSection from "@/components/HeroSection";
import VoiceRecorder from "@/components/VoiceRecorder";
import CommunityMap from "@/components/CommunityMap";
import GamificationDashboard from "@/components/GamificationDashboard";
import AccessibilityFeatures from "@/components/AccessibilityFeatures";
import DonorShowcase from "@/components/DonorShowcase";
import ContentUpload from "@/components/ContentUpload";
import ContentFeed from "@/components/ContentFeed";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      
      {/* Voice Recording Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Your Voice Matters</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Share your story and inspire positive change in your community and beyond
            </p>
          </div>
          <VoiceRecorder />
        </div>
      </section>

      <CommunityMap />
      
      {/* Content Sharing Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Share Your Story</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload videos, images, or audio content to inspire and connect with the community
            </p>
          </div>
          <ContentUpload />
        </div>
      </section>

      {/* Community Content Feed */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Community Stories</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover inspiring content shared by community members worldwide
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <ContentFeed />
          </div>
        </div>
      </section>

      <GamificationDashboard />
      <AccessibilityFeatures />
      <DonorShowcase />
      
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-peace-gradient bg-clip-text text-transparent">
                PeaceVerse
              </h3>
              <p className="text-primary-foreground/80">
                Empowering youth voices for peace, one story at a time.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Features</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Voice Storytelling</li>
                <li>Community Mapping</li>
                <li>Peace Challenges</li>
                <li>Safe Dialogue Spaces</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Accessibility Features</li>
                <li>Multi-language Support</li>
                <li>24/7 Community Safety</li>
                <li>Crisis Resources</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 PeaceVerse. Building bridges, sharing stories, creating peace.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;