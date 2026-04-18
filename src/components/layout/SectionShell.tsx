import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contained?: boolean;
}

/**
 * Calmer institutional section wrapper.
 * One clear header, generous whitespace, optional action slot.
 * Use across dashboards/pages instead of ad-hoc Card+heading combos.
 */
const SectionShell = ({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  contained = true,
}: SectionShellProps) => {
  return (
    <section className={cn("space-y-5 sm:space-y-6", className)}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5 min-w-0">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </header>
      <div className={cn(contained && "")}>{children}</div>
    </section>
  );
};

export default SectionShell;
