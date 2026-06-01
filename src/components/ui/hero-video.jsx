import * as React from "react"
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion"

import { cn } from "../../lib/utils"

const SPRING_CONFIG = {
  type: "spring",
  stiffness: 55,
  damping: 20,
  mass: 1.2,
  restDelta: 0.002,
}

const useAnimationVariants = (animate) =>
  React.useMemo(
    () => ({
      hidden: {
        x: animate === "left" ? "-100%" : animate === "right" ? "100%" : 0,
        y: animate === "top" ? "-30px" : animate === "bottom" ? "30px" : 0, // change from 100% viewport shift to elegant 30px slide-in
        scale: animate === "z" ? 0 : 1,
        filter: animate === "blur" ? "blur(10px)" : "blur(0px)",
        opacity: 0,
      },
      visible: {
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        opacity: 1,
      },
    }),
    [animate]
  )

const ContainerStagger = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <motion.div
      className={cn("relative", className)}
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, ...props.viewport }}
      transition={{
        staggerChildren: props.transition?.staggerChildren || 0.25,
        ...props.transition,
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
})
ContainerStagger.displayName = "ContainerStagger"

const ContainerScrollContext = React.createContext(undefined)

function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext)
  if (!context) {
    throw new Error(
      "useContainerScrollContext must be used within <ContainerScroll> component"
    )
  }
  return context
}

const ContainerScroll = ({
  children,
  className,
  ...props
}) => {
  const scrollRef = React.useRef(null)
  const { scrollYProgress } = useScroll({
    target: scrollRef,
  })

  React.useEffect(() => {
    // Force a scroll calculation to prevent the card from flashing full-width on load
    window.dispatchEvent(new Event("scroll"))
    
    const t1 = setTimeout(() => {
      window.dispatchEvent(new Event("scroll"))
    }, 50)
    
    const t2 = setTimeout(() => {
      window.dispatchEvent(new Event("scroll"))
    }, 150)
    
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <section
        className={cn(
          "relative min-h-[50vh] w-full pb-8 pt-8",
          className
        )}
        {...props}
        ref={scrollRef}
      >
        {children}
      </section>
    </ContainerScrollContext.Provider>
  )
}
ContainerScroll.displayName = "ContainerScroll"

const ContainerAnimated = React.forwardRef(({ animation, children, className, ...props }, ref) => {
  const variants = useAnimationVariants(animation)

  return (
    <motion.div
      transition={props.transition || SPRING_CONFIG}
      ref={ref}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
})
ContainerAnimated.displayName = "ContainerAnimated"

const ContainerInset = React.forwardRef(
  (
    {
      translateYRange = ["0%", "0%"],
      insetYRange = [35, 0],
      insetXRange = [42, 0],
      roundednessRange = [1000, 16],
      insetTopRange,
      insetBottomRange,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const { scrollYProgress } = useContainerScrollContext()
    const y = useTransform(scrollYProgress, [0, 1], translateYRange)

    const insetTopVal = insetTopRange || insetYRange
    const insetBottomVal = insetBottomRange || insetYRange

    const insetTop = useTransform(scrollYProgress, [0, 1], insetTopVal)
    const insetBottom = useTransform(scrollYProgress, [0, 1], insetBottomVal)
    const insetX = useTransform(scrollYProgress, [0, 1], insetXRange)
    const roundedness = useTransform(scrollYProgress, [0, 1], roundednessRange)

    const clipPath = useMotionTemplate`inset(${insetTop}% ${insetX}% ${insetBottom}% ${insetX}% round ${roundedness}px)`

    const style = React.useMemo(
      () => ({ y, clipPath, ...props.style }),
      [y, clipPath, props.style]
    )
    return (
      <motion.div
        transition={SPRING_CONFIG || props.transition}
        ref={ref}
        className={cn("origin-top overflow-hidden", className)}
        style={style}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
ContainerInset.displayName = "ContainerInset"

export { ContainerAnimated, ContainerStagger, ContainerScroll, ContainerInset }
