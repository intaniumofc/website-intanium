"use client";
import { useRef } from "react";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { ArrowRight } from "lucide-react";
import bannerNium from "@/assets/logos/banner-nium.webp";
import { SOCIALS } from "@/lib/constants";
import { FaYoutube } from "react-icons/fa";
import { FaXTwitter, FaInstagram, FaTiktok, FaEnvelope } from "react-icons/fa6";

export default function AboutSection3() {
  const heroRef = useRef(null);

  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const scaleVariants = {
    visible: (i) => ({
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      opacity: 0,
    },
  };

  return (
    <section className="pt-0 pb-8 px-4 bg-transparent" ref={heroRef}>
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          {/* Header with social icons */}
          <div className="flex justify-between items-center mb-8 w-[85%] absolute lg:top-2 md:-top-2 sm:-top-3 -top-5 z-10">
            <div className="flex items-center gap-2 text-xl">
              <TimelineContent
                as="span"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-md sm:text-md font-bold text-(--color-primary)"
              >
                About Intanium
              </TimelineContent>
            </div>
            <div className="flex gap-3">
              <TimelineContent
                as="a"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href={SOCIALS.TWITTER}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kunjungi Twitter Intanium"
                title="Twitter"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-transparent border border-(--border-color) rounded-full flex items-center justify-center cursor-pointer hover:bg-(--color-primary) hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 transition-all duration-300 group"
              >
                <FaXTwitter className="w-4 h-4 sm:w-5 sm:h-5 text-(--color-primary) group-hover:text-white transition-colors duration-300" />
              </TimelineContent>
              <TimelineContent
                as="a"
                animationNum={1}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href={SOCIALS.INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kunjungi Instagram Intanium"
                title="Instagram"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-transparent border border-(--border-color) rounded-full flex items-center justify-center cursor-pointer hover:bg-(--color-primary) hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 transition-all duration-300 group"
              >
                <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5 text-(--color-primary) group-hover:text-white transition-colors duration-300" />
              </TimelineContent>
              <TimelineContent
                as="a"
                animationNum={2}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href={SOCIALS.TIKTOK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kunjungi TikTok Intanium"
                title="TikTok"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-transparent border border-(--border-color) rounded-full flex items-center justify-center cursor-pointer hover:bg-(--color-primary) hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 transition-all duration-300 group"
              >
                <FaTiktok className="w-4 h-4 sm:w-5 sm:h-5 text-(--color-primary) group-hover:text-white transition-colors duration-300" />
              </TimelineContent>
              <TimelineContent
                as="a"
                animationNum={3}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href={SOCIALS.YOUTUBE}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kunjungi YouTube Intanium"
                title="YouTube"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-transparent border border-(--border-color) rounded-full flex items-center justify-center cursor-pointer hover:bg-(--color-primary) hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 transition-all duration-300 group"
              >
                <FaYoutube className="w-4 h-4 sm:w-5 sm:h-5 text-(--color-primary) group-hover:text-white transition-colors duration-300" />
              </TimelineContent>
              <TimelineContent
                as="a"
                animationNum={4}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href={SOCIALS.EMAIL}
                aria-label="Kirim Email ke Intanium"
                title="Email"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-transparent border border-(--border-color) rounded-full flex items-center justify-center cursor-pointer hover:bg-(--color-primary) hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 transition-all duration-300 group"
              >
                <FaEnvelope className="w-4 h-4 sm:w-5 sm:h-5 text-(--color-primary) group-hover:text-white transition-colors duration-300" />
              </TimelineContent>
            </div>
          </div>

          <TimelineContent
            as="figure"
            animationNum={5}
            timelineRef={heroRef}
            customVariants={scaleVariants}
            className="relative group overflow-hidden rounded-3xl"
          >
            <svg
              className="w-full"
              width={"100%"}
              height={"100%"}
              viewBox="0 0 100 40"
            >
              <defs>
                <clipPath
                  id="clip-inverted"
                  clipPathUnits={"objectBoundingBox"}
                >
                  <path
                    d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z"
                    fill="#D9D9D9"
                  />
                </clipPath>
              </defs>
              <image
                clipPath="url(#clip-inverted)"
                preserveAspectRatio="xMidYMid slice"
                width={"100%"}
                height={"100%"}
                href={bannerNium}
              ></image>
            </svg>
          </TimelineContent>

          {/* Stats */}
          <div className="flex flex-wrap lg:justify-start justify-between items-center py-3 text-sm">
            <TimelineContent
              as="div"
              animationNum={5}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2 mb-2 sm:text-base text-xs">
                <span className="text-(--color-secondary) font-black">2+ Years</span>
                <span className="text-(--text-secondary) font-semibold">Active Support</span>
                <span className="text-gray-300">|</span>
              </div>
              <div className="flex items-center gap-2 mb-2 sm:text-base text-xs">
                <span className="text-(--color-secondary) font-black">200+</span>
                <span className="text-(--text-secondary) font-semibold">Active Members</span>
              </div>
            </TimelineContent>

            {/* Right Stats (Absolute on desktop inside the bottom-right cut-out, relative on mobile) */}
            <div className="lg:absolute right-6 bottom-23 flex lg:flex-col flex-row gap-4 lg:gap-0.5 items-center lg:items-end text-right">
              <TimelineContent
                as="div"
                animationNum={6}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="flex items-center lg:flex-row flex-row-reverse gap-1.5"
              >
                <span className="text-(--color-secondary) font-black text-lg lg:text-2xl">5+</span>
                <span className="text-(--color-primary) font-black text-[10px] lg:text-sm uppercase tracking-wider">Support Projects</span>
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={7}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="flex items-center lg:flex-row flex-row-reverse gap-1.5"
              >
                <span className="text-(--color-secondary) font-black text-xs lg:text-sm">100%</span>
                <span className="text-(--text-secondary) font-semibold text-[9px] lg:text-sm">Community Powered</span>
              </TimelineContent>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8 mt-6">
          <div className="md:col-span-2">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-(--color-primary) leading-tight tracking-tight mb-6 text-left">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.04}
                staggerFrom="first"
                reverse={true}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 30,
                  delay: 0.4,
                }}
              >
                Menyatukan Hati untuk Kilau Abadi Nur Intan.
              </VerticalCutReveal>
            </h1>

            <TimelineContent
              as="div"
              animationNum={9}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="grid md:grid-cols-2 gap-8 text-(--text-secondary) text-left font-medium leading-relaxed"
            >
              <TimelineContent
                as="div"
                animationNum={10}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-xs sm:text-sm"
              >
                <p className="text-justify leading-relaxed">
                  Perjalanan kami dimulai dari kekaguman terhadap talenta luar biasa dan kepribadian hangat Nur Intan di JKT48. Sebagai fanbase resmi, kami terus berkembang menjadi wadah suportif yang menyatukan ribuan hati untuk memberikan dukungan terbaik di setiap langkah karirnya.
                </p>
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={11}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-xs sm:text-sm"
              >
                <p className="text-justify leading-relaxed">
                  Melalui berbagai proyek kreatif, event kebersamaan, dan interaksi media sosial yang positif, Intanium berkomitmen penuh menjadi pilar pendukung yang kokoh bagi Intan dalam menggapai mimpi-mimpinya di panggung JKT48.
                </p>
              </TimelineContent>
            </TimelineContent>
          </div>

          <div className="md:col-span-1">
            <div className="text-right flex flex-col items-end">
              <TimelineContent
                as="div"
                animationNum={12}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-(--color-primary) text-2xl font-black mb-1 tracking-wider"
              >
                INTANIUM
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={13}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-(--color-secondary) text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-6"
              >
                Official Fanbase of Nur Intan JKT48
              </TimelineContent>

              <TimelineContent
                as="div"
                animationNum={14}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="mb-6 max-w-[280px]"
              >
                <p className="text-(--text-secondary) font-semibold text-xs sm:text-sm text-right leading-relaxed">
                  Siap untuk berpartisipasi dan berkontribusi bersama kami dalam mengiringi perjalanan karir Intan?
                </p>
              </TimelineContent>

              <TimelineContent
                as="a"
                animationNum={15}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href={SOCIALS.DISCORD}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex bg-(--color-primary) hover:bg-(--color-primary-hover) shadow-md hover:shadow-[var(--neon-glow-primary)] flex-row w-fit items-center gap-2 hover:gap-4 transition-all duration-300 ease-in-out text-white px-5 py-3 rounded-2xl cursor-pointer text-xs font-semibold tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
              >
                Join Komunitas <ArrowRight className="w-4 h-4" />
              </TimelineContent>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
