import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Heart-burst micro-interaction overlay.
 * Mount inside a relative-positioned button; trigger by toggling `active`.
 * Shows a satisfying scale+fade burst when transitioning from false → true.
 */
export const HeartBurst = ({ active, className }: { active: boolean; className?: string }) => {
  const [bursting, setBursting] = useState(false);
  const [prev, setPrev] = useState(active);

  useEffect(() => {
    if (active && !prev) {
      setBursting(true);
      const t = setTimeout(() => setBursting(false), 600);
      return () => clearTimeout(t);
    }
    setPrev(active);
  }, [active, prev]);

  if (!bursting) return null;
  return (
    <span className={cn("pointer-events-none absolute inset-0 flex items-center justify-center", className)} aria-hidden>
      <Heart
        className="h-6 w-6 text-red-500 fill-current animate-[heartburst_600ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
        style={{ filter: "drop-shadow(0 0 8px hsl(0 70% 50% / 0.45))" }}
      />
      <style>{`
        @keyframes heartburst {
          0% { opacity: 0; transform: scale(0.6); }
          30% { opacity: 1; transform: scale(1.6); }
          70% { opacity: 1; transform: scale(1.3); }
          100% { opacity: 0; transform: scale(2.2) translateY(-14px); }
        }
      `}</style>
    </span>
  );
};

export default HeartBurst;
