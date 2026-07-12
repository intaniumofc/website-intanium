import React from 'react';
import MainLayout from '../../../../../components/layout/MainLayout';
import ScoreResultPage from '../../../../../features/games/menangkap-kecoa/ScoreResultPage';
import { getGameScore } from '../../../../../services/public/gameService';

export async function generateMetadata({ params }) {
  const { scoreId } = await params;
  try {
    const score = await getGameScore(scoreId);
    if (!score) {
      return {
        title: 'Hasil Permainan Tidak Ditemukan | Intanium Official Website',
      };
    }
    return {
      title: `${score.username} Berhasil Menangkap Kecoa! | Skor: ${score.score.toLocaleString('id-ID')}`,
      description: `Bantu Nur Intan menangkap kecoa! ${score.username} mencetak skor ${score.score.toLocaleString('id-ID')} dengan ${score.caught_count} kecoa tertangkap dan combo ${score.max_combo}x. Bisakah kamu mengalahkannya?`,
    };
  } catch (err) {
    return {
      title: 'Hasil Permainan | Intanium Official Website',
    };
  }
}

export default function Page() {
  return (
    <MainLayout>
      <ScoreResultPage />
    </MainLayout>
  );
}
