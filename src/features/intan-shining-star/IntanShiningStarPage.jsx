import React, { useState, useEffect } from 'react';
import { achievementService } from './achievementService';
import PageHeader from '../../components/layout/PageHeader';
import Timeline from '../../components/timeline/Timeline';
import Loading from '../../components/common/Loading';

export default function IntanShiningStarPage() {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    achievementService.getAchievements()
      .then((data) => {
        setAchievements(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Bintang Berkilau (Shining Star)"
        subtitle="Arsip kilas balik milestones, pencapaian karir, prestasi mengagumkan, dan momen keemasan Intan bersama dengan kontribusi aktif para fans."
      />

      {isLoading ? (
        <Loading message="Mengambil data prestasi..." />
      ) : (
        <Timeline achievements={achievements} />
      )}
    </div>
  );
}
