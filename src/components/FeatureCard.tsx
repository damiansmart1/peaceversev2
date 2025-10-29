import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient?: string;
  className?: string;
  onClick?: () => void;
}

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  gradient = "bg-gradient-to-br from-primary/5 to-accent/5",
  className,
  onClick 
}: FeatureCardProps) => {
  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-elevated hover:-translate-y-2 border border-border/50 hover:border-primary/30 rounded-xl",
        gradient,
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5 h-full flex flex-col">
        <div className="mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
          {description}
        </p>
        <div className="mt-3 w-10 h-1 bg-gradient-to-r from-primary via-accent to-primary-glow rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </CardContent>
    </Card>
  );
};

export default FeatureCard;