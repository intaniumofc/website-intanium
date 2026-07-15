'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSafeReducedMotion } from '../../hooks/useSafeReducedMotion';
import { Star } from 'lucide-react';
import Loading from '../../components/common/Loading';
import { achievementService } from '../../services/public/achievementService';
import JourneyMap from '../../components/timeline/journey/JourneyMap';
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

      {/* Responsive cinematic journey map (desktop → mobile, incl. reduced-motion) */}
      <JourneyMap achievements={achievements} />
    </div>
  );
}
