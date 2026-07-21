'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSafeReducedMotion } from '../../hooks/useSafeReducedMotion';
import Loading from '../../components/common/Loading';
import ComicFlipbook from '../../components/common/ComicFlipbook';
import { achievementService } from '../../services/public/achievementService';
import JourneyMap from '../../components/timeline/journey/JourneyMap';
import './IntanShiningStarPage.css';

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

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
      {/* Comic section */}
      <section className="shining-comic-section">
        <motion.div
          className="shining-comic-header"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <span className="shining-comic-eyebrow">#IntanShiningStar</span>
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
      {/* Journey Timeline — Jejak Cahaya Intan */}
      <div id="journey-start">
        <JourneyMap achievements={achievements} />
      </div>
    </div>
  );
}
