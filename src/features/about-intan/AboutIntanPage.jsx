import React, { useState, useEffect } from 'react';
import { aboutIntanService } from './aboutIntanService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { Video, Camera, MessageSquare, Smartphone, Zap } from 'lucide-react';

export default function AboutIntanPage() {
  const [bio, setBio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    aboutIntanService.getBio()
      .then((data) => {
        setBio(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const statIcons = {
    '📺': Video,
    '📸': Camera,
    '💬': MessageSquare,
    '📱': Smartphone,
  };

  if (isLoading) return <Loading fullPage={false} message="Membaca biodata Intan..." />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Tentang Intan"
        subtitle="Mengenal lebih dekat sosok entertainer serba bisa di balik komunitas Intanium."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <Card hoverEffect={false} className="text-center border border-[var(--border-color)] overflow-hidden">
            {/* Glowing avatar frame */}
            <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-[var(--color-primary)] shadow-[var(--neon-glow-primary)] mb-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                alt="Intan avatar"
                className="w-full h-full object-cover"
              />
            </div>
            
            <h2 className="text-xl font-bold text-[#170C79]">
              {bio.fullName}
            </h2>
            <p className="text-sm text-[var(--color-secondary)] font-semibold mb-4">
              Virtual Creator & Singer
            </p>

            <div className="border-t border-[var(--border-color)] pt-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Panggilan:</span>
                <span className="font-semibold text-[var(--text-primary)]">{bio.nickname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Ulang Tahun / Debut:</span>
                <span className="font-semibold text-[var(--text-primary)]">15 Mei</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Zodiak:</span>
                <span className="font-semibold text-[var(--text-primary)]">{bio.zodiac}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Tinggi Badan:</span>
                <span className="font-semibold text-[var(--text-primary)]">{bio.height}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Bio & Stats */}
        <div className="md:col-span-2 space-y-8">
          <Card hoverEffect={false} className="border border-[var(--border-color)]">
            <h3 className="text-lg font-bold mb-4 text-[#170C79] border-b border-[var(--border-color)] pb-2">
              Profil Singkat
            </h3>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {bio.description}
            </p>
          </Card>

          {/* Social Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {bio.socialStats.map((stat) => {
              const IconComponent = statIcons[stat.icon] || Video;
              return (
                <Card key={stat.label} padding="compact" className="text-center border border-[var(--border-color)] glass-panel-hover flex flex-col items-center justify-center">
                  <IconComponent className="h-6 w-6 mb-2 text-[var(--color-primary)]" />
                  <h4 className="text-lg font-extrabold text-[#170C79]">{stat.value}</h4>
                  <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mt-1">{stat.label}</p>
                </Card>
              );
            })}
          </div>

          {/* Trivia list */}
          <Card hoverEffect={false} className="border border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
            <h3 className="text-lg font-bold mb-4 text-[#170C79]">
              Fakta Menarik & Trivia
            </h3>
            <ul className="space-y-3 text-sm">
              {bio.trivia.map((fact, idx) => (
                <li key={idx} className="flex gap-3 items-start leading-relaxed">
                  <Zap className="h-4 w-4 text-[var(--color-primary)] mt-0.5 shrink-0" />
                  <span className="text-[var(--text-secondary)]">{fact}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
