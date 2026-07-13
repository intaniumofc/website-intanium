import * as React from "react";
import { cn } from "@/lib/utils";

// Interface for a single feature item
export interface Feature {
  imageSrc?: string;
  imageAlt?: string;
  title: string;
  description: string;
  href?: string;
}

// Interface for the component props
export interface FeatureGridProps {
  features: Feature[];
  className?: string;
}

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <div
    className={cn(
      "group",
      "flex flex-col items-start gap-3",
      "p-6 rounded-3xl border",
      "bg-white/60 backdrop-blur-md text-[var(--text-secondary)] border-[var(--border-color)]",
      "transition-all duration-300 shadow-sm",
      "hover:shadow-md hover:-translate-y-1"
    )}
  >
    <h3 className="text-lg font-black text-[var(--color-primary)] leading-snug">
      {feature.title}
    </h3>
    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
      {feature.description}
    </p>
  </div>
);

const FeatureGrid = React.forwardRef<
  HTMLDivElement,
  FeatureGridProps
>(({ features, className }, ref) => {
  if (!features || features.length === 0) {
    return null; // Don't render anything if there are no features
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-1 gap-6 lg:grid-cols-2", // Responsive grid layout
        className
      )}
    >
      {features.map((feature, index) => (
        <FeatureCard key={index} feature={feature} />
      ))}
    </div>
  );
});
FeatureGrid.displayName = "FeatureGrid";

export { FeatureGrid };
