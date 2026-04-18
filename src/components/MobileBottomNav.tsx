import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Siren, Landmark, UsersRound, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAccessibleFeatures } from "@/hooks/useRoleFeatureAccess";
import { useMemo } from "react";

const primary = [
  { path: "/", label: "Home", icon: Home },
  { path: "/incidents", label: "Report", icon: Siren },
  { path: "/proposals", label: "Vote", icon: Landmark },
  { path: "/community", label: "Community", icon: UsersRound },
];

/**
 * Calm mobile bottom nav with labels (not icons-only).
 * Replaces the floating FAB clutter on mobile.
 * Desktop: hidden (top nav handles it).
 */
const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const { features } = useAccessibleFeatures();

  // Hide on auth/embed/admin to avoid clashing with their own chrome
  const hidden = useMemo(() => {
    const p = location.pathname;
    return p.startsWith("/auth") || p.startsWith("/embed/") || p.startsWith("/admin");
  }, [location.pathname]);

  if (hidden) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-card/95 backdrop-blur-xl border-t border-border/60 pb-safe shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.08)]"
      aria-label="Primary mobile navigation"
    >
      <div className="grid grid-cols-5 max-w-md mx-auto">
        {primary.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 min-h-[3.5rem] transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center justify-center gap-0.5 py-2 min-h-[3.5rem] text-muted-foreground hover:text-foreground transition-colors"
              aria-label="More options"
            >
              <Menu className="h-[18px] w-[18px]" />
              <span className="text-[10px] font-medium leading-none">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="space-y-1 py-2">
              <p className="eyebrow px-2 pb-2">Quick Access</p>
              {[
                { path: "/peace-pulse", label: "Peace Pulse" },
                { path: "/safety", label: "Safety Portal" },
                { path: "/nuru-ai", label: "NuruAI Civic Intel" },
                { path: "/elections", label: "Election Monitoring" },
                { path: "/radio", label: "Peace Radio" },
                { path: "/about", label: "About" },
                { path: "/help", label: "Help & Support" },
              ].map((l) => (
                <SheetClose asChild key={l.path}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-11"
                    onClick={() => navigate(l.path)}
                  >
                    {l.label}
                  </Button>
                </SheetClose>
              ))}
              {user && (
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-11"
                    onClick={() => navigate("/dashboard")}
                  >
                    My Dashboard
                  </Button>
                </SheetClose>
              )}
              {isAdmin && (
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-11 mt-2"
                    onClick={() => navigate("/admin")}
                  >
                    Admin Portal
                  </Button>
                </SheetClose>
              )}
              {!user && (
                <SheetClose asChild>
                  <Button
                    className="w-full h-11 mt-2"
                    onClick={() => navigate("/auth")}
                  >
                    Sign In
                  </Button>
                </SheetClose>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
