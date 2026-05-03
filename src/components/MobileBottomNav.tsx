import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, Siren, Eye, Megaphone, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import HubMobileList from "@/components/nav/HubMobileList";
import ReportWizard from "@/components/ReportWizard";

/**
 * Mobile bottom nav mirrors the 4 hubs.
 * Center "Report" button opens the 3-step wizard (single reporting entry-point).
 */
const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const [wizardOpen, setWizardOpen] = useState(false);

  const hidden = useMemo(() => {
    const p = location.pathname;
    return p.startsWith("/auth") || p.startsWith("/embed/") || p.startsWith("/admin");
  }, [location.pathname]);

  if (hidden) return null;

  const NavBtn = ({
    to,
    label,
    icon: Icon,
  }: {
    to: string;
    label: string;
    icon: typeof Home;
  }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 py-2 min-h-[3.5rem] transition-colors",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
        <span className="text-[10px] font-medium leading-none">{label}</span>
      </Link>
    );
  };

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-card/95 backdrop-blur-xl border-t border-border/60 pb-safe shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.08)]"
        aria-label="Primary mobile navigation"
      >
        <div className="grid grid-cols-5 max-w-md mx-auto">
          <NavBtn to="/" label="Home" icon={Home} />
          <NavBtn to="/peace-pulse" label="Watch" icon={Eye} />

          {/* Center FAB-style Report button */}
          <button
            onClick={() => setWizardOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 py-2 min-h-[3.5rem] -mt-3"
            aria-label="Create new report"
          >
            <span className="w-12 h-12 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg">
              <Siren className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-semibold text-foreground leading-none mt-0.5">
              Report
            </span>
          </button>

          <NavBtn to="/community" label="Act" icon={Megaphone} />

          <Sheet>
            <SheetTrigger asChild>
              <button
                className="flex flex-col items-center justify-center gap-0.5 py-2 min-h-[3.5rem] text-muted-foreground hover:text-foreground transition-colors"
                aria-label="More"
              >
                <Sparkles className="h-[18px] w-[18px] text-gold" />
                <span className="text-[10px] font-medium leading-none">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <div className="space-y-2 py-2">
                <p className="eyebrow px-2 pb-1">Browse all hubs</p>
                <HubMobileList />
                <div className="pt-3 space-y-1.5 border-t border-border/40">
                  {user && (
                    <Button asChild variant="ghost" className="w-full justify-start h-11">
                      <Link to="/dashboard">My Dashboard</Link>
                    </Button>
                  )}
                  <Button asChild variant="ghost" className="w-full justify-start h-11">
                    <Link to="/about">About</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start h-11">
                    <Link to="/help">Help & Support</Link>
                  </Button>
                  {isAdmin && (
                    <Button asChild variant="outline" className="w-full justify-start h-11 mt-2">
                      <Link to="/admin">Admin Portal</Link>
                    </Button>
                  )}
                  {!user && (
                    <Button asChild className="w-full h-11 mt-2">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <ReportWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </>
  );
};

export default MobileBottomNav;
