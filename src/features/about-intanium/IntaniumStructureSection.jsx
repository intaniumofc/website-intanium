import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Crown, Palette, Shield, Users } from 'lucide-react';

const STRUCTURE = {
  leader: {
    name: 'Nur Intan',
    role: 'Ketua Umum',
    badge: 'Leader',
    description: 'Pusat arahan dan representasi utama Intanium.'
  },
  branches: [
    {
      id: 'external',
      coordinator: 'Casimira',
      role: 'Koor. Eksternal',
      description: 'Mengelola hubungan eksternal, humas, dan aktivitas luar komunitas.',
      divisions: [
        {
          name: 'Humas',
          members: ['Ivan', 'Riul']
        },
        {
          name: 'Esport',
          members: ['Afif', 'Wilfan']
        }
      ]
    },
    {
      id: 'creative',
      coordinator: 'Cipani',
      role: 'Koor. Media Kreatif',
      description: 'Mengelola visual, konten kreatif, sosial media, editor, dan desain.',
      divisions: [
        {
          name: 'Sosial Media',
          members: ['Adel', 'Kiky', 'Rafli', 'Tassya']
        },
        {
          name: 'Editor',
          members: ['Deven', 'Kay', 'Miksi']
        },
        {
          name: 'Design',
          members: ['Aqza', 'Jiw', 'Risas', 'Robby', 'Steven']
        }
      ]
    },
    {
      id: 'internal',
      coordinator: 'Bogel',
      role: 'Koor. Internal',
      description: 'Mengelola kebutuhan internal, data archive, keuangan, dan keanggotaan.',
      divisions: [
        {
          name: 'Data Archive',
          members: ['Arika', 'Azmi', 'Febs', 'Iqbal', 'Zill']
        },
        {
          name: 'Keuangan',
          members: ['Alifian', 'Diaz']
        },
        {
          name: 'Keanggotaan',
          members: ['Arsya', 'Azri', 'Manisha', 'Michelle', 'Ripli', 'Tirto']
        }
      ]
    }
  ]
};

const BRANCH_VISUALS = {
  external: {
    icon: Users,
    eyebrow: 'External Relations',
    accent: 'text-(--color-secondary)',
    iconBox: 'bg-(--color-primary-light) text-(--color-primary) border-(--border-color)'
  },
  creative: {
    icon: Palette,
    eyebrow: 'Creative Media',
    accent: 'text-(--color-primary)',
    iconBox: 'bg-(--color-secondary)/10 text-(--color-secondary) border-(--border-color)'
  },
  internal: {
    icon: Shield,
    eyebrow: 'Internal Operations',
    accent: 'text-(--color-primary)',
    iconBox: 'bg-(--color-primary-light) text-(--color-primary) border-(--border-color)'
  }
};

const PREMIUM_EASE = [0.22, 1, 0.36, 1];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.05
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: PREMIUM_EASE
    }
  }
};

const sectionReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: PREMIUM_EASE
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.75,
      ease: PREMIUM_EASE
    }
  }
};

const connectorReveal = {
  hidden: { opacity: 0, scaleY: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleY: 1,
    scaleX: 1,
    transition: {
      duration: 0.7,
      ease: PREMIUM_EASE,
      delay: 0.15
    }
  }
};

const dropdownVariants = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: 'auto',
    transition: {
      height: {
        type: 'spring',
        stiffness: 260,
        damping: 26
      },
      opacity: { duration: 0.25 }
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.22, ease: 'easeInOut' },
      opacity: { duration: 0.15 }
    }
  }
};

const detailContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1
    }
  }
};

const divisionItemVariants = {
  initial: { opacity: 0, y: 12, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.96,
    transition: { duration: 0.15 }
  }
};

function LeaderCard() {
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="relative mx-auto max-w-2xl overflow-hidden rounded-4xl border border-(--border-color) bg-white/75 p-5 shadow-xl shadow-(--color-primary)/10 backdrop-blur-xl sm:p-6"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-(--color-secondary) to-transparent" />
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-(--border-color) bg-(--color-primary-light) text-(--color-primary) shadow-md">
          <Crown className="h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <span className="inline-flex rounded-full border border-(--border-color) bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-widest text-(--color-primary)">
            {STRUCTURE.leader.badge}
          </span>
          <div>
            <h3 className="text-2xl font-black leading-tight text-(--color-primary)">{STRUCTURE.leader.name}</h3>
            <p className="text-xs font-extrabold uppercase tracking-widest text-(--color-secondary)">{STRUCTURE.leader.role}</p>
          </div>
          <p className="text-sm leading-relaxed text-(--text-secondary)">{STRUCTURE.leader.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function BranchDetails({ branch }) {
  return (
    <motion.div
      id={`branch-details-${branch.id}`}
      variants={dropdownVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="overflow-hidden"
    >
      <motion.div
        variants={detailContainerVariants}
        className="mt-4 space-y-3 border-t border-(--border-color) pt-4"
      >
        {branch.divisions.map((division) => (
          <motion.div
            key={division.name}
            variants={divisionItemVariants}
            className="rounded-2xl border border-(--border-color) bg-white/70 p-3.5"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-(--color-primary)">{division.name}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {division.members.map((member) => (
                <span
                  key={member}
                  className="rounded-full border border-(--border-color) bg-white px-2.5 py-1 text-xs font-semibold text-(--text-secondary)"
                >
                  {member}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function BranchCard({ branch, isActive, onToggle }) {
  const visual = BRANCH_VISUALS[branch.id];
  const BranchIcon = visual.icon;

  return (
    <motion.article
      layout
      variants={fadeUp}
      whileHover={{ y: -6, scale: 1.01 }}
      className={`relative rounded-4xl border bg-white/70 p-5 shadow-lg backdrop-blur-xl transition-[border-color,box-shadow,background-color] duration-300 ${isActive
        ? 'border-(--color-primary) shadow-(--color-primary)/20'
        : 'border-(--border-color) shadow-(--color-primary)/5'
        }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isActive}
        aria-controls={`branch-details-${branch.id}`}
        className="w-full text-left outline-none"
      >
        <motion.div layout="position" whileTap={{ scale: 0.985 }} className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${visual.iconBox}`}>
                <BranchIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-black uppercase tracking-widest ${visual.accent}`}>{visual.eyebrow}</p>
                <h3 className="mt-1 truncate text-xl font-black leading-tight text-(--color-primary)">
                  {branch.coordinator}
                </h3>
              </div>
            </div>
            <motion.span
              animate={{ rotate: isActive ? 180 : 0 }}
              transition={{ duration: 0.28, ease: PREMIUM_EASE }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--border-color) bg-white/80 text-(--text-muted)"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </div>

          <p className="text-sm leading-relaxed text-(--text-secondary)">{branch.description}</p>
        </motion.div>
      </button>

      <AnimatePresence>
        {isActive && <BranchDetails key={branch.id} branch={branch} />}
      </AnimatePresence>
    </motion.article>
  );
}

function Connector() {
  return (
    <motion.div variants={connectorReveal} className="relative mx-auto hidden h-16 max-w-4xl origin-top lg:block">
      <div className="absolute left-1/2 top-0 h-full w-px bg-linear-to-b from-(--color-secondary)/70 to-(--color-primary)/20" />
      <div className="absolute bottom-0 left-[16.6%] right-[16.6%] h-px bg-linear-to-r from-(--color-primary)/10 via-(--color-primary)/45 to-(--color-primary)/10" />
      <div className="absolute bottom-0 left-[16.6%] h-5 w-px bg-(--color-primary)/25" />
      <div className="absolute bottom-0 left-1/2 h-5 w-px bg-(--color-primary)/25" />
      <div className="absolute bottom-0 right-[16.6%] h-5 w-px bg-(--color-primary)/25" />
    </motion.div>
  );
}

export default function IntaniumStructureSection() {
  const [activeBranch, setActiveBranch] = useState(null);

  const handleToggle = (branchId) => {
    setActiveBranch((current) => (current === branchId ? null : branchId));
  };

  return (
    <motion.section
      id="struktur-kepengurusan"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18, margin: '-80px' }}
      variants={sectionReveal}
      className="relative overflow-hidden rounded-4xl border border-(--border-color) bg-linear-to-br from-white/80 via-(--color-primary-light)/35 to-white/65 px-4 py-10 shadow-2xl shadow-(--color-primary)/10 sm:px-8 lg:px-10"
    >
      <div className="absolute inset-0 bg-radial-[circle_at_top,white_1px,transparent_1.5px] bg-size-[28px_28px] opacity-40 pointer-events-none" />
      <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-(--color-primary)/10 blur-[5rem] pointer-events-none" />
      <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-(--color-secondary)/10 blur-[5rem] pointer-events-none" />

      <motion.div variants={staggerContainer} className="relative z-10 space-y-8 lg:space-y-10">
        <motion.div variants={fadeUp} className="mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="text-3xl font-black tracking-tight text-(--color-primary) sm:text-5xl">
            Struktur Kepengurusan Intanium
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-(--text-secondary) sm:text-base">
            Di balik setiap aktivitas Intanium, ada tim inti yang menjaga, merawat, dan
            memastikan setiap kegiatan berjalan rapi, responsif, serta tetap nyaman.
          </p>
        </motion.div>

        <LeaderCard />
        <Connector />

        <motion.div variants={staggerContainer} className="grid gap-5 lg:grid-cols-3">
          {STRUCTURE.branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              isActive={activeBranch === branch.id}
              onToggle={() => handleToggle(branch.id)}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
