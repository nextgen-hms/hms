import * as React from "react";
import { cn } from "@/src/lib/utils";

export const Input=React.forwardRef<HTMLInputElement,React.ComponentProps<"input">> (function Input({
  className,
  type,
  value,
  ...props
},ref) {
  return (
    <input
      type={type}
      ref={ref}
      {...props}
      className={cn(
        "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all",
        "placeholder:text-muted-foreground text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/30",
        className
      )}
    />
  );
})
