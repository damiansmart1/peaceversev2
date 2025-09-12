import HeroSection from "@/components/HeroSection";
import VoiceRecorder from "@/components/VoiceRecorder";
import CommunityMap from "@/components/CommunityMap";
import GamificationDashboard from "@/components/GamificationDashboard";
import AccessibilityFeatures from "@/components/AccessibilityFeatures";
import DonorShowcase from "@/components/DonorShowcase";
import ContentUpload from "@/components/ContentUpload";
import ContentFeed from "@/components/ContentFeed";
import OfflineAccess from "@/components/OfflineAccess";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      
      {/* Voice Recording Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Sauti Yako Ina Maana | Your Voice Matters</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Shiriki hadithi yako na uongeze mabadiliko mazuri katika jamii yako na zaidi huko Kenya
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
            <h2 className="text-4xl font-bold mb-4 text-foreground">Shiriki Hadithi Yako | Share Your Story</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pakia video, picha, au maudhui ya sauti ili kuongoza na kuunganisha na jamii
            </p>
          </div>
          <ContentUpload />
        </div>
      </section>

      {/* Community Content Feed */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Hadithi za Kijamii | Community Stories</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Gundua maudhui ya kuongoza yaliyoshirikiwa na wanajamii kutoka Kenya na Afrika Mashariki
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <ContentFeed />
          </div>
        </div>
      </section>
      
      <OfflineAccess />
      <GamificationDashboard />
      <AccessibilityFeatures />
      <DonorShowcase />
      
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-peace-gradient bg-clip-text text-transparent">
                Amani Verse
              </h3>
              <p className="text-primary-foreground/80">
                Kuongoza sauti za vijana kwa amani, hadithi moja kwa wakati.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Vipengele | Features</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Hadithi za Sauti | Voice Storytelling</li>
                <li>Ramani za Kijamii | Community Mapping</li>
                <li>Changamoto za Amani | Peace Challenges</li>
                <li>Maeneo Salama ya Mazungumzo | Safe Dialogue Spaces</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Msaada | Support</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Vipengele vya Ufikivu | Accessibility Features</li>
                <li>Msaada wa Lugha Nyingi | Multi-language Support</li>
                <li>Usalama wa Kijamii 24/7 | 24/7 Community Safety</li>
                <li>Rasilimali za Msaada wa Haraka | Crisis Resources</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 Amani Verse. Kujenga madaraja, kushiriki hadithi, kuunda amani Kenya.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;