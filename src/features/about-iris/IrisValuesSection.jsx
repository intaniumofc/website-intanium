'use client';

import { FeatureGrid } from '@/components/ui/feature-grid';

const valuesData = [
  {
    title: "Inclusive",
    description: "Diharapkan IRIS dapat menjadi wadah yang terbuka untuk berkumpul dan merasa diterima bagi seluruh penggemar Intan, sehingga muncul rasa memiliki (sense of belonging) ke IRIS dari seluruh anggotanya.",
  },
  {
    title: "Resonance",
    description: "IRIS diharap dapat mengakomodir setiap gerakan kecil atau inisiatif yang diberikan untuk Intan. Karena satu langkah kecil yang dilakukan secara konsisten akan beresonansi menghasilkan dampak besar.",
  },
  {
    title: "Interaction",
    description: "IRIS diharap dapat menjembatani Intan kepada penggemar, memperkenalkan pesona unik Intan, serta membantu memperkuat branding-nya agar semakin dikenal dekat oleh fans maupun khalayak umum.",
  },
  {
    title: "Synergy",
    description: "IRIS diharapkan dapat menjadi wadah kolektif untuk menyatukan suara dukungan kepada Intan. Meskipun fans berasal dari latar belakang yang berbeda, IRIS menyatukannya dalam harmoni sinergi.",
  },
];

export default function IrisValuesSection() {
  return (
    <section className="relative py-12 overflow-visible">
      {/* Decorative background lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(23,12,121,0.03)_0%,rgba(8,145,178,0.01)_60%,transparent_80%)] rounded-full blur-[80px] pointer-events-none -z-10" />

      <div className="space-y-12 max-w-6xl mx-auto px-4">
        {/* Title Section */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--color-primary)] leading-tight">
            Nilai Utama IRIS (Values)
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed font-medium">
            Empat nilai utama yang melandasi setiap gerak, inisiatif, dan program kerja dalam menjalankan roda organisasi fanbase IRIS.
          </p>
        </div>

        {/* Feature Grid Component */}
        <FeatureGrid features={valuesData} />
      </div>
    </section>
  );
}
