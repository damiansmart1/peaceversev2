import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSponsors } from '@/hooks/useAdminSponsors';
import { useLocation } from 'react-router-dom';
interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  pages?: string[];
  rotation_duration?: number;
  display_frequency?: 'always' | 'high' | 'medium' | 'low';
}
const SponsorsCarousel = () => {
  const {
    data: dbSponsors,
    isLoading
  } = useSponsors();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Get current page from route
  const currentPage = location.pathname.split('/')[1] || 'home';

  // Filter sponsors based on current page and frequency
  const filteredSponsors = (dbSponsors || []).filter((sponsor: Sponsor) => {
    // Check if sponsor should appear on this page
    if (!sponsor.pages?.includes(currentPage)) return false;

    // Apply frequency filter
    const frequency = sponsor.display_frequency || 'always';
    if (frequency === 'always') return true;
    const random = Math.random();
    switch (frequency) {
      case 'high':
        return random < 0.75;
      case 'medium':
        return random < 0.5;
      case 'low':
        return random < 0.25;
      default:
        return true;
    }
  });
  const sponsors = filteredSponsors;
  const rotationDuration = sponsors[currentIndex]?.rotation_duration || 3000;
  const itemsPerView = 4;
  const maxIndex = Math.max(0, sponsors.length - itemsPerView);
  useEffect(() => {
    if (isPaused || sponsors.length <= itemsPerView) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
    }, rotationDuration);
    return () => clearInterval(interval);
  }, [isPaused, maxIndex, sponsors.length, itemsPerView, rotationDuration]);
  const next = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };
  const prev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };
  if (isLoading || sponsors.length === 0) return null;
  return <div className="w-full py-12 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Our Partners & Sponsors</h2>
          <p className="text-muted-foreground">
            Supporting peace and positive change together
          </p>
        </div>

        <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          {/* Navigation Buttons */}
          {sponsors.length > itemsPerView && <>
              <Button variant="outline" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm" onClick={prev} disabled={currentIndex === 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm" onClick={next} disabled={currentIndex >= maxIndex}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>}

          {/* Carousel Content */}
          <div className="overflow-hidden px-12">
            <div className="flex gap-6 transition-transform duration-500 ease-in-out" style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}>
              {sponsors.map(sponsor => <Card key={sponsor.id} style={{
              width: `calc(${100 / itemsPerView}% - ${24 * (itemsPerView - 1) / itemsPerView}px)`
            }} onClick={() => sponsor.website_url && window.open(sponsor.website_url, '_blank')} className="flex-shrink-0 p-6 flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer rounded-md opacity-100 border-2 text-slate-50 bg-white gap-0">
                  <img src={sponsor.logo_url} alt={sponsor.name} className="max-w-full max-h-20 w-auto object-contain transition-all hover:scale-105" style={{
                imageRendering: '-webkit-optimize-contrast'
              }} loading="lazy" />
                </Card>)}
            </div>
          </div>

          {/* Dots Indicator */}
          {sponsors.length > itemsPerView && <div className="flex justify-center gap-2 mt-6">
              {Array.from({
            length: maxIndex + 1
          }).map((_, idx) => <button key={idx} onClick={() => setCurrentIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`} aria-label={`Go to slide ${idx + 1}`} />)}
            </div>}
        </div>
      </div>
    </div>;
};
export default SponsorsCarousel;