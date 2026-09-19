import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";
import { cn } from "../../../lib/utils";

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof BaseSeparator> {
  orientation?: "horizontal" | "vertical";
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <BaseSeparator
      ref={ref}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-line-subtle",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  ),
);

Separator.displayName = "Separator";
