import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Hub, filterHubLinks } from "@/lib/hubs";
import { useAccessibleFeatures } from "@/hooks/useRoleFeatureAccess";
import { useUserRoles } from "@/hooks/useRoleCheck";
import { cn } from "@/lib/utils";

interface HubMenuProps {
  hub: Hub;
  isActive?: boolean;
}

const HubMenu = ({ hub, isActive }: HubMenuProps) => {
  const Icon = hub.icon;
  const { features } = useAccessibleFeatures();
  const { data: rolesData } = useUserRoles();
  const userRoles = (rolesData?.map((r: any) => r.role) || []) as string[];
  const links = filterHubLinks(hub, features, userRoles);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-md text-sm font-medium transition-colors",
            isActive
              ? "text-primary bg-primary/10"
              : "text-foreground/80 hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Icon className={cn("w-4 h-4", hub.accent)} />
          <span>{hub.label}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 p-2">
        <div className="px-2 py-1.5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {hub.label}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-0.5">{hub.tagline}</p>
        </div>
        <div className="h-px bg-border my-1" />
        {links.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            Sign in to access {hub.label} tools.
          </p>
        ) : (
          links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-start gap-2.5 rounded-md p-2 hover:bg-muted/60 transition-colors group"
            >
              <ArrowRight className="w-3.5 h-3.5 mt-1 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {link.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  {link.desc}
                </p>
              </div>
            </Link>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HubMenu;
