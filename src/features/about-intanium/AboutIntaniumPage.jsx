import React, { useState, useEffect } from 'react';
import { aboutIntaniumService } from './aboutIntaniumService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { SOCIALS } from '../../lib/constants';
import { Sparkles, ShieldCheck, Rocket, MessageSquare } from 'lucide-react';

export default function AboutIntaniumPage() {
  const [lore, setLore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    aboutIntaniumService.getLore()
      .then((data) => {
        setLore(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <Loading message="Mengambil data lore Intanium..." />;

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <PageHeader
        title="Komunitas Intanium"
        subtitle="Selamat datang di rumah resmi bagi para penggemar setia Intan. Bersama membangun ikatan pertemanan yang positif dan berkilau!"
      />

      {/* Lore Banner */}
      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--color-primary-light)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-secondary)] opacity-5 rounded-full blur-[80px] -z-10" />
        
        <h3 className="text-xl font-bold mb-4 text-[#170C79] flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--color-primary)]" /> Asal-Usul & Filosofi Intanium
        </h3>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          {lore.originStory}
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Community Rules */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-[#170C79] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[var(--color-primary)]" /> Pedoman & Aturan Komunitas
          </h3>
          <div className="space-y-4">
            {lore.rules.map((rule, idx) => (
              <Card key={idx} padding="compact" className="border border-[var(--border-color)]">
                <h4 className="text-sm font-bold text-[#170C79] mb-1">
                  {idx + 1}. {rule.title}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {rule.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Steps to Join */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-[#170C79] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-[var(--color-primary)]" /> Cara Bergabung Bersama Kami
          </h3>
          <div className="space-y-4">
            {lore.joinSteps.map((step) => (
              <div key={step.step} className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex-shrink-0 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                  {step.step}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#170C79]">{step.action}</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <Card hoverEffect={false} padding="normal" className="border border-[var(--border-color)] text-center mt-6 bg-[var(--bg-secondary)]/50">
            <h4 className="text-sm font-bold text-[#170C79] mb-2">Ready to hang out with us?</h4>
            <p className="text-xs text-[var(--text-secondary)] mb-4 max-w-xs mx-auto">Masuk server Discord resmi dan berkenalan dengan lebih dari 8,000+ member lainnya!</p>
            <a href={SOCIALS.DISCORD} target="_blank" rel="noreferrer">
              <Button variant="glow" size="sm" className="inline-flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Gabung Discord Server
              </Button>
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
