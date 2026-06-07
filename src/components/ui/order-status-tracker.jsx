import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import ThreeDBox from "./ThreeDBox";

// Reusable Card component for consistent styling
export const InfoCard = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-slate-200 bg-white text-slate-800 p-5 shadow-sm",
      className
    )}
    {...props}
  />
));
InfoCard.displayName = "InfoCard";


export const OrderStatus = ({
  status = "pending",
  illustrationUrl,
  statusTitle,
  statusDescription,
  item,
  summary,
  timelineSteps,
  trackingStatus,
  buttonLabel = "Track order",
  buttonIcon,
  onTrackOrder,
  useThreeD = true,
  className,
}) => {
  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className={cn("max-w-md w-full mx-auto p-4 font-sans", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header section with illustration and status */}
      <motion.div variants={itemVariants} className="text-center space-y-2 mb-6 animate-fade-in">
        {useThreeD ? (
          <ThreeDBox status={status} className="w-32 h-32 mx-auto" />
        ) : (
          <img
            src={illustrationUrl}
            alt="Order Status Illustration"
            className="w-32 h-32 mx-auto object-contain drop-shadow-sm"
          />
        )}
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{statusTitle}</h1>
        <p className="text-xs sm:text-sm text-slate-400 font-bold leading-relaxed">{statusDescription}</p>
      </motion.div>

      {/* Ordered item details card */}
      <motion.div variants={itemVariants} className="mb-4">
        <InfoCard>
          <div className="flex items-center space-x-4">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-16 h-16 rounded-xl bg-slate-50 object-cover border border-slate-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-slate-800 text-xs sm:text-sm truncate">{item.name}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 truncate">{item.details}</p>
            </div>
            <p className="font-black text-slate-850 shrink-0 text-xs sm:text-sm">
              {item.priceFormatted || `$${item.price.toFixed(2)}`}
            </p>
          </div>
        </InfoCard>
      </motion.div>

      {/* Optional Timeline Progress Tracker inside Card */}
      {timelineSteps && timelineSteps.length > 0 && (
        <motion.div variants={itemVariants} className="mb-4">
          <InfoCard className="py-4 px-5">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-3.5 flex items-center gap-1.5">
              <span className="w-1 h-3 bg-[var(--color-primary)] rounded-full"></span>
              Tahapan Pre-Order
            </h3>
            
            <div className="space-y-4 relative before:absolute before:left-2.5 before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-slate-100">
              {timelineSteps.map((step, i) => {
                const isDone = step.state === 'done';
                const isCurrent = step.state === 'current';
                return (
                  <div key={step.label} className="flex gap-3.5 items-start relative pl-0.5">
                    <div className={`relative z-10 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold border transition duration-300 ${
                      isDone ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs' :
                      isCurrent ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-xs animate-pulse' :
                      'bg-white text-slate-400 border-slate-200'
                    }`}>
                      {isDone ? '\u2713' : i + 1}
                    </div>
                    <div className="space-y-0.5 pt-0.5 min-w-0 flex-1">
                      <h4 className={`text-[11px] font-bold tracking-wide leading-none ${
                        isDone ? 'text-emerald-600' : isCurrent ? 'text-slate-800 font-black' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-semibold leading-relaxed mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </InfoCard>
        </motion.div>
      )}
      
      {/* Order summary card */}
      <motion.div variants={itemVariants} className="mb-6">
        <InfoCard className="space-y-3.5">
            <h2 className="font-black text-xs uppercase tracking-wider text-slate-450 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <span className="w-1 h-3 bg-[var(--color-primary)] rounded-full"></span>
              Detail Transaksi
            </h2>
            {summary.map((line, index) => (
                <div key={index} className="flex justify-between items-start text-xs leading-normal">
                    <p className="text-slate-400 font-bold shrink-0 mr-4">{line.label}</p>
                    <p className="text-slate-800 font-extrabold text-right break-words max-w-[240px]">{line.value}</p>
                </div>
            ))}
        </InfoCard>
      </motion.div>

      {/* Action button and final status text */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        {onTrackOrder && (
          <Button 
            onClick={onTrackOrder} 
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 duration-200 cursor-pointer",
              buttonLabel.includes("WhatsApp") 
                ? "bg-emerald-500 hover:bg-emerald-600" 
                : "bg-slate-900 hover:bg-slate-800"
            )}
          >
              {buttonIcon}
              {buttonLabel}
          </Button>
        )}
        {trackingStatus && (
          <p className="text-xs text-green-600 dark:text-green-500 font-bold tracking-wide leading-relaxed">
            {trackingStatus}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};
