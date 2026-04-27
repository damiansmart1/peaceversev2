import { cn } from "@/lib/utils";

interface PresenceDotProps {
  /** Number of online users to indicate; 0 hides */
  count?: number;
  label?: string;
  className?: string;
}

/**
 * Small ambient indicator: pulsing green dot + count.
 * Use in headers for "X verifiers online", "Y people viewing", etc.
 */
export const PresenceDot = ({ count = 0, label = "online", className }: PresenceDotProps) => {
  if (count <= 0) return null;
  return (
    <div className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      <span className="tabular-nums font-medium text-foreground/80">{count}</span>
      <span>{label}</span>
    </div>
  );
};

export default PresenceDot;
