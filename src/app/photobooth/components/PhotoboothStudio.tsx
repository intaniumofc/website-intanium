"use client";

import React, { useReducer, useRef, useEffect, useState } from "react";
import { PhotoboothState, FrameConfig } from "@/lib/photobooth/types";
import { FRAMES_CONFIG } from "@/lib/photobooth/frames";
import { startCamera, stopCamera } from "@/lib/photobooth/camera";
import { compositePhotostrip } from "@/lib/photobooth/compositor";
import { photoboothService } from "../../../services/public/photoboothService";
import WebcamPreview from "./WebcamPreview";
import ControlPanel from "./ControlPanel";
import UploadPanel from "./UploadPanel";

interface State {
  state: PhotoboothState;
  stream: MediaStream | null;
  capturedPhotos: string[];
  photoScales: number[];
  photoIndex: number;
  countdown: number;
  activeFrameId: string;
  errorMsg: string;
  inputMode: "camera" | "upload" | null;
}

type Action =
  | { type: "SELECT_FRAME_NEXT" }
  | { type: "START_CAMERA_REQUEST" }
  | { type: "START_CAMERA_SUCCESS"; stream: MediaStream }
  | { type: "START_CAMERA_FAILURE"; errorMsg: string }
  | { type: "START_UPLOAD_MODE" }
  | { type: "UPLOAD_PHOTO_SUCCESS"; index: number; dataUrl: string }
  | { type: "REMOVE_UPLOADED_PHOTO"; index: number }
  | { type: "PROCESS_UPLOAD" }
  | { type: "CANCEL_UPLOAD" }
  | { type: "SET_COUNTDOWN"; countdown: number }
  | { type: "TICK_COUNTDOWN" }
  | { type: "CAPTURE_PHOTO_START" }
  | { type: "CAPTURE_PHOTO_SUCCESS"; photoDataUrl: string }
  | { type: "CONFIRM_PHOTO_SUCCESS" }
  | { type: "SELECT_SLOT"; index: number }
  | { type: "SET_PHOTO_SCALE"; index: number; scale: number }
  | { type: "SET_FRAME"; frameId: string }
  | { type: "START_EXPORT" }
  | { type: "END_EXPORT" }
  | { type: "RESET" };

const initialState: State = {
  state: "SELECT_FRAME",
  stream: null,
  capturedPhotos: [],
  photoScales: [1.0, 1.0, 1.0, 1.0],
  photoIndex: 0,
  countdown: 0,
  activeFrameId: FRAMES_CONFIG[0].id,
  errorMsg: "",
  inputMode: null
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_FRAME_NEXT":
      return {
        ...state,
        state: "SELECT_INPUT_MODE"
      };
    case "START_CAMERA_REQUEST": {
      const slotsCount = FRAMES_CONFIG.find((f) => f.id === state.activeFrameId)?.slots.length || 4;
      return {
        ...state,
        state: "REQUESTING_CAMERA",
        inputMode: "camera",
        errorMsg: "",
        capturedPhotos: Array(slotsCount).fill(""),
        photoScales: Array(slotsCount).fill(1.0),
        photoIndex: 0,
        countdown: 0
      };
    }
    case "START_CAMERA_SUCCESS":
      return {
        ...state,
        state: "LIVE_PREVIEW",
        stream: action.stream
      };
    case "START_CAMERA_FAILURE":
      return {
        ...state,
        state: "CAMERA_ERROR",
        errorMsg: action.errorMsg,
        inputMode: null
      };
    case "START_UPLOAD_MODE": {
      const slotsCount = FRAMES_CONFIG.find((f) => f.id === state.activeFrameId)?.slots.length || 4;
      return {
        ...state,
        state: "UPLOAD_PREVIEW",
        inputMode: "upload",
        capturedPhotos: Array(slotsCount).fill(""),
        photoScales: Array(slotsCount).fill(1.0),
        photoIndex: 0,
        countdown: 0,
        errorMsg: ""
      };
    }
    case "UPLOAD_PHOTO_SUCCESS": {
      const nextPhotos = [...state.capturedPhotos];
      nextPhotos[action.index] = action.dataUrl;
      return {
        ...state,
        capturedPhotos: nextPhotos
      };
    }
    case "REMOVE_UPLOADED_PHOTO": {
      const nextPhotos = [...state.capturedPhotos];
      nextPhotos[action.index] = "";
      const nextScales = [...state.photoScales];
      nextScales[action.index] = 1.0;
      return {
        ...state,
        capturedPhotos: nextPhotos,
        photoScales: nextScales,
        state: state.state === "CONFIRM_CAPTURE" ? "LIVE_PREVIEW" : state.state
      };
    }
    case "PROCESS_UPLOAD":
      return {
        ...state,
        state: "REVIEW"
      };
    case "CANCEL_UPLOAD": {
      const slotsCount = FRAMES_CONFIG.find((f) => f.id === state.activeFrameId)?.slots.length || 4;
      if (state.state === "SELECT_INPUT_MODE") {
        return {
          ...state,
          state: "SELECT_FRAME",
          inputMode: null,
          capturedPhotos: [],
          photoScales: Array(slotsCount).fill(1.0)
        };
      } else if (
        state.state === "UPLOAD_PREVIEW" ||
        state.state === "LIVE_PREVIEW" ||
        state.state === "CONFIRM_CAPTURE" ||
        state.state === "CAMERA_ERROR" ||
        state.state === "REQUESTING_CAMERA" ||
        state.state === "COUNTDOWN" ||
        state.state === "CAPTURING"
      ) {
        return {
          ...state,
          state: "SELECT_INPUT_MODE",
          inputMode: null,
          capturedPhotos: [],
          photoScales: Array(slotsCount).fill(1.0)
        };
      }
      return state;
    }
    case "SET_COUNTDOWN":
      return {
        ...state,
        state: "COUNTDOWN",
        countdown: action.countdown
      };
    case "TICK_COUNTDOWN":
      return {
        ...state,
        countdown: state.countdown - 1
      };
    case "CAPTURE_PHOTO_START":
      return {
        ...state,
        state: "CAPTURING"
      };
    case "CAPTURE_PHOTO_SUCCESS": {
      const nextPhotos = [...state.capturedPhotos];
      nextPhotos[state.photoIndex] = action.photoDataUrl;
      return {
        ...state,
        capturedPhotos: nextPhotos,
        state: "CONFIRM_CAPTURE"
      };
    }
    case "CONFIRM_PHOTO_SUCCESS": {
      const slotsCount = FRAMES_CONFIG.find((f) => f.id === state.activeFrameId)?.slots.length || 4;
      const nextIndex = state.photoIndex < slotsCount - 1 ? state.photoIndex + 1 : state.photoIndex;
      return {
        ...state,
        photoIndex: nextIndex,
        state: "LIVE_PREVIEW"
      };
    }
    case "SELECT_SLOT": {
      const hasPhoto = state.capturedPhotos[action.index] && state.capturedPhotos[action.index] !== "";
      return {
        ...state,
        photoIndex: action.index,
        state: hasPhoto ? "CONFIRM_CAPTURE" : "LIVE_PREVIEW"
      };
    }
    case "SET_PHOTO_SCALE": {
      const nextScales = [...state.photoScales];
      nextScales[action.index] = action.scale;
      return {
        ...state,
        photoScales: nextScales
      };
    }
    case "SET_FRAME":
      return {
        ...state,
        activeFrameId: action.frameId
      };
    case "START_EXPORT":
      return {
        ...state,
        state: "EXPORTING"
      };
    case "END_EXPORT":
      return {
        ...state,
        state: "REVIEW"
      };
    case "RESET":
      return {
        ...initialState,
        activeFrameId: state.activeFrameId
      };
    default:
      return state;
  }
}

export default function PhotoboothStudio() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [canShare, setCanShare] = useState(false);
  const [settings, setSettings] = useState<{ active: boolean; maintenanceMessage: string } | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const activeFrame = FRAMES_CONFIG.find((f) => f.id === state.activeFrameId) || FRAMES_CONFIG[0];

  // Fetch photobooth configuration settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await photoboothService.getSettings();
        setSettings(data);
      } catch (err) {
        console.error("Gagal memuat pengaturan photobooth:", err);
        setSettings({ active: true, maintenanceMessage: "" }); // fallback
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  // Calculate filled count
  const filledPhotosCount = state.capturedPhotos.filter(p => p !== "").length;
  const isAllCaptured = filledPhotosCount === activeFrame.slots.length;

  // Sync ref with stream state for cleanup
  useEffect(() => {
    streamRef.current = state.stream;
  }, [state.stream]);

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopCamera(streamRef.current);
      }
    };
  }, []);

  // Detect Web Share API support
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.share) {
      setCanShare(true);
    }
  }, []);

  // Handle Canvas Compositing in REVIEW mode
  useEffect(() => {
    if (state.state === "REVIEW" && canvasRef.current && state.capturedPhotos.length === activeFrame.slots.length) {
      const mirrorPhotos = state.inputMode === "camera";
      compositePhotostrip(canvasRef.current, state.capturedPhotos, activeFrame, mirrorPhotos, state.photoScales);
    }
  }, [state.state, state.capturedPhotos, state.activeFrameId, activeFrame, state.inputMode, state.photoScales]);

  // Main Webcam Capture Sequence Trigger
  const startCaptureSequence = async () => {
    dispatch({ type: "START_CAMERA_REQUEST" });
    try {
      const cameraStream = await startCamera();
      dispatch({ type: "START_CAMERA_SUCCESS", stream: cameraStream });
    } catch (err: any) {
      console.error(err);
      dispatch({ type: "START_CAMERA_FAILURE", errorMsg: err.message || "Gagal mengakses kamera." });
    }
  };

  // Timer Countdown loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.state === "COUNTDOWN" && state.countdown > 0) {
      timer = setTimeout(() => {
        dispatch({ type: "TICK_COUNTDOWN" });
      }, 1000);
    } else if (state.state === "COUNTDOWN" && state.countdown === 0) {
      // Countdown finished -> Take picture
      capturePhoto();
    }
    return () => clearTimeout(timer);
  }, [state.state, state.countdown]);

  // Capture Individual Photo
  const capturePhoto = () => {
    dispatch({ type: "CAPTURE_PHOTO_START" });

    setTimeout(() => {
      if (videoRef.current) {
        const video = videoRef.current;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = video.videoWidth || 640;
        tempCanvas.height = video.videoHeight || 480;
        const tempCtx = tempCanvas.getContext("2d");

        if (tempCtx) {
          // Draw video image directly
          tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
          const dataUrl = tempCanvas.toDataURL("image/png");

          dispatch({ type: "CAPTURE_PHOTO_SUCCESS", photoDataUrl: dataUrl });
        }
      }
    }, 250); // Flash animation duration delay before advancing state
  };

  // Stop camera stream safely and reset
  const handleRetake = () => {
    if (state.stream) {
      stopCamera(state.stream);
    }
    dispatch({ type: "RESET" });
  };

  // Trigger download of the completed composite
  const handleDownload = () => {
    if (!canvasRef.current) return;
    dispatch({ type: "START_EXPORT" });

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `intanium-photostrip-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      dispatch({ type: "END_EXPORT" });
    }, "image/png");
  };

  // Trigger Web Share API (native share on mobile)
  const handleShare = async () => {
    if (!canvasRef.current) return;
    dispatch({ type: "START_EXPORT" });

    canvasRef.current.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `intanium-photostrip-${Date.now()}.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "Studio Foto Online Intanium",
              text: "Lihat photostrip kerenku bareng Intan JKT48! Coba di Intanium.com!"
            });
          } catch (err) {
            console.error("Gagal share:", err);
          }
        }
      }
      dispatch({ type: "END_EXPORT" });
    }, "image/png");
  };

  // Cleanup when user finishes and stream is stopped
  useEffect(() => {
    const cameraStates = ["REQUESTING_CAMERA", "LIVE_PREVIEW", "COUNTDOWN", "CAPTURING", "CONFIRM_CAPTURE"];
    if (!cameraStates.includes(state.state) && state.stream) {
      stopCamera(state.stream);
    }
  }, [state.state, state.stream]);

  const isSelectFrame = state.state === "SELECT_FRAME";
  const isSelectInput = state.state === "SELECT_INPUT_MODE";
  const isUploadPreview = state.state === "UPLOAD_PREVIEW";
  const isReview = state.state === "REVIEW";

  // Dynamic order for mobile layout optimization
  const leftColOrder = isReview ? "order-3 md:order-none" : "order-1 md:order-none";
  const centerColOrder = isReview ? "order-1 md:order-none" : "order-3 md:order-none";
  const rightColOrder = "order-2 md:order-none";

  // Handle clicking on specific slot in step 3
  const handleSlotClick = (idx: number) => {
    if (state.inputMode === "camera" && (state.state === "LIVE_PREVIEW" || state.state === "CONFIRM_CAPTURE")) {
      dispatch({ type: "SELECT_SLOT", index: idx });
    } else if (state.inputMode === "upload" && state.state === "UPLOAD_PREVIEW") {
      dispatch({ type: "SELECT_SLOT", index: idx });
    }
  };

  // Check if current slot is filled
  const currentSlotHasPhoto = state.capturedPhotos[state.photoIndex] && state.capturedPhotos[state.photoIndex] !== "";
  const showZoomSlider = state.state === "CONFIRM_CAPTURE" || (state.state === "UPLOAD_PREVIEW" && currentSlotHasPhoto);
  const currentScale = state.photoScales[state.photoIndex] || 1.0;

  // Show Loading Spinner while loading settings
  if (loadingSettings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] animate-spin mb-4" />
        <p className="text-sm text-[var(--text-secondary)] font-body animate-pulse">Menghubungkan ke Studio Foto...</p>
      </div>
    );
  }

  // Show Event Inactive State if disabled by Admin
  if (settings && !settings.active) {
    return (
      <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto py-16 px-4">
        <h1 className="text-3xl font-extrabold text-(--color-primary) tracking-tight mb-4">
          Studio Foto Sedang Nonaktif
        </h1>

        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-8 font-body">
          {settings.maintenanceMessage || "Studio foto saat ini sedang dinonaktifkan sementara. Ikuti terus sosial media resmi kami untuk info event spesial berikutnya!"}
        </p>

        <a
          href="/"
          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:brightness-110 text-white font-semibold text-sm py-3.5 px-8 rounded-xl transition-all shadow-md active:scale-95 text-center cursor-pointer"
        >
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  // Step 1 Layout: Full-Screen Template Selection Grid
  if (isSelectFrame) {
    return (
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-(--color-primary) sm:text-5xl tracking-tight">
            Pilih Bingkai Foto
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-body">
            Pilih template bingkai eksklusif favoritmu untuk memulai sesi photobooth bertema khusus bersama Intan.
          </p>
        </div>

        {/* Grid of Frame Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full justify-center px-4 max-w-2xl">
          {FRAMES_CONFIG.map((frame) => {
            const isActive = frame.id === state.activeFrameId;
            const usesCount = frame.id === "frame-classic" ? "2,124" : "1,052";

            return (
              <button
                key={frame.id}
                onClick={() => dispatch({ type: "SET_FRAME", frameId: frame.id })}
                className={`flex flex-col text-left rounded-3xl bg-white overflow-hidden border-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg w-full focus:outline-hidden relative group cursor-pointer ${isActive
                  ? "border-[var(--color-primary)] shadow-md ring-4 ring-[var(--color-primary-light)]/35"
                  : "border-neutral-200/80 hover:border-neutral-300"
                  }`}
              >
                {/* Image and Badges Container */}
                <div className="w-full aspect-[4/5] bg-neutral-50 relative flex items-center justify-center p-6 border-b border-neutral-100 overflow-hidden">

                  {/* Grid background inside image area to look premium */}
                  <div className="absolute inset-0 bg-neutral-100/50 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:12px_12px]" />

                  {/* Frame Image */}
                  <div
                    className="h-full relative rounded-lg overflow-hidden shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-103"
                    style={{
                      aspectRatio: `${frame.canvasWidth} / ${frame.canvasHeight}`
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={frame.thumbnail ?? frame.src}
                      alt={frame.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* "Free" Badge */}
                  <div className="absolute top-3.5 left-3.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 tracking-wider shadow-xs uppercase">
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Eksklusif
                  </div>
                </div>

                {/* Bottom Content Area */}
                <div className="p-4 w-full flex flex-col">
                  <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1 mb-1">
                    {frame.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-body">
                    <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    <span>{frame.slots.length} photos</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Step Button */}
        <button
          onClick={() => dispatch({ type: "SELECT_FRAME_NEXT" })}
          className="mt-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:brightness-110 text-white font-semibold text-base py-3.5 px-10 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center"
        >
          Lanjut ke Studio Foto
        </button>
      </div>
    );
  }

  // Step 2, 3, 4 Layout: Studio Columns
  return (
    <div className="flex flex-col items-center w-full">
      {/* Header Decoration */}
      <div className="text-center space-y-2 sm:space-y-4 max-w-4xl mx-auto mb-6 sm:mb-10 px-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-(--color-primary) sm:text-5xl tracking-tight">
          Studio Foto Online Intanium
        </h1>
        <p className="text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-body">
          Wujudkan momen impianmu satu frame bersama Intan! Ambil {activeFrame.slots.length} pose ter-kece kamu dan abadikan kenangan manis ini ke dalam bingkai eksklusif pilihanmu.
        </p>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-center flex-1 px-2">

        {/* Left Column: Camera/Upload Preview, Steps Guide, or Export Help */}
        <div className={`md:col-span-4 flex justify-center w-full ${leftColOrder}`}>
          {isSelectInput ? (
            <div className="glass-panel rounded-2xl p-5 bg-[var(--bg-card)] border border-[var(--border-color)] text-center w-full max-w-md">
              <h4 className="font-bold text-[var(--text-primary)] text-sm mb-3">PANDUAN STUDIO FOTO</h4>
              <ul className="text-xs text-[var(--text-secondary)] text-left space-y-3 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)] font-bold">1.</span>
                  <span><strong>Pilih Bingkai</strong>: Pilih format bingkai klasik vertikal, kotak 2x2, atau horizontal lebar. (Selesai)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)] font-bold">2.</span>
                  <span><strong>Metode Foto</strong>: Hubungkan webcam kamera selfie atau unggah file gambar dari memori Anda.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)] font-bold">3.</span>
                  <span><strong>Proses Cekrek/Unggah</strong>: Ambil pose per slot dengan pratinjau instan, atau unggah foto.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)] font-bold">4.</span>
                  <span><strong>Unduh &amp; Simpan</strong>: Download hasil komposit photostrip kualitas HD ke perangkat Anda.</span>
                </li>
              </ul>
            </div>
          ) : isUploadPreview ? (
            <UploadPanel
              photos={state.capturedPhotos}
              onPhotoUploaded={(index, dataUrl) => {
                dispatch({ type: "UPLOAD_PHOTO_SUCCESS", index, dataUrl });
              }}
              onPhotoRemoved={(index) => {
                dispatch({ type: "REMOVE_UPLOADED_PHOTO", index });
              }}
            />
          ) : !isReview ? (
            <WebcamPreview
              state={state.state}
              stream={state.stream}
              photoIndex={state.photoIndex}
              countdown={state.countdown}
              videoRef={videoRef}
              capturedPhotos={state.capturedPhotos}
            />
          ) : (
            <div className="glass-panel rounded-2xl p-5 bg-[var(--bg-card)] border border-[var(--border-color)] text-center w-full max-w-md">
              <h4 className="font-bold text-[var(--text-primary)] text-sm mb-3">PANDUAN EKSPOR</h4>
              <ul className="text-xs text-[var(--text-secondary)] text-left space-y-2.5 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-[var(--color-accent)] font-bold">1.</span>
                  <span>Gunakan tombol <strong>Unduh Foto</strong> untuk menyimpan photostrip format PNG.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-accent)] font-bold">2.</span>
                  <span>Jika Anda menggunakan smartphone, Anda bisa langsung klik <strong>Bagikan</strong> untuk mengirim ke media sosial.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-accent)] font-bold">3.</span>
                  <span>Anda bisa klik tombol <strong>Mulai Baru</strong> untuk mengambil pose baru atau mengganti bingkai dari awal.</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Center Column: Photostrip Canvas / Placeholder */}
        <div className={`md:col-span-4 flex justify-center w-full ${centerColOrder}`}>
          {isReview ? (
            <div className="flex flex-col items-center">
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-w-[220px] md:max-w-[250px] max-h-[70vh] rounded-xl shadow-2xl bg-white border border-[var(--border-color)] transition-transform hover:scale-[1.01]"
                style={{
                  aspectRatio: `${activeFrame.canvasWidth} / ${activeFrame.canvasHeight}`
                }}
              />
            </div>
          ) : (
            <div
              className="relative w-full max-w-[220px] md:max-w-[250px] max-h-[70vh] rounded-xl shadow-xl overflow-hidden bg-white border border-[var(--border-color)] flex flex-col select-none transition-all duration-300 mx-auto"
              style={{
                aspectRatio: `${activeFrame.canvasWidth} / ${activeFrame.canvasHeight}`
              }}
            >
              {/* Grid pattern mock transparent slot background */}
              <div
                className="absolute inset-0 bg-neutral-50 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:16px_16px]"
                style={{ zIndex: 1 }}
              />

              {/* Outer Frame overlay image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeFrame.src}
                alt={activeFrame.name}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 2 }}
              />

              {/* Slot Mock Placements */}
              <div className="absolute inset-0" style={{ zIndex: 3 }}>
                {activeFrame.slots.map((slot, idx) => {
                  const isSlotActive = state.photoIndex === idx && (state.state === "LIVE_PREVIEW" || state.state === "CONFIRM_CAPTURE" || state.state === "COUNTDOWN" || state.state === "CAPTURING" || state.state === "UPLOAD_PREVIEW");
                  const hasPhoto = state.capturedPhotos[idx] && state.capturedPhotos[idx] !== "";
                  const canClick = state.state === "LIVE_PREVIEW" || state.state === "CONFIRM_CAPTURE" || state.state === "UPLOAD_PREVIEW";

                  return (
                     <div
                      key={idx}
                      onClick={() => handleSlotClick(idx)}
                      className={`absolute flex items-center justify-center overflow-hidden text-xs font-bold transition-all duration-300 bg-black/5 text-[var(--text-muted)] border border-dashed border-[var(--border-color)] ${canClick ? "cursor-pointer pointer-events-auto hover:bg-[var(--color-primary-light)]/20" : "pointer-events-none"
                        }`}
                      style={{
                        left: `${(slot.x / activeFrame.canvasWidth) * 100}%`,
                        top: `${(slot.y / activeFrame.canvasHeight) * 100}%`,
                        width: `${(slot.width / activeFrame.canvasWidth) * 100}%`,
                        height: `${(slot.height / activeFrame.canvasHeight) * 100}%`,
                        ...(isSlotActive && canClick ? {
                          borderColor: "var(--color-primary)",
                          borderWidth: "3px",
                          boxShadow: "0 0 10px rgba(23, 12, 121, 0.2)"
                        } : {})
                      }}
                    >
                      {hasPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={state.capturedPhotos[idx]}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-100"
                          style={{
                            transform: `scale(${state.photoScales[idx] || 1.0})`,
                            scale: state.inputMode === "camera" ? "-1 1" : "1 1"
                          }}
                        />
                      ) : (
                        isSlotActive && (state.state === "COUNTDOWN" || state.state === "CAPTURING") ? "POSE" : idx + 1
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Context Action Controls */}
        <div className={`md:col-span-4 flex justify-center w-full ${rightColOrder}`}>
          <ControlPanel
            state={state.state}
            onSelectFrameNext={() => dispatch({ type: "SELECT_FRAME_NEXT" })}
            onStart={startCaptureSequence}
            onStartUpload={() => dispatch({ type: "START_UPLOAD_MODE" })}
            onRetry={() => dispatch({ type: "REMOVE_UPLOADED_PHOTO", index: state.photoIndex })}
            onRetake={handleRetake}
            onDownload={handleDownload}
            onShare={handleShare}
            onProcessUpload={() => dispatch({ type: "PROCESS_UPLOAD" })}
            onCancelUpload={() => dispatch({ type: "CANCEL_UPLOAD" })}
            canShare={canShare}
            uploadedCount={filledPhotosCount}
            slotsCount={activeFrame.slots.length}
            photoIndex={state.photoIndex}
            onCaptureClick={() => dispatch({ type: "SET_COUNTDOWN", countdown: 3 })}
            onConfirmPhoto={() => dispatch({ type: "CONFIRM_PHOTO_SUCCESS" })}
            isAllCaptured={isAllCaptured}
            photoScale={currentScale}
            onScaleChange={(scale) => dispatch({ type: "SET_PHOTO_SCALE", index: state.photoIndex, scale })}
            showZoomSlider={showZoomSlider}
          />
        </div>

      </div>
    </div>
  );
}
