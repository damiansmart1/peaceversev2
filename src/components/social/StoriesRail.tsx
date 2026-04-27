import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-typed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoriesRailProps {
  onCreate?: () => void;
  className?: string;
}

/**
 * Instagram-style horizontal rail of recent active creators.
 * Tapping the first slot triggers post creation; others open profile.
 * Lightweight: queries top recent posters from `content`.
 */
export const StoriesRail = ({ onCreate, className }: StoriesRailProps) => {
  const { data: storytellers } = useQuery({
    queryKey: ["stories-rail"],
    queryFn: async () => {
      const { data: content } = await supabase
        .from("content")
        .select("user_id, created_at")
        .eq("approval_status", "approved")
        .order("created_at", { ascending: false })
        .limit(40);
      if (!content) return [];
      const seen = new Set<string>();
      const userIds: string[] = [];
      for (const c of content) {
        if (!seen.has(c.user_id)) {
          seen.add(c.user_id);
          userIds.push(c.user_id);
          if (userIds.length >= 12) break;
        }
      }
      if (userIds.length === 0) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", userIds);
      return userIds
        .map((id) => profiles?.find((p) => p.id === id))
        .filter(Boolean) as any[];
    },
  });

  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1">
        {/* Create slot */}
        <button
          onClick={onCreate}
          className="shrink-0 flex flex-col items-center gap-1.5 group focus:outline-none"
          aria-label="Create story"
        >
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/15 via-secondary/10 to-gold/15 border-2 border-dashed border-primary/40 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">Your story</span>
        </button>

        {(storytellers ?? []).map((p) => (
          <div key={p.id} className="shrink-0 flex flex-col items-center gap-1.5">
            <div className="relative">
              {/* Animated gradient ring */}
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-primary via-gold to-secondary animate-gradient-shift" />
              <Avatar className="relative w-16 h-16 border-2 border-background">
                <AvatarImage src={p.avatar_url} />
                <AvatarFallback className="bg-muted text-foreground text-sm">
                  {(p.display_name || p.username || "U")[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-[11px] text-foreground/80 font-medium max-w-[72px] truncate">
              {p.display_name || p.username || "User"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesRail;
