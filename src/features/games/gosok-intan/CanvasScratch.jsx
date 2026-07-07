'use client';

import { useEffect, useRef, useState } from 'react';

export default function CanvasScratch({
  width = 130,
  height = 130,
  isRevealed = false,
  disabled = false,
  onScratchComplete,
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef(null);

  // Draw the initial metallic covering layer
  const drawCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 4;

    ctx.clearRect(0, 0, width, height);

    // Radial gradient for 3D metallic silver foil feel
    const grad = ctx.createRadialGradient(cx - 12, cy - 12, 2, cx, cy, radius);
    grad.addColorStop(0, '#ffffff'); // bright silver sheen
    grad.addColorStop(0.4, '#e5e7eb'); // light silver gray-200
    grad.addColorStop(0.7, '#9ca3af'); // mid silver gray-400
    grad.addColorStop(1, '#4b5563'); // darker edge gray-600

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Glowy cyber-style border line
    ctx.lineWidth = 3.5;
    const borderGrad = ctx.createLinearGradient(0, 0, width, height);
    borderGrad.addColorStop(0, '#06b6d4'); // cyan-500
    borderGrad.addColorStop(0.5, '#ec4899'); // pink-500
    borderGrad.addColorStop(1, '#06b6d4');
    ctx.strokeStyle = borderGrad;
    ctx.stroke();
  };

  useEffect(() => {
    if (!isRevealed) {
      drawCover();
    }
  }, [isRevealed]);

  // Handle pointer draw / erase event
  const getPointerPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Support touch and mouse client coordinates
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e) => {
    if (disabled || isRevealed) return;
    e.preventDefault();
    setIsDrawing(true);
    lastPointRef.current = getPointerPos(e);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || disabled || isRevealed) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const currentPoint = getPointerPos(e);
    const lastPoint = lastPointRef.current || currentPoint;

    // Use destination-out to erase the cover
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 22; // brush size

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    lastPointRef.current = currentPoint;
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;
    checkScratchPercentage();
  };

  // Check how much percentage is erased
  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let transparentCount = 0;
    let totalCount = 0;

    // Scan pixel data alpha channel (4th index of each pixel)
    for (let i = 3; i < data.length; i += 4) {
      totalCount++;
      if (data[i] === 0) {
        transparentCount++;
      }
    }

    const percent = (transparentCount / totalCount) * 100;
    if (percent >= 50 && onScratchComplete) {
      onScratchComplete();
    }
  };

  return (
    <div className="relative inline-block select-none pointer-events-auto">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`relative z-10 block rounded-full transition-opacity duration-350 cursor-pointer ${
          isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
