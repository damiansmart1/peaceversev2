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
  return (
    <div className={cn(
      "space-y-4 mb-12 border-l-4 border-primary pl-6",
      centered ? "text-center border-l-0 pl-0" : "text-left",
      className
    )}>
      {badge && (
        <div className={cn("flex", centered ? "justify-center" : "justify-start")}>
          <Badge variant="secondary" className="px-4 py-1.5 rounded-sm font-medium uppercase text-xs tracking-wider">
            {icon && <span className="mr-2">{icon}</span>}
            {badge}
          </Badge>
        </div>
      )}
      
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      
      {subtitle && (
        <p className="text-sm md:text-base text-muted-foreground max-w-3xl leading-relaxed" style={{ marginTop: '0.75rem' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;