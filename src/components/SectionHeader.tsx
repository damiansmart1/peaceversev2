import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  centered?: boolean;
}
const SectionHeader = ({
  badge,
  title,
  subtitle,
  icon,
  className,
  centered = true
}: SectionHeaderProps) => {
  return <div className={cn("space-y-3 sm:space-y-4 mb-8 sm:mb-12 border-l-4 border-primary pl-4 sm:pl-6", centered ? "text-center border-l-0 pl-0" : "text-left", className)}>
      {badge && <div className={cn("flex", centered ? "justify-center" : "justify-start")}>
          <Badge variant="secondary" className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-sm font-medium uppercase text-xs tracking-wider">
            {icon && <span className="mr-1.5 sm:mr-2">{icon}</span>}
            {badge}
          </Badge>
        </div>}
      
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground text-center break-word">
        {title}
      </h2>
      
      {subtitle && <div className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">{subtitle}</div>}
    </div>;
};
export default SectionHeader;