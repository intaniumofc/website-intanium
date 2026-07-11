import { FrameConfig } from "./types";

export function drawCover(
  ctx: CanvasRenderingContext2D,
  source: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement | ImageBitmap,
  sourceWidth: number,
  sourceHeight: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  mirror: boolean = false,
  scaleFactor: number = 1.0
): void {
  ctx.save();
  
  if (mirror) {
    // Mirror inside the slot width
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
    dx = 0;
    dy = 0;
  }

  const sourceRatio = sourceWidth / sourceHeight;
  const slotRatio = dw / dh;
  let cropW = sourceWidth;
  let cropH = sourceHeight;
  let cropX = 0;
  let cropY = 0;

  if (sourceRatio > slotRatio) {
    cropW = sourceHeight * slotRatio;
    cropX = (sourceWidth - cropW) / 2;
  } else {
    cropH = sourceWidth / slotRatio;
    cropY = (sourceHeight - cropH) / 2;
  }

  // Apply scaleFactor (zoom in from center)
  const zoomedCropW = cropW / scaleFactor;
  const zoomedCropH = cropH / scaleFactor;
  const zoomedCropX = cropX + (cropW - zoomedCropW) / 2;
  const zoomedCropY = cropY + (cropH - zoomedCropH) / 2;

  ctx.drawImage(source, zoomedCropX, zoomedCropY, zoomedCropW, zoomedCropH, dx, dy, dw, dh);
  ctx.restore();
}

export async function compositePhotostrip(
  canvas: HTMLCanvasElement,
  photos: string[],
  frameConfig: FrameConfig,
  mirror: boolean = true,
  scales: number[] = [1, 1, 1, 1]
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = frameConfig.canvasWidth;
  canvas.height = frameConfig.canvasHeight;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Load all captured photos
  const photoImages = await Promise.all(
    photos.map((src) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    })
  );

  // 2. Draw each photo into its corresponding slot
  for (let i = 0; i < frameConfig.slots.length; i++) {
    const slot = frameConfig.slots[i];
    const photo = photoImages[i];
    if (!photo) continue;

    const scaleFactor = scales[i] || 1.0;

    drawCover(
      ctx,
      photo,
      photo.naturalWidth,
      photo.naturalHeight,
      slot.x,
      slot.y,
      slot.width,
      slot.height,
      mirror,
      scaleFactor
    );
  }

  // 3. Draw Frame PNG overlay on top
  const frameImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = frameConfig.src;
  });

  ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

  // 4. Draw Watermark (Logo + Text)
  const watermark = frameConfig.watermark;
  if (watermark) {
    try {
      const logoImg = await new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(new Image()); // Fallback to empty image on load error
        img.src = watermark.logo;
      });

      if (watermark.position === "bottom-global") {
        const padding = 40;
        const logoSize = 50;
        
        // Dynamic position depending on the frame aspect ratio
        let logoX = canvas.width - logoSize - padding - 180;
        let logoY = canvas.height - logoSize - padding;

        if (frameConfig.id === "frame-square") {
          // Put it centered at the bottom margin
          logoX = canvas.width / 2 - 110;
          logoY = canvas.height - logoSize - 20;
        } else if (frameConfig.id === "frame-wide") {
          // Put it at the far bottom right
          logoX = canvas.width - logoSize - padding - 180;
          logoY = canvas.height - logoSize - 40;
        }

        if (logoImg.width > 0) {
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        }
        
        ctx.save();
        ctx.font = "bold 26px var(--font-body), sans-serif";
        ctx.fillStyle = "#3A2E39"; // intanium-text
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(watermark.text, logoImg.width > 0 ? logoX + logoSize + 10 : logoX, logoY + logoSize / 2);
        ctx.restore();
      }
    } catch (err) {
      console.error("Gagal menggambar watermark:", err);
    }
  }
}
