import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in ms before animating in (useful for staggered children) */
  delay?: number;
  /** Direction the element travels from */
  from?: "bottom" | "top" | "left" | "right" | "scale" | "fade";
  /** Pixels of offset to translate in from */
  distance?: number;
  /** Respect prefers-reduced-motion */
  once?: boolean;
  as?: "div" | "section" | "article" | "aside" | "header" | "footer" | "main" | "nav";
}

/**
 * Scroll-triggered reveal using IntersectionObserver.
 * Lightweight (no framer-motion dep), respects prefers-reduced-motion.
 * Use anywhere a section/card should fade-in on scroll.
 */
export const Reveal = ({
  children,
  className,
  delay = 0,
  from = "bottom",
  distance = 24,
  once = true,
  as: Tag = "div",
}: RevealProps) => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  const initialTransform = (() => {
    if (reduced) return "none";
    switch (from) {
      case "top": return `translate3d(0, -${distance}px, 0)`;
      case "left": return `translate3d(-${distance}px, 0, 0)`;
      case "right": return `translate3d(${distance}px, 0, 0)`;
      case "scale": return "scale(0.96)";
      case "fade": return "none";
      default: return `translate3d(0, ${distance}px, 0)`;
    }
  })();

  const Component = Tag as any;
  return (
    <Component
      ref={ref}
      className={cn(className)}
      style={{
        opacity: visible || reduced ? 1 : 0,
        transform: visible || reduced ? "none" : initialTransform,
        transition: reduced
          ? "none"
          : `opacity 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Component>
  );
};

export default Reveal;
