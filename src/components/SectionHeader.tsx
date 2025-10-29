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
      "space-y-3 mb-10",
      centered ? "text-center" : "text-left",
      className
    )}>
      {badge && (
        <div className={cn("flex", centered ? "justify-center" : "justify-start")}>
          <Badge variant="secondary" className="px-4 py-1.5 rounded-full shadow-sm">
            {icon && <span className="mr-2">{icon}</span>}
            {badge}
          </Badge>
        </div>
      )}
      
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
        <span className="bg-peace-gradient bg-clip-text text-transparent">
          {title}
        </span>
      </h2>
      
      {subtitle && (
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;