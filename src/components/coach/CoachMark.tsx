import { ReactNode, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoachMarkProps {
  /** Unique key — coach mark is shown only once per user (stored in localStorage) */
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  /** Auto-open after this many ms (default 600) */
  delay?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Force show even if previously dismissed (useful for re-onboarding) */
  force?: boolean;
}

const STORAGE_PREFIX = "coachmark:";

/**
 * Lightweight first-run coach mark anchored to any element.
 * Wrap a target component; auto-shows once, then is dismissed forever.
 */
export const CoachMark = ({
  id,
  title,
  description,
  children,
  delay = 600,
  side = "bottom",
  align = "center",
  force = false,
}: CoachMarkProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (dismissed && !force) return;
    const t = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(t);
  }, [id, delay, force]);

  const dismiss = () => {
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, "1");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={(o) => (o ? setOpen(true) : dismiss())}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={10}
        className={cn(
          "w-72 p-0 border border-primary/30 shadow-elevated",
          "bg-gradient-to-br from-popover via-popover to-primary/5"
        )}
      >
        <div className="relative p-4">
          <button
            onClick={dismiss}
            className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Dismiss tip"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <div className="flex items-start gap-2.5">
            <div className="shrink-0 mt-0.5 w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                Tip
              </p>
              <h4 className="text-sm font-semibold text-foreground mb-1">
                {title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {description}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={dismiss}
                className="h-7 px-2 text-xs"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/** Reset all coach marks (call from a "Restart tour" admin action). */
export const resetCoachMarks = () => {
  if (typeof window === "undefined") return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
};

export default CoachMark;
