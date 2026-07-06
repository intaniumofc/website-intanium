'use client';

import React from "react";
import { motion } from "framer-motion";

/**
 * Scroll and timeline animation wrapper component using Framer Motion.
 */
export const TimelineContent = ({
  as = "div",
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
  ...props
}) => {
  const Component = motion[as] || motion.div;

  return (
    <Component
      variants={customVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      custom={animationNum}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};
