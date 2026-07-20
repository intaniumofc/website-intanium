'use client';

import { useState, useEffect } from "react";

function detectWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

function isMobileOrLowPower() {
  if (typeof window === "undefined") return false;

  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  const isCoarsePointer =
    window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  return mobileUA || isCoarsePointer;
}

function prefersReducedTransparency() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
}

/**
 * useCapabilityGate
 *
 * Returns environmental info used to decide whether WebGL/R3F should be used.
 * On mobile, low-power, or no-WebGL we fall back to CSS.
 */
export function useCapabilityGate() {
  const [state, setState] = useState({
    canRenderWebGL: false,
    isMobileOrLowPower: false,
    reducedTransparency: false,
  });

  useEffect(() => {
    setState({
      canRenderWebGL: detectWebGL(),
      isMobileOrLowPower: isMobileOrLowPower(),
      reducedTransparency: prefersReducedTransparency(),
    });
  }, []);

  return state;
}

export default useCapabilityGate;