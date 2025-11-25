import { cn } from "@/lib/utils";

interface SectionImageBannerProps {
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
  className?: string;
  overlay?: boolean;
}

const SectionImageBanner = ({ 
  image, 
  alt, 
  title, 
  subtitle, 
  className,
  overlay = true 
}: SectionImageBannerProps) => {
  return (
    <div className={cn("relative w-full rounded-lg overflow-hidden", className)}>
      <img
        src={image}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ imageRendering: '-webkit-optimize-contrast' }}
        loading="lazy"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      )}
      {(title || subtitle) && (
        <div className="absolute bottom-0 left-0 right-0 p-6 text-foreground">
          {title && <h3 className="text-2xl font-bold mb-2">{title}</h3>}
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      )}
    </div>
  );
};

export default SectionImageBanner;
