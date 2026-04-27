import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Bar = ({ className }: { className?: string }) => (
  <div className={cn("h-3 rounded-md bg-muted/70 animate-pulse", className)} />
);

/**
 * Branded skeleton that mirrors the social feed card layout.
 * Replace generic spinners while feed is loading.
 */
export const FeedSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="h-11 w-11 rounded-full bg-muted/70 animate-pulse" />
            <div className="flex-1 space-y-2">
              <Bar className="w-32" />
              <Bar className="w-20 h-2.5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-[16/10] w-full bg-gradient-to-br from-muted/60 via-muted/40 to-muted/60 animate-pulse" />
            <div className="p-4 space-y-2">
              <Bar className="w-3/4 h-4" />
              <Bar className="w-full" />
              <Bar className="w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/60">
        <div className="h-10 w-10 rounded-md bg-muted/70 animate-pulse" />
        <div className="flex-1 space-y-2">
          <Bar className="w-1/3 h-3" />
          <Bar className="w-1/2 h-2.5" />
        </div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg border border-border/60 space-y-2">
          <Bar className="w-1/2 h-2.5" />
          <Bar className="w-2/3 h-6" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 h-72 rounded-lg border border-border/60 bg-muted/40 animate-pulse" />
      <div className="h-72 rounded-lg border border-border/60 bg-muted/40 animate-pulse" />
    </div>
  </div>
);

export default FeedSkeleton;
