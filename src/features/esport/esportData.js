// Static data for Intanium Esport Divisions
export const ESPORT_DATA = {
  mobile_legends: {
    id: 'mobile_legends',
    name: 'Mobile Legends',
    tagline: 'Menguasai Land of Dawn dengan Strategi dan Harmoni.',
    logo: '🎮',
    bannerGradient: 'from-blue-600/20 to-purple-600/20',
    roster: [
      {
        name: 'Siska Amelia',
        ign: 'Siska',
        role: 'Team Manager',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Siska',
        socials: { instagram: 'https://instagram.com', twitter: 'https://x.com' }
      },
      {
        name: 'Rian Hidayat',
        ign: 'Xavi',
        role: 'Head Coach',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Xavi',
        socials: { instagram: 'https://instagram.com' }
      },
      {
        name: 'Reza Pratama',
        ign: 'Kyra',
        role: 'Captain / Mid Laner',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kyra',
        socials: { instagram: 'https://instagram.com', twitter: 'https://x.com' }
      },
      {
        name: 'Budi Santoso',
        ign: 'Zenith',
        role: 'Gold Laner',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zenith',
        socials: { instagram: 'https://instagram.com' }
      },
      {
        name: 'Adi Wijaya',
        ign: 'Rogue',
        role: 'Roamer',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rogue',
        socials: { twitter: 'https://x.com' }
      },
      {
        name: 'Fikri Haikal',
        ign: 'Vortex',
        role: 'EXP Laner',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vortex',
        socials: {}
      },
      {
        name: 'Doni Setiawan',
        ign: 'Shadow',
        role: 'Jungler',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow',
        socials: { instagram: 'https://instagram.com' }
      }
    ],
    matches: [
      {
        id: 'ml-m1',
        opponent: 'EVOS Hope',
        opponentLogo: '🦁',
        date: '10 Juni 2026',
        time: '19:00 WIB',
        stage: 'Grand Finals - Intanium Cup',
        status: 'Past',
        score: '2 - 1',
        result: 'win',
        streamUrl: 'https://youtube.com'
      },
      {
        id: 'ml-m2',
        opponent: 'RRQ Sena',
        opponentLogo: '👑',
        date: '20 Juni 2026',
        time: '15:30 WIB',
        stage: 'Regular Season - MDL ID S13',
        status: 'Upcoming',
        streamUrl: 'https://youtube.com'
      },
      {
        id: 'ml-m3',
        opponent: 'Alter Ego X',
        opponentLogo: '🎭',
        date: '24 Juni 2026',
        time: '17:00 WIB',
        stage: 'Regular Season - MDL ID S13',
        status: 'Upcoming',
        streamUrl: 'https://youtube.com'
      }
    ],
    achievements: [
      {
        id: 'ml-a1',
        title: 'Champion - Intanium Cup 2026',
        rank: '1st Place',
        date: 'Juni 2026',
        badge: '🏆'
      },
      {
        id: 'ml-a2',
        title: 'Runner Up - Community League Championship',
        rank: '2nd Place',
        date: 'Desember 2025',
        badge: '🥈'
      }
    ]
  },
  efootball: {
    id: 'efootball',
    name: 'eFootball',
    tagline: 'Mengukir Kemenangan Virtual Lewat Sentuhan Akurat.',
    logo: '⚽',
    bannerGradient: 'from-emerald-600/20 to-teal-600/20',
    roster: [
      {
        name: 'Andi Wijaya',
        ign: 'Andi',
        role: 'Team Manager',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AndiManager',
        socials: { instagram: 'https://instagram.com' }
      },
      {
        name: 'Elga Cahya Putra',
        ign: 'Elga',
        role: 'Main Player',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Elga',
        socials: { instagram: 'https://instagram.com', twitter: 'https://x.com' }
      },
      {
        name: 'Akbar Paudie',
        ign: 'Paudie',
        role: 'Substitute Player',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Paudie',
        socials: { instagram: 'https://instagram.com' }
      }
    ],
    matches: [
      {
        id: 'ef-m1',
        opponent: 'Persija Esport',
        opponentLogo: '🐯',
        date: '05 Juni 2026',
        time: '16:00 WIB',
        stage: 'Pekan 4 - eLeague Indonesia',
        status: 'Past',
        score: '3 - 1',
        result: 'win',
        streamUrl: 'https://youtube.com'
      },
      {
        id: 'ef-m2',
        opponent: 'Bali United',
        opponentLogo: '🔴',
        date: '22 Juni 2026',
        time: '18:00 WIB',
        stage: 'Pekan 5 - eLeague Indonesia',
        status: 'Upcoming',
        streamUrl: 'https://youtube.com'
      }
    ],
    achievements: [
      {
        id: 'ef-a1',
        title: 'Champion - eFootball Community League 2026',
        rank: '1st Place',
        date: 'Mei 2026',
        badge: '🏆'
      }
    ]
  },
  pubg_mobile: {
    id: 'pubg_mobile',
    name: 'PUBG Mobile',
    tagline: 'Bertahan, Berkoordinasi, dan Menjadi yang Terakhir Berdiri.',
    logo: '🔫',
    bannerGradient: 'from-amber-600/20 to-orange-600/20',
    roster: [
      {
        name: 'Rina Kartika',
        ign: 'Rina',
        role: 'Team Manager',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rina',
        socials: { instagram: 'https://instagram.com' }
      },
      {
        name: 'Taufik Hidayat',
        ign: 'CoachT',
        role: 'Head Coach',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CoachT',
        socials: { twitter: 'https://x.com' }
      },
      {
        name: 'Genta Efendi',
        ign: 'Genta',
        role: 'In-Game Leader / Rusher',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Genta',
        socials: { instagram: 'https://instagram.com', twitter: 'https://x.com' }
      },
      {
        name: 'Bagus Prabaswara',
        ign: 'Bagus',
        role: 'Main Sniper',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bagus',
        socials: { instagram: 'https://instagram.com' }
      },
      {
        name: 'Made Bagas',
        ign: 'Zuxxy-Junior',
        role: 'Scout / Support',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MadeBagas',
        socials: {}
      },
      {
        name: 'Alvin Pratama',
        ign: 'Alvin',
        role: 'Support / Healer',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alvin',
        socials: { twitter: 'https://x.com' }
      }
    ],
    matches: [
      {
        id: 'pm-m1',
        opponent: 'Bigetron Beta',
        opponentLogo: '🤖',
        date: '08 Juni 2026',
        time: '14:00 WIB',
        stage: 'Finals Day 3 - PMCS S5',
        status: 'Past',
        score: 'Rank 5',
        result: 'lose',
        streamUrl: 'https://youtube.com'
      },
      {
        id: 'pm-m2',
        opponent: 'PMPL Community League',
        opponentLogo: '⭐',
        date: '25 Juni 2026',
        time: '13:00 WIB',
        stage: 'Grand Finals - Day 1',
        status: 'Upcoming',
        streamUrl: 'https://youtube.com'
      }
    ],
    achievements: [
      {
        id: 'pm-a1',
        title: '3rd Place - PMPL Community Season 5',
        rank: '3rd Place',
        date: 'April 2026',
        badge: '🥉'
      }
    ]
  },
  free_fire: {
    id: 'free_fire',
    name: 'Free Fire',
    tagline: 'Kecepatan, Ketepatan, dan Booyah Tiada Henti.',
    logo: '🔥',
    bannerGradient: 'from-red-600/20 to-orange-600/20',
    roster: [
      {
        name: 'Hendra Wijaya',
        ign: 'Hendra',
        role: 'Team Manager',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Hendra',
        socials: { instagram: 'https://instagram.com' }
      },
      {
        name: 'Muhammad Fatah',
        ign: 'Fatah',
        role: 'Captain / Rusher',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Fatah',
        socials: { instagram: 'https://instagram.com', twitter: 'https://x.com' }
      },
      {
        name: 'Rian Hermawan',
        ign: 'Rian',
        role: 'Main Grenadier',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=RianFF',
        socials: { instagram: 'https://instagram.com' }
      },
      {
        name: 'Syahrul Ramadhan',
        ign: 'Syahrul',
        role: 'Support',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Syahrul',
        socials: {}
      },
      {
        name: 'Farhan Alamsyah',
        ign: 'Farhan',
        role: 'Flanker',
        imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Farhan',
        socials: { twitter: 'https://x.com' }
      }
    ],
    matches: [
      {
        id: 'ff-m1',
        opponent: 'SES Alfaink',
        opponentLogo: '🐺',
        date: '12 Juni 2026',
        time: '20:30 WIB',
        stage: 'Finals Match 6 - FFML Nusantara',
        status: 'Past',
        score: 'Booyah! (12 Kills)',
        result: 'win',
        streamUrl: 'https://youtube.com'
      },
      {
        id: 'ff-m2',
        opponent: 'Free Fire Master League',
        opponentLogo: '🔥',
        date: '28 Juni 2026',
        time: '19:00 WIB',
        stage: 'Group Stage Round 1',
        status: 'Upcoming',
        streamUrl: 'https://youtube.com'
      }
    ],
    achievements: [
      {
        id: 'ff-a1',
        title: 'Champion - FFML Nusantara Series 2026',
        rank: '1st Place',
        date: 'Mei 2026',
        badge: '🏆'
      }
    ]
  }
};
