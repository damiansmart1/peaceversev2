import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StatItem {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "primary" | "success" | "warning" | "destructive";
}

interface StatStripProps {
  items: StatItem[];
  className?: string;
}

const toneClasses: Record<NonNullable<StatItem["tone"]>, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

/**
 * Single calm metrics row. Replaces "5 colorful stat cards in a grid".
 * Mobile: stacks 2-col. Desktop: inline strip.
 */
const StatStrip = ({ items, className }: StatStripProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-border/60",
        "border border-border/60 rounded-lg bg-card overflow-hidden",
        className
      )}
    >
      {items.map((item, i) => (
        <div key={i} className="p-4 sm:p-5 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {item.icon && <span className="text-muted-foreground shrink-0">{item.icon}</span>}
            <p className="eyebrow truncate">{item.label}</p>
          </div>
          <p
            className={cn(
              "text-2xl sm:text-[1.65rem] font-semibold tracking-tight tabular-nums leading-none",
              toneClasses[item.tone ?? "default"]
            )}
          >
            {item.value}
          </p>
          {item.hint && (
            <p className="text-xs text-muted-foreground mt-1.5 truncate">{item.hint}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatStrip;
