import React from 'react';
import { cn } from "../../lib/utils";

/**
 * SocialTooltip Component
 * Renders a list of social media icons with a physics-based liquid fill animation
 * on hover and a matching brand-colored tooltip.
 */
const SocialTooltip = React.forwardRef(({ className, items, ...props }, ref) => {
  // Base styles for the component
  const baseIconStyles =
    "relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-lg hover:scale-105 active:scale-95";
  
  const baseFilledStyles =
    "absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-in-out group-hover:h-full z-0";
  
  const baseTooltipStyles =
    "absolute bottom-[-32px] left-1/2 -translate-x-1/2 px-2.5 py-1 text-[10px] sm:text-xs text-white whitespace-nowrap rounded-md opacity-0 invisible transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:visible group-hover:bottom-[-42px] font-bold z-20 shadow-md";

  return (
    <ul
      ref={ref}
      className={cn("flex items-center justify-center gap-3 sm:gap-4", className)}
      {...props}
    >
      {items.map((item, index) => {
        const hasCustomIcon = typeof item.icon === 'function' || React.isValidElement(item.icon);
        
        return (
          <li key={index} className="relative group list-none">
            <a
              href={item.href}
              aria-label={item.ariaLabel}
              className={cn(baseIconStyles)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* Liquid brand color fill effect */}
              <div
                className={cn(baseFilledStyles)}
                style={{ backgroundColor: item.color }}
              />
              
              {/* Icon rendering (Support custom React components/SVG for perfect styling & hover colors) */}
              <div className="relative z-10 transition-colors duration-300 ease-in-out text-white group-hover:text-white flex items-center justify-center">
                {hasCustomIcon ? (
                  typeof item.icon === 'function' ? item.icon() : item.icon
                ) : (
                  <img
                    src={item.svgUrl}
                    alt={item.ariaLabel}
                    className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                  />
                )}
              </div>
            </a>
            
            {/* Elegant Tooltip */}
            <div
              className={cn(baseTooltipStyles)}
              style={{ backgroundColor: item.color }}
            >
              {item.tooltip}
            </div>
          </li>
        );
      })}
    </ul>
  );
});

SocialTooltip.displayName = "SocialTooltip";

export { SocialTooltip };
