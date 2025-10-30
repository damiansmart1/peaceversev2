import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

// Demo sponsors - in production, this would come from the database
const demoSponsors: Sponsor[] = [
  { id: '1', name: 'Partner 1', logo: 'https://via.placeholder.com/200x100/4F46E5/FFFFFF?text=Partner+1' },
  { id: '2', name: 'Partner 2', logo: 'https://via.placeholder.com/200x100/7C3AED/FFFFFF?text=Partner+2' },
  { id: '3', name: 'Partner 3', logo: 'https://via.placeholder.com/200x100/EC4899/FFFFFF?text=Partner+3' },
  { id: '4', name: 'Partner 4', logo: 'https://via.placeholder.com/200x100/10B981/FFFFFF?text=Partner+4' },
  { id: '5', name: 'Partner 5', logo: 'https://via.placeholder.com/200x100/F59E0B/FFFFFF?text=Partner+5' },
  { id: '6', name: 'Partner 6', logo: 'https://via.placeholder.com/200x100/EF4444/FFFFFF?text=Partner+6' },
];

const SponsorsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sponsors] = useState<Sponsor[]>(demoSponsors);
  const [isPaused, setIsPaused] = useState(false);

  const itemsPerView = 4;
  const maxIndex = Math.max(0, sponsors.length - itemsPerView);

  useEffect(() => {
    if (isPaused || sponsors.length <= itemsPerView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, maxIndex, sponsors.length, itemsPerView]);

  const next = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (sponsors.length === 0) return null;

  return (
    <div className="w-full py-12 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Our Partners & Sponsors</h2>
          <p className="text-muted-foreground">
            Supporting peace and positive change together
          </p>
        </div>

        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Buttons */}
          {sponsors.length > itemsPerView && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                onClick={prev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                onClick={next}
                disabled={currentIndex >= maxIndex}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Carousel Content */}
          <div className="overflow-hidden px-12">
            <div 
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
              }}
            >
              {sponsors.map((sponsor) => (
                <Card
                  key={sponsor.id}
                  className="flex-shrink-0 p-6 flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer bg-background"
                  style={{ width: `calc(${100 / itemsPerView}% - ${(24 * (itemsPerView - 1)) / itemsPerView}px)` }}
                  onClick={() => sponsor.website && window.open(sponsor.website, '_blank')}
                >
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="max-w-full max-h-20 object-contain grayscale hover:grayscale-0 transition-all"
                  />
                </Card>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          {sponsors.length > itemsPerView && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex 
                      ? 'bg-primary w-6' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SponsorsCarousel;
