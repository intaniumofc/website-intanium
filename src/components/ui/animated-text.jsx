import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

const AnimatedText = React.forwardRef(
  ({
    text,
    duration = 0.05,
    delay = 0.08,
    replay = true,
    className,
    textClassName,
    underlineClassName,
    as: Component = "h1",
    underlineGradient = "from-[var(--color-primary-hover)] to-[var(--color-secondary)]",
    underlineHeight = "h-1.5",
    underlineOffset = "-bottom-2",
    ...props
  }, ref) => {
    const letters = Array.from(text)

    const container = {
      hidden: { 
        opacity: 0 
      },
      visible: (i = 1) => ({
        opacity: 1,
        transition: { 
          staggerChildren: duration, 
          delayChildren: i * delay 
        }
      })
    }

    const child = {
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          damping: 14,
          stiffness: 150
        }
      },
      hidden: {
        opacity: 0,
        y: 20,
        transition: {
          type: "spring",
          damping: 14,
          stiffness: 150
        }
      }
    }

    const lineVariants = {
      hidden: {
        width: "0%",
        left: "50%"
      },
      visible: {
        width: "100%",
        left: "0%",
        transition: {
          delay: (letters.length * duration) + delay + 0.1,
          duration: 0.8,
          ease: "easeOut"
        }
      }
    }

    return (
      <Component 
        ref={ref} 
        className={cn("flex flex-col items-center justify-center gap-2", className)}
        {...props}
      >
        <div className="relative">
          <motion.div
            style={{ display: "flex", overflow: "hidden" }}
            variants={container}
            initial="hidden"
            animate={replay ? "visible" : "hidden"}
            className={cn("text-4xl font-bold text-center", textClassName)}
          >
            {letters.map((letter, index) => (
              <motion.span key={index} variants={child}>
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            variants={lineVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "absolute",
              underlineHeight,
              underlineOffset,
              "bg-gradient-to-r",
              underlineGradient,
              underlineClassName
            )}
          />
        </div>
      </Component>
    )
  }
)
AnimatedText.displayName = "AnimatedText"

export { AnimatedText }
