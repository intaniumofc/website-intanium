'use client';

import * as React from "react"
import { cn } from "../../lib/utils"

export const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-[var(--border-color)]",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-iris-gradient transition-all duration-300 ease-out"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"
