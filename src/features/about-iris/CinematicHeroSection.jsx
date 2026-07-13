'use client';

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { SOCIALS } from "../../lib/constants";
import { FaYoutube } from "react-icons/fa";
import { FaXTwitter, FaInstagram, FaTiktok, FaEnvelope } from "react-icons/fa6";
import bannerNium from "../../assets/logos/banner-nium.webp";

gsap.registerPlugin(ScrollTrigger);

export default function CinematicHeroSection() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const text3Ref = useRef(null);
  const introRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    // Total number of frames (21 to 160 = 140 frames)
    const frameCount = 140;
    const startFrame = 21;
    
    // Function to generate image path
    const currentFrame = (index) => 
      `/frames/ezgif-frame-${String(startFrame + index).padStart(3, "0")}.jpg`;

    const images = [];
    const airpods = {
      frame: 0
    };

    // Preload images
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }

    // Adjust canvas size to window size for cover effect
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    };

    const render = () => {
      const frameIndex = Math.round(airpods.frame);
      if (images[frameIndex]) {
        const img = images[frameIndex];
        if(img.complete && img.naturalHeight !== 0) {
           drawCover(img, context, canvas.width, canvas.height);
        } else {
           img.onload = () => {
             drawCover(img, context, canvas.width, canvas.height);
           };
        }
      }
    };

    // Helper to draw image using object-fit cover logic
    const drawCover = (img, ctx, canvasWidth, canvasHeight) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      const imageRatio = img.width / img.height;
      const canvasRatio = canvasWidth / canvasHeight;
      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (imageRatio > canvasRatio) {
        drawWidth = canvasHeight * imageRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
      } else {
        drawHeight = canvasWidth / imageRatio;
        offsetY = (canvasHeight - drawHeight) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      
      // Optional: draw a subtle dark overlay to ensure text is readable
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    };

    window.addEventListener("resize", setCanvasSize);
    
    // Ensure first frame is drawn once first image is loaded
    images[0].onload = setCanvasSize;
    // Just in case it's already loaded (cached)
    if(images[0].complete) {
        setCanvasSize();
    }

    // GSAP ScrollTrigger Sequence
    let ctxGsap = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=3500", // Length of the pinned scroll
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
        }
      });

      // 1. Intro Screen Animation (scales up and fades out)
      tl.to(introRef.current, { opacity: 0, scale: 1.2, duration: 0.6, ease: "power2.inOut" }, 0);

      // Frame animation
      tl.to(airpods, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        onUpdate: render,
        duration: 4
      }, 0.3); // Starts shortly after intro begins fading out

      // TEXT OVERLAYS ANIMATION (Parallax & Fades)
      
      // Text 1 (Title)
      tl.fromTo(text1Ref.current, 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 0.5 }, 0.2
      )
      .to(text1Ref.current, { opacity: 0, y: -50, duration: 0.5 }, 1.2);

      // Text 2 (Body 1)
      tl.fromTo(text2Ref.current, 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 0.5 }, 1.4
      )
      .to(text2Ref.current, { opacity: 0, y: -50, duration: 0.5 }, 2.4);

      // Text 3 (Stats & CTA)
      tl.fromTo(text3Ref.current, 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 0.5 }, 2.6
      );

      // EXIT TRANSITION: Fade and scale down the canvas & text3 at the very end to seamlessly blend into the next section
      tl.to(canvasRef.current, {
        scale: 0.85,
        opacity: 0,
        filter: "blur(20px)",
        duration: 0.8,
        ease: "power2.inOut"
      }, 3.2);

      tl.to(text3Ref.current, {
        opacity: 0,
        y: -40,
        scale: 0.95,
        duration: 0.6,
        ease: "power2.inOut"
      }, 3.4);
      // Let it unpin after this
    }, containerRef);

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      ctxGsap.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-[#090530] overflow-hidden">
      {/* Cinematic Intro Screen */}
      <div ref={introRef} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#000000]">
        
        {/* Social Icons positioned above IRIS text */}
        <div className="flex gap-4 mb-8">
          {[
            { icon: FaXTwitter, href: SOCIALS.TWITTER, label: "Twitter" },
            { icon: FaInstagram, href: SOCIALS.INSTAGRAM, label: "Instagram" },
            { icon: FaTiktok, href: SOCIALS.TIKTOK, label: "TikTok" },
            { icon: FaYoutube, href: SOCIALS.YOUTUBE, label: "YouTube" },
            { icon: FaEnvelope, href: SOCIALS.EMAIL, label: "Email" }
          ].map((item, index) => (
            <a
              key={index}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${item.label}`}
              className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white hover:text-[#090530] text-white hover:scale-110 active:scale-95 transition-all duration-300"
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300" />
            </a>
          ))}
        </div>

        <h1 className="text-6xl sm:text-8xl md:text-9xl font-black text-white tracking-tighter font-playfair uppercase">IRIS</h1>
        <p className="mt-4 sm:mt-6 text-xs sm:text-sm md:text-base text-white/80 tracking-[0.3em] sm:tracking-[0.5em] uppercase font-semibold">
          The Legacy Continues
        </p>
        <p className="absolute bottom-12 text-[10px] sm:text-xs text-white/40 tracking-widest uppercase animate-pulse">
          Scroll to Explore
        </p>
      </div>

      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      />

      {/* Decorative gradient overlay for extra cinematic luxurious feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#090530] pointer-events-none z-0" />

      {/* Content Layers */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6 sm:px-12 pointer-events-none">
        <div className="max-w-6xl w-full relative h-full flex flex-col justify-center">
          
          {/* Text 1: Big Title */}
          <div ref={text1Ref} className="absolute left-0 bottom-[22%] sm:bottom-24 md:bottom-28 text-left z-20 max-w-4xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[5rem] font-black text-white leading-[1.15] sm:leading-[1.1] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] font-playfair">
              Memancarkan Kilau, <br className="hidden sm:block"/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-violet-300 to-cyan-300 italic pr-4">
                Mengukir Sejarah.
              </span>
            </h1>
          </div>

          {/* Text 2: Story */}
          <div ref={text2Ref} className="absolute right-0 top-[20%] md:top-1/3 text-right max-w-2xl opacity-0 bg-[#090530]/60 backdrop-blur-xl p-6 sm:p-10 rounded-3xl sm:rounded-[2rem] border border-white/15 z-20 shadow-[0_0_40px_rgba(124,58,237,0.3)]">
             <p className="text-sm sm:text-lg md:text-2xl text-white/95 font-medium leading-relaxed drop-shadow-md font-sans">
               Lebih dari sekadar dukungan, IRIS adalah rumah. Berawal dari rasa kagum yang sama terhadap talenta <span className="text-purple-300 font-bold">Nur Intan</span>, kami tumbuh menjadi satu keluarga besar yang bertekad menjaga setiap langkahnya di panggung JKT48.
             </p>
          </div>

          {/* Text 3: Final Stats & CTA */}
          <div ref={text3Ref} className="absolute inset-x-0 bottom-4 sm:bottom-8 md:bottom-12 opacity-0 pointer-events-auto z-20">
            <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-end">
              
              <div className="text-white space-y-4 sm:space-y-6 max-w-xl pb-2 sm:pb-4 bg-black/30 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-4 md:p-0 rounded-2xl md:rounded-none">
                <p className="hidden sm:block text-sm sm:text-base md:text-lg text-white/80 font-medium leading-relaxed drop-shadow-md">
                  Setiap sorakan, karya, dan dedikasi kami adalah pilar penyemangat. Bersama, kita memastikan bahwa kilau Intan tak akan pernah pudar.
                </p>
                <div className="flex justify-between sm:justify-start gap-4 sm:gap-8 border-t border-white/20 pt-4 sm:pt-6">
                  <div className="text-center sm:text-left">
                    <span className="block text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-200 to-purple-500 font-playfair">2+</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/60 font-bold mt-1 sm:mt-2 block">Years<br className="sm:hidden"/> Active</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="block text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 to-cyan-500 font-playfair">200+</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/60 font-bold mt-1 sm:mt-2 block">Members</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="block text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-pink-200 to-pink-500 font-playfair">5+</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/60 font-bold mt-1 sm:mt-2 block">Projects</span>
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col items-center md:items-end text-center md:text-right space-y-4 sm:space-y-5 bg-[#090530]/80 md:bg-[#090530]/60 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl md:rounded-[2rem] border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)] md:shadow-[0_0_50px_rgba(0,0,0,0.6)]">
                <div>
                   <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-widest font-playfair">IRIS</h3>
                   <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-purple-300 mt-1 sm:mt-2">
                     Official Fanbase
                   </p>
                </div>
                <p className="text-white/70 text-xs sm:text-sm max-w-[280px] leading-relaxed">
                  Siap untuk berpartisipasi dan berkontribusi bersama kami dalam mengiringi perjalanan karir Intan?
                </p>
                <a
                  href={SOCIALS.DISCORD}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold uppercase tracking-widest text-xs sm:text-sm transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] group border border-purple-400/50"
                >
                  Join Kami <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
