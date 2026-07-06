'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalTimeline({ achievements = [] }) {
  const triggerRef = useRef(null);
  const scrollRef = useRef(null);

  const timelineAchievements = achievements.filter(
    (achievement) => achievement.showInTimeline !== false
  );

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const triggerEl = triggerRef.current;

    if (!scrollEl || !triggerEl) return;

    let ctx = gsap.context(() => {
      // Calculate scroll width dynamically
      const getScrollAmount = () => {
        return -(scrollEl.scrollWidth - window.innerWidth);
      };

      gsap.fromTo(
        scrollEl,
        { x: 0 },
        {
          x: getScrollAmount,
          ease: 'none',
          scrollTrigger: {
            trigger: triggerEl,
            pin: true,
            scrub: 0.6,
            start: 'top top',
            end: () => `+=${scrollEl.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true,
          },
        }
      );
    }, triggerEl);

    return () => ctx.revert();
  }, [timelineAchievements.length]);

  if (timelineAchievements.length === 0) return null;

  return (
    <div ref={triggerRef} className="w-full relative overflow-hidden bg-[#07032D]">
      {/* Intro Header inside horizontal scroll */}
      <div className="absolute top-12 left-12 z-20 max-w-lg select-none">
        <h2 className="text-3xl font-black text-white leading-tight font-heading">
          Jejak Cahaya Intan
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Scroll ke bawah untuk melihat linimasa perjalanan karir Nur Intan dari awal hingga pencapaian terbaru.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-row h-[100vh] w-max items-center relative"
      >
        {/* Central glowing timeline bar track */}
        <div className="absolute left-0 right-0 top-1/2 h-[3px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 pointer-events-none -translate-y-1/2 opacity-75 shadow-[0_0_15px_rgba(139,92,246,0.5)]" />

        {/* Flex container for achievements */}
        <div className="flex flex-row items-center h-full pl-[25vw] pr-[25vw] gap-2">
          {timelineAchievements.map((achievement, index) => {
            const isTop = index % 2 === 0;
            return (
              <div
                key={achievement.id || index}
                className="w-[420px] shrink-0 px-8 flex flex-col items-center relative h-[620px] justify-between"
              >
                {/* TOP SLOT */}
                <div className="w-full flex flex-col items-center h-[260px] justify-end">
                  {isTop && (
                    <div className="shining-timeline-card w-full shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:border-purple-500/40 transition-all duration-300 select-none">
                      {achievement.image && (
                        <div className="shining-timeline-image">
                          <img
                            src={(achievement.image)?.src || (achievement.image)}
                            alt={achievement.title}
                            className="h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="shining-timeline-content text-left">
                        <p className="shining-timeline-date">{achievement.date}</p>
                        <h3 className="text-[#17105f] font-black">{achievement.title}</h3>
                        <p className="text-slate-500">{achievement.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CENTER NODE */}
                <div className="relative h-[80px] flex items-center justify-center">
                  {/* Stem line connecting card to node */}
                  <div
                    className={`absolute w-[2px] bg-gradient-to-b ${isTop
                        ? 'from-indigo-500/50 to-transparent bottom-1/2 top-0'
                        : 'from-transparent to-pink-500/50 top-1/2 bottom-0'
                      }`}
                  />

                  {/* Dot node */}
                  <div
                    className={`shining-node ${achievement.category === 'Milestone' ? 'milestone' : 'theater'
                      } ${achievement.isMajor ? 'is-major' : ''
                      } z-10 scale-125 shadow-[0_0_12px_rgba(109,92,255,0.6)]`}
                  >
                    {achievement.isMajor && (
                      <Star className="text-white w-3 h-3 fill-current" />
                    )}
                  </div>
                </div>

                {/* BOTTOM SLOT */}
                <div className="w-full flex flex-col items-center h-[260px] justify-start">
                  {!isTop && (
                    <div className="shining-timeline-card w-full shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:translate-y-1 hover:border-pink-500/40 transition-all duration-300 select-none">
                      {achievement.image && (
                        <div className="shining-timeline-image">
                          <img
                            src={(achievement.image)?.src || (achievement.image)}
                            alt={achievement.title}
                            className="h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="shining-timeline-content text-left">
                        <p className="shining-timeline-date">{achievement.date}</p>
                        <h3 className="text-[#17105f] font-black">{achievement.title}</h3>
                        <p className="text-slate-500">{achievement.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
