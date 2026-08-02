export async function startCamera(maxAttempts = 3): Promise<MediaStream> {
  if (typeof window === "undefined") {
    throw new Error("Akses kamera hanya didukung di lingkungan browser.");
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Browser Anda tidak mendukung akses kamera (pastikan menggunakan koneksi HTTPS atau localhost).");
  }

  // Progressive constraint fallbacks from strict to basic
  const constraintOptions: MediaStreamConstraints[] = [
    {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      },
      audio: false
    },
    {
      video: {
        facingMode: "user"
      },
      audio: false
    },
    {
      video: true,
      audio: false
    }
  ];

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const constraints = constraintOptions[attempt - 1] || { video: true, audio: false };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (stream && stream.getVideoTracks().length > 0) {
        return stream;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Camera] Access attempt ${attempt}/${maxAttempts} failed:`, err?.name || err?.message || err);

      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        throw new Error("Akses kamera diblokir oleh browser. Silakan klik ikon gembok/kamera di sebelah URL browser Anda dan pilih 'Izinkan' (Allow).");
      }

      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  throw new Error(
    lastError?.message || "Gagal mengaktifkan kamera setelah 3 kali percobaan. Silakan periksa apakah webcam sedang digunakan aplikasi lain."
  );
}

export function stopCamera(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
}
