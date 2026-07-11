export async function startCamera(): Promise<MediaStream> {
  if (typeof window === "undefined") {
    throw new Error("Akses kamera hanya didukung di lingkungan browser.");
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Browser Anda tidak mendukung akses kamera.");
  }

  const constraints: MediaStreamConstraints = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: "user"
    },
    audio: false
  };

  return await navigator.mediaDevices.getUserMedia(constraints);
}

export function stopCamera(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
}
