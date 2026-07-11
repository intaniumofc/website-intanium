import { FrameConfig } from "./types";

export const FRAMES_CONFIG: FrameConfig[] = [
  {
    id: "frame-classic",
    name: "Klasik Vertikal (4 Foto)",
    thumbnail: "/assets/frames/thumbs/frame-classic-thumb.png",
    src: "/assets/frames/frame-classic.png",
    canvasWidth: 1686,
    canvasHeight: 2528,
    slots: [
      { x: 60, y: 40, width: 730, height: 580 },
      { x: 60, y: 633, width: 730, height: 580 },
      { x: 60, y: 1233, width: 730, height: 580 },
      { x: 60, y: 1843, width: 730, height: 580 }
    ],
    watermark: {
      logo: "/logo-nobg.webp",
      text: "Intanium.com",
      position: "bottom-global"
    }
  },
  {
    id: "frame-2",
    name: "Vertikal Baru (3 Foto)",
    thumbnail: "/assets/frames/frame-2.png", // Use the frame image directly as thumbnail
    src: "/assets/frames/frame-2.png",
    canvasWidth: 1620,
    canvasHeight: 4860,
    slots: [
      { x: 91, y: 505, width: 1438, height: 932 },
      { x: 91, y: 1721, width: 1438, height: 918 },
      { x: 91, y: 2905, width: 1438, height: 936 }
    ],
    watermark: {
      logo: "/logo-nobg.webp",
      text: "Intanium.com",
      position: "bottom-global"
    }
  }
];
