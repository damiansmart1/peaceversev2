import { ReactNode, useEffect, useRef, useState } from "react";
import { TabsList } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Drop-in wrapper around shadcn TabsList that:
 *  - scrolls horizontally on overflow (no awkward wrap on mobile)
 *  - shows a subtle gradient fade on edges that have hidden content
 * Use anywhere a 4+ tab row would wrap on small screens.
 */
export const ScrollableTabsList = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      setEdges({
        left: el.scrollLeft > 4,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      {edges.left && (
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-background to-transparent"
          aria-hidden
        />
      )}
      {edges.right && (
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-background to-transparent"
          aria-hidden
        />
      )}
      <div
        ref={wrapRef}
        className="overflow-x-auto scrollbar-none -mx-1 px-1"
        style={{ scrollbarWidth: "none" }}
      >
        <TabsList
          className={cn(
            "inline-flex w-auto min-w-full justify-start gap-1 h-auto",
            className
          )}
        >
          {children}
        </TabsList>
      </div>
    </div>
  );
};

export default ScrollableTabsList;
