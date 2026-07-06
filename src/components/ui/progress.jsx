'use client';

import * as React from "react"
import { cn } from "../../lib/utils"

export const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 transition-all duration-300 ease-out"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"
