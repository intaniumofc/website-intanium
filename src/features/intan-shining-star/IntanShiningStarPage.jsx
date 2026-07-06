'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useSafeReducedMotion } from '../../hooks/useSafeReducedMotion';
import {
  ArrowDown,
  ArrowUp,
  Star,
} from 'lucide-react';
import Loading from '../../components/common/Loading';
import { achievementService } from './achievementService';
import './IntanShiningStarPage.css';

const CATEGORY_CLASS = {
  Milestone: 'milestone',
  Theater: 'theater',
  Live: 'live',
  'Video Call': 'video-call',
  Event: 'event',
  Content: 'content',
  'Fan Project': 'fan-project',
};

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] } },
};

function SectionHeading({ eyebrow, title, description, centered = false, headingLevel: Heading = 'h2' }) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={`shining-section-heading ${centered ? 'is-centered' : ''}`}
    >
      <p>{eyebrow}</p>
      <Heading>{title}</Heading>
      {description && <span>{description}</span>}
    </motion.div>
  );
}

function CategoryBadge({ category }) {
  return <span className={`shining-category ${CATEGORY_CLASS[category]}`}>{category}</span>;
}

function TimelineCard({ achievement, side }) {
  const shouldReduceMotion = useSafeReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, x: side === 'left' ? -28 : 28, y: 10 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: false, margin: '-45px' }}
      whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.012 }}
      transition={{
        opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        x: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        y: { type: 'spring', stiffness: 210, damping: 24, mass: 0.7 },
        scale: { type: 'spring', stiffness: 210, damping: 24, mass: 0.7 },
      }}
      className="shining-timeline-card"
    >
      {achievement.image && (
        <div className="shining-timeline-image">
          <img src={(achievement.image)?.src || (achievement.image)} alt={achievement.title} loading="lazy" />
        </div>
      )}
      <div className="shining-timeline-content">
        <p className="shining-timeline-date">{achievement.date}</p>
        <h3>{achievement.title}</h3>
        <p>{achievement.description}</p>
      </div>
    </motion.article>
  );
}

function JourneyTimeline({ achievements }) {
  const [element, setElement] = useState(null);
  const scrollAnimationRef = useRef(null);
  const shouldReduceMotion = useSafeReducedMotion();
  const reversedAchievements = achievements
    .filter((achievement) => achievement.showInTimeline !== false)
    .reverse();
  const { scrollYProgress } = useScroll({
    target: element ? { current: element } : undefined,
    offset: ['start end', 'end start'],
  });
  const upwardProgress = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const smoothProgress = useSpring(upwardProgress, {
    stiffness: 95,
    damping: 24,
    mass: 0.35,
  });

  useEffect(() => () => {
    if (scrollAnimationRef.current) cancelAnimationFrame(scrollAnimationRef.current);
  }, []);

  const scrollToJourneyStart = () => {
    const targetElement = document.getElementById('journey-start');
    if (!targetElement) return;

    const targetRect = targetElement.getBoundingClientRect();
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = Math.min(
      maxScroll,
      Math.max(0, window.scrollY + targetRect.top - (window.innerHeight - targetRect.height) / 2),
    );

    if (shouldReduceMotion) {
      window.scrollTo(0, targetY);
      return;
    }

    if (scrollAnimationRef.current) cancelAnimationFrame(scrollAnimationRef.current);

    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = Math.min(1600, Math.max(900, Math.abs(distance) * 0.38));
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = progress < 0.5
        ? 8 * progress ** 4
        : 1 - ((-2 * progress + 2) ** 4) / 2;

      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        scrollAnimationRef.current = requestAnimationFrame(animateScroll);
      } else {
        scrollAnimationRef.current = null;
      }
    };

    scrollAnimationRef.current = requestAnimationFrame(animateScroll);
  };

  return (
    <section ref={setElement} id="journey-timeline" className="shining-timeline-section shining-scroll-target">
      <SectionHeading
        eyebrow="The Journey"
        title="Jejak Cahaya Intan"
        description="Timeline dibaca dari bawah ke atas. Mulai dari titik awal, lalu ikuti perjalanan Intan menuju pencapaian terbarunya."
        centered
      />
      <motion.button
        type="button"
        onClick={scrollToJourneyStart}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.025 }}
        whileTap={shouldReduceMotion ? undefined : { y: 0, scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.55 }}
        className="shining-timeline-start-button"
      >
        <span>Mulai dari Perjalanan Awal</span>
        <motion.span
          aria-hidden="true"
          animate={shouldReduceMotion ? undefined : { y: [0, 2.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="shining-timeline-start-icon"
        >
          <ArrowDown />
        </motion.span>
      </motion.button>
      <div className="shining-timeline">
        <motion.div className="shining-timeline-progress" style={{ scaleY: smoothProgress }} />
        {reversedAchievements.map((achievement, index) => {
          const cardSide = index % 2 === 0 ? 'left' : 'right';
          return (
          <div className="shining-timeline-row" key={achievement.id}>
            <div className="shining-timeline-side">
              {index % 2 === 0 ? (
                <TimelineCard achievement={achievement} side={cardSide} />
              ) : null}
            </div>
            <div className="shining-node-wrap">
              <motion.span
                initial={{ opacity: 0, scale: 0.35 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, margin: '-35px' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`shining-node ${CATEGORY_CLASS[achievement.category]} ${achievement.isMajor ? 'is-major' : ''}`}
              >
                {achievement.isMajor && <Star />}
              </motion.span>
            </div>
            <div className="shining-timeline-side">
              {index % 2 !== 0 ? (
                <TimelineCard achievement={achievement} side={cardSide} />
              ) : null}
            </div>
          </div>
          );
        })}
        <motion.div
          id="journey-start"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="shining-journey-start"
        >
          <div>
            <p>Perjalanan dimulai dari sini</p>
            <strong>Scroll ke atas untuk mengikuti perjalanan Intan</strong>
          </div>
          <ArrowUp />
        </motion.div>
      </div>
    </section>
  );
}

function AchievementCollection({ achievements }) {
  const achievementItems = achievements.filter((achievement) => achievement.showInAchievement !== false);

  return (
    <section className="shining-achievements">
      <SectionHeading
        headingLevel="h1"
        eyebrow="Achievement Intan"
        title="Pencapaian Selama di JKT48"
        description="Kumpulan milestone dan pencapaian yang Intan raih sejak resmi menjadi bagian dari JKT48."
      />
      <div className="shining-achievement-grid">
        {[...achievementItems].reverse().map((item) => (
          <motion.article
            key={item.id}
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {item.image && (
              <div className="shining-achievement-image">
                <img src={(item.image)?.src || (item.image)} alt={item.title} loading="lazy" />
              </div>
            )}
            <div className="shining-achievement-content">
              <div className="shining-label-row">
                <CategoryBadge category={item.category} />
                {item.isMajor && <span className="shining-major"><Star /> Milestone</span>}
              </div>
              <p className="shining-achievement-date">{item.date}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default function IntanShiningStarPage() {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const reduceMotion = useSafeReducedMotion();

  useEffect(() => {
    document.title = 'Intan Shining Star | JKT48 Official Achievement & Journey';
    let mounted = true;
    achievementService.getAchievements().then((data) => {
      if (mounted) {
        setAchievements(data);
        setIsLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  if (isLoading) return <Loading message="Membuka arsip cahaya Intan..." />;

  return (
    <div className={`shining-page ${reduceMotion ? 'reduce-motion' : ''}`}>
      <AchievementCollection achievements={achievements} />
      <JourneyTimeline achievements={achievements} />
    </div>
  );
}
