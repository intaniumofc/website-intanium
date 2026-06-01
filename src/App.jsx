import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger to connect with GSAP scroll animations
gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    // Initialize butter-smooth Lenis scrolling globally
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth cubic inertia easing
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false, // Keep standard mobile responsive touch feel
      touchMultiplier: 2,
      infinite: false,
    });

    // Synchronize Lenis scrolling updates with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Bind GSAP ticker rendering loops to Lenis frames
    const tickHandler = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickHandler);

    gsap.ticker.lagSmoothing(0);

    // Clean up connections on unmount
    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickHandler);
    };
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
