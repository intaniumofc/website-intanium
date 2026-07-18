'use client';

import { useEffect, useState } from 'react';
import { useSafeReducedMotion } from '../../hooks/useSafeReducedMotion';
import Loading from '../../components/common/Loading';
import { achievementService } from '../../services/public/achievementService';
import JourneyMap from '../../components/timeline/journey/JourneyMap';
import './IntanShiningStarPage.css';

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
      <JourneyMap achievements={achievements} />
    </div>
  );
}
