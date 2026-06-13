export const GAME_DURATION = 60;

export const COCKROACH_TYPES = [
  {
    id: 'normal',
    label: 'Kecoa biasa',
    basePoint: 10,
    lifetimeMs: 6500,
    spawnWeight: 70,
  },
  {
    id: 'fast',
    label: 'Kecoa cepat',
    basePoint: 20,
    lifetimeMs: 3800,
    spawnWeight: 25,
  },
  {
    id: 'golden',
    label: 'Kecoa emas',
    basePoint: 100,
    lifetimeMs: 4500,
    spawnWeight: 5,
  },
];

export const FLYING_COCKROACH = {
  id: 'flying',
  label: 'Kecoa terbang',
  basePoint: 50,
};

export function getComboMultiplier(combo) {
  if (combo >= 20) return 2;
  if (combo >= 10) return 1.5;
  if (combo >= 5) return 1.2;
  return 1;
}

export function getComboText(combo) {
  if (combo >= 30) return 'Tidak takut kecoa mode dewa!';
  if (combo >= 20) return 'Kecoa Hunter Legend!';
  if (combo >= 10) return 'Intan would be proud!';
  if (combo >= 5) return 'Berani juga kamu!';
  if (combo >= 3) return 'Nice!';
  return '';
}

export function getPerformanceTitle(score) {
  if (score >= 1500) return 'Intanium Brave!';
  if (score >= 1000) return 'Kecoa Hunter!';
  if (score >= 500) return 'Berani Juga!';
  return 'Pemanasan Dulu!';
}

export function getBadges({ score, caughtCount, maxCombo, caughtGolden }) {
  const badges = [
    score >= 1500
      ? 'Intanium Brave'
      : score >= 1000
        ? 'Kecoa Hunter'
        : score >= 500
          ? 'Mulai Berani'
          : 'Pemanasan',
  ];

  if (maxCombo >= 20) badges.push('Anti Panik');
  else if (maxCombo >= 10) badges.push('Combo Mantap');
  if (caughtCount >= 30) badges.push('Pemburu Kecoa');
  if (caughtGolden) badges.push('Kecoa Emas Dapat');
  return badges;
}
