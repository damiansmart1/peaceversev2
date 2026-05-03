import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HUBS, filterHubLinks } from "@/lib/hubs";
import { useAccessibleFeatures } from "@/hooks/useRoleFeatureAccess";
import { useUserRoles } from "@/hooks/useRoleCheck";
import { cn } from "@/lib/utils";

interface Props {
  onNavigate?: () => void;
}

/** Mobile menu (in Sheet) that lists the 4 hubs with collapsible links inside. */
const HubMobileList = ({ onNavigate }: Props) => {
  const { features } = useAccessibleFeatures();
  const { data: rolesData } = useUserRoles();
  const userRoles = (rolesData?.map((r: any) => r.role) || []) as string[];

  return (
    <Accordion type="multiple" className="w-full">
      {HUBS.map((hub) => {
        const Icon = hub.icon;
        const links = filterHubLinks(hub, features, userRoles);
        if (links.length === 0) return null;
        return (
          <AccordionItem key={hub.key} value={hub.key} className="border-border/40">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-3">
                <Icon className={cn("w-5 h-5", hub.accent)} />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{hub.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">{hub.tagline}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-0.5 pl-8">
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={onNavigate}
                    className="flex items-center justify-between gap-2 py-2 px-2 rounded-md text-sm hover:bg-muted/60"
                  >
                    <span className="text-foreground">{link.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default HubMobileList;
