'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './ScrollFloat.css';

export default function ScrollFloat({
  children,
  containerClassName = '',
  textClassName = '',
  animationDuration = 0.8,
  stagger = 0.03,
  as: Component = 'div'
}) {
  const words = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(' ').map((word, wordIndex) => ({
      word,
      chars: word.split(''),
      wordIndex
    }));
  }, [children]);

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: 0.1
      }
    }
  };

  const charVariants = {
    hidden: {
      opacity: 0,
      y: 28,
      scaleY: 1.8,
      scaleX: 0.7,
      transformOrigin: '50% 0%'
    },
    visible: {
      opacity: 1,
      y: 0,
      scaleY: 1,
      scaleX: 1,
      transition: {
        duration: animationDuration,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <Component className={`scroll-float ${containerClassName}`}>
      <motion.span
        className={`scroll-float-text inline-block ${textClassName}`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
      >
        {words.map(({ word, chars, wordIndex }) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.28em]">
            {chars.map((char, charIndex) => (
              <motion.span
                key={charIndex}
                className="inline-block char"
                variants={charVariants}
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.span>
    </Component>
  );
}
