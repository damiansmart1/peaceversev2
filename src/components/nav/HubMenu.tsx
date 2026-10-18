import { useTranslationContext } from '@/components/TranslationProvider';
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
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
  const [open, setOpen] = useState(false);
  const { t } = useTranslationContext();
  const { features } = useAccessibleFeatures();
  const { data: rolesData } = useUserRoles();
  const userRoles = (rolesData?.map((r: any) => r.role) || []) as string[];
  const links = filterHubLinks(hub, features, userRoles);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <div>
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
          <span>{t(`navigation.${hub.label}`, hub.label)}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent
        align="start"
        className="w-72 p-2"
      >
        <div className="px-2 py-1.5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {t(`navigation.${hub.label}`, hub.label)}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-0.5">{t(`navigation.${hub.tagline}`, hub.tagline)}</p>
        </div>
        <div className="h-px bg-border my-1" />
        {links.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            {rolesData && rolesData.length > 0
              ? `${t(`navigation.${hub.label}`, hub.label)} tools aren't enabled for your account yet. Ask an admin to turn them on.`
              : `Sign in to access ${t(`navigation.${hub.label}`, hub.label)} tools.`}
          </p>
        ) : (
          links.map((link) => (
            <DropdownMenuItem key={link.path} asChild><Link
              to={link.path}
              className="flex items-start gap-2.5 rounded-md p-2 hover:bg-muted/60 transition-colors group"
            >
              <ArrowRight className="w-3.5 h-3.5 mt-1 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {t(`navigation.${link.label}`, link.label)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  {t(`navigation.${link.desc}`, link.desc)}
                </p>
              </div>
            </Link></DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HubMenu;
