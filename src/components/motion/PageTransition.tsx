import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Wraps page content with a subtle fade+lift transition on route change.
 * Drop into any page root (or in App.tsx around <Routes/>).
 */
export const PageTransition = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div
      key={pathname}
      className={cn(className)}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 380ms ease, transform 380ms cubic-bezier(0.22,1,0.36,1)",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
