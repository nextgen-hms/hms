import * as React from "react";
import { cn } from "@/src/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm transition hover:shadow-md",
        "p-4 md:p-6", 
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
