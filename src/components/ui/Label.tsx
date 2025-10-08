import * as React from "react";
import { cn } from "@/src/lib/utils";

export function Label({
  className,
  children,
  htmlFor,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block text-sm font-medium leading-6 text-foreground",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}
