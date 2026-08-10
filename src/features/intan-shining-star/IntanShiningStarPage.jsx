'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSafeReducedMotion } from '../../hooks/useSafeReducedMotion';
import Loading from '../../components/common/Loading';
import ComicFlipbook from '../../components/common/ComicFlipbook';
import { achievementService } from '../../services/public/achievementService';
import JourneyMap from '../../components/timeline/journey/JourneyMap';
import './IntanShiningStarPage.css';

gsap.registerPlugin(ScrollTrigger);

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function IntanShiningStarPage() {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const reduceMotion = useSafeReducedMotion();

  useEffect(() => {
    document.title = 'Intan Journey | JKT48 Official Achievement & Journey';
    let mounted = true;
    achievementService.getAchievements().then((data) => {
      if (mounted) {
        setAchievements(data);
        setIsLoading(false);
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 150);
      }
    });
    return () => { mounted = false; };
  }, []);

  if (isLoading) return <Loading message="Membuka arsip cahaya Intan..." />;

  return (
    <div className={`shining-page ${reduceMotion ? 'reduce-motion' : ''}`}>
      {false && (
        <>
          {/* Comic section */}
          <section className="shining-comic-section">
            <motion.div
              className="shining-comic-header"
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h1 className="shining-comic-title">Arsip Cahaya Intan</h1>
              <p className="shining-comic-desc">
                Buka komik perjalanan karir Intan di JKT48.
              </p>
            </motion.div>
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <ComicFlipbook />
            </motion.div>
          </section>

          {/* Decorative Transition Border Element between Comic and Journey */}
          <div className="shining-divider-wrap" aria-hidden="true">
            <div className="shining-divider-line" />
            <div className="shining-divider-badge">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>Jejak Perjalanan</span>
              <Star className="h-4 w-4 text-pink-500" />
            </div>
            <div className="shining-divider-line" />
          </div>
        </>
      )}

      {/* Journey Timeline — Jejak Cahaya Intan */}
      <div id="journey-start">
        <JourneyMap achievements={achievements} />
      </div>
    </div>
  );
}
