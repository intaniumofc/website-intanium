'use client';

import React, { useState } from "react";
import Link from 'next/link';

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

export function PortfolioGallery({
  title = "Browse my library",
  archiveButton = {
    text: "View gallery",
    href: "/work"
  },
  images: customImages,
  className = "",
  maxHeight = 120,
  spacing = "-space-x-32 md:-space-x-40 lg:-space-x-52",
  onImageClick,
  pauseOnHover = true,
  marqueeRepeat = 4
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const defaultImages = [
    {
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop&q=80",
      alt: "Visual Key Summer Party",
      title: "Visual Key Summer Party"
    },
    {
      src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=600&fit=crop&q=80",
      alt: "Matcha Vibes Cafe Shooting",
      title: "Matcha Vibes Cafe Shooting"
    },
    {
      src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=600&fit=crop&q=80",
      alt: "1st Anniversary Key Visual",
      title: "1st Anniversary Key Visual"
    },
    {
      src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=600&fit=crop&q=80",
      alt: "Gita & Intan Concert Behind Stage",
      title: "Gita & Intan Concert Behind Stage"
    },
    {
      src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=600&fit=crop&q=80",
      alt: "Intanium Cozy Pajamas Outfit",
      title: "Intanium Cozy Pajamas Outfit"
    },
    {
      src: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&h=600&fit=crop&q=80",
      alt: "Theater Show JKT48 Portrait",
      title: "Theater Show JKT48 Portrait"
    }
  ];

  const images = customImages || defaultImages;

  return (
    <section
      aria-label={title}
      className={cn("relative min-h-[500px] py-12 px-0 select-none", className)}
      id="archives"
    >
      {/* Inline styles for custom marquee scrolling */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee-scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-25%); }
        }
        .animate-marquee-custom {
          display: flex;
          animation: marquee-scroll var(--duration, 35s) linear infinite;
        }
      `}} />

      <div className="max-w-7xl mx-auto bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden shadow-xl shadow-[var(--color-primary)]/5">
        {/* Header Section */}
        <div className="relative z-10 text-center pt-16 pb-4 px-8">
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-6 text-balance">{title}</h2>

          <Link
            href={archiveButton.href}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-md active:scale-95 group mb-14"
          >
            <span>{archiveButton.text}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Desktop 3D overlapping layout - hidden on mobile */}
        <div className="hidden md:block relative overflow-hidden h-[460px] -mb-[160px] pt-12">
          <div className={cn("flex pb-8 pt-20 items-end justify-center", spacing)}>
            {images.map((image, index) => {
              // Calculate stagger height - peak in middle, descending to edges
              const totalImages = images.length;
              const middle = Math.floor(totalImages / 2);
              const distanceFromMiddle = Math.abs(index - middle);
              const staggerOffset = maxHeight - distanceFromMiddle * 18;

              const zIndex = totalImages - index;

              const isHovered = hoveredIndex === index;
              const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;

              // When hovering: hovered card moves to consistent top position, others move to baseline
              const yOffset = isHovered ? -130 : isOtherHovered ? 0 : -staggerOffset;

              return (
                <motion.div
                  key={index}
                  className="group cursor-pointer flex-shrink-0"
                  style={{
                    zIndex: zIndex,
                  }}
                  initial={{
                    transform: `perspective(5000px) rotateY(-42deg) translateY(180px)`,
                    opacity: 0,
                  }}
                  animate={{
                    transform: `perspective(5000px) rotateY(-42deg) translateY(${yOffset}px)`,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.22, // Faster hover animation
                    delay: index * 0.04, // Entrance stagger
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  onClick={() => onImageClick?.(index)}
                >
                  <div
                    className="relative aspect-[4/3] w-64 md:w-80 lg:w-[26rem] rounded-[2rem] overflow-hidden transition-transform duration-300 group-hover:scale-105 border-4 border-white/85 shadow-2xl"
                    style={{
                      boxShadow: `
                        rgba(0, 0, 0, 0.01) 0.796192px 0px 0.796192px 0px,
                        rgba(0, 0, 0, 0.03) 2.41451px 0px 2.41451px 0px,
                        rgba(0, 0, 0, 0.06) 6.38265px 0px 6.38265px 0px,
                        rgba(74, 122, 191, 0.22) 20px 0px 20px 0px
                      `,
                    }}
                  >
                    <img
                      src={(image.src || "/placeholder.svg")?.src || (image.src || "/placeholder.svg")}
                      alt={image.alt}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Hover text visual strip */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[10px] text-white/90 font-bold uppercase tracking-wider block">
                        {image.title || "Lihat Foto"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile marquee layout */}
        <div className="block md:hidden relative pb-10">
          <div
            className={cn(
              "group flex overflow-hidden p-2 [--duration:35s] [--gap:1rem] [gap:var(--gap)]",
              "flex-row"
            )}
          >
            {Array(marqueeRepeat)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex shrink-0 justify-around [gap:var(--gap)]",
                    "animate-marquee-custom flex-row",
                    {
                      "group-hover:[animation-play-state:paused]": pauseOnHover,
                    }
                  )}
                >
                  {images.map((image, index) => (
                    <div
                      key={`${i}-${index}`}
                      className="group cursor-pointer flex-shrink-0"
                      onClick={() => onImageClick?.(index)}
                    >
                      <div
                        className="relative aspect-[4/3] w-48 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105 border-2 border-white shadow-md"
                        style={{
                          boxShadow: `
                            rgba(0, 0, 0, 0.01) 0.796192px 0px 0.796192px 0px,
                            rgba(0, 0, 0, 0.03) 2.41451px 0px 2.41451px 0px,
                            rgba(74, 122, 191, 0.12) 10px 0px 10px 0px
                          `,
                        }}
                      >
                        <img
                          src={(image.src || "/placeholder.svg")?.src || (image.src || "/placeholder.svg")}
                          alt={image.alt}
                          className="w-full h-full object-cover object-center"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
