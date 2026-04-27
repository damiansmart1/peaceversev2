import { LucideIcon, Inbox, Search, Sparkles, FileText, Users, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Optional secondary action */
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  /** Visual variant — controls illustration treatment */
  variant?: "default" | "search" | "feed" | "alerts" | "minimal";
  className?: string;
}

const variantBgs: Record<NonNullable<EmptyStateProps["variant"]>, string> = {
  default: "bg-gradient-to-br from-primary/8 via-secondary/5 to-gold/8",
  search: "bg-gradient-to-br from-muted/40 to-muted/20",
  feed: "bg-gradient-to-br from-secondary/8 via-primary/5 to-gold/8",
  alerts: "bg-gradient-to-br from-destructive/8 via-warning/5 to-gold/8",
  minimal: "bg-transparent",
};

const variantIcons: Record<NonNullable<EmptyStateProps["variant"]>, LucideIcon> = {
  default: Inbox,
  search: Search,
  feed: Sparkles,
  alerts: Bell,
  minimal: FileText,
};

/**
 * Branded empty state with illustrated treatment.
 * Replace blank "no results" panels — always offer a next action.
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = "default",
  className,
}: EmptyStateProps) {
  const Icon = icon ?? variantIcons[variant];
  return (
    <Card className={cn("border-dashed border-border/60", className)}>
      <CardContent className="flex flex-col items-center justify-center py-14 px-6 text-center">
        {/* Layered illustration: orb + ring + icon */}
        <div className="relative mb-5">
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-2xl opacity-70",
              variantBgs[variant]
            )}
            style={{ transform: "scale(1.6)" }}
            aria-hidden
          />
          <div
            className={cn(
              "relative w-20 h-20 rounded-full flex items-center justify-center border border-border/60",
              variantBgs[variant]
            )}
          >
            <div className="absolute inset-2 rounded-full border border-border/40" aria-hidden />
            <Icon className="w-8 h-8 text-foreground/70" strokeWidth={1.5} />
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
          {description}
        </p>

        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-col sm:flex-row gap-2">
            {actionLabel && onAction && (
              <Button onClick={onAction}>{actionLabel}</Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button variant="ghost" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { Users, FileText, Search, Inbox, Bell, Sparkles };
