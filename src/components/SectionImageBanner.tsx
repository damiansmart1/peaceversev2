import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

interface SectionImageBannerProps {
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
  /** Additional content rendered below subtitle (badges, CTAs) */
  children?: ReactNode;
  /** Override default responsive height. Mobile is always shorter. */
  className?: string;
  /** Use parallax effect on the background image */
  parallax?: boolean;
}

/**
 * Page-top banner with shorter mobile height to stop eating viewport,
 * subtle parallax, and content overlay.
 */
const SectionImageBanner = ({
  image,
  alt,
  title,
  subtitle,
  children,
  className,
  parallax = true,
}: SectionImageBannerProps) => {
  return (
    <Reveal from="fade">
      <div
        className={cn(
          // Shorter on mobile so it doesn't dominate viewport
          "relative w-full overflow-hidden rounded-xl border border-border/60 bg-muted",
          "h-40 sm:h-56 md:h-72 lg:h-80",
          className
        )}
      >
        <img
          src={image}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            parallax && "scale-105 transition-transform duration-[1.4s] ease-out hover:scale-110"
          )}
          loading="lazy"
          decoding="async"
        />
        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />

        <div className="relative h-full flex flex-col justify-end p-4 sm:p-6 md:p-8">
          {title && (
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-1 sm:mb-2 line-clamp-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl line-clamp-2">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </Reveal>
  );
};

export default SectionImageBanner;
