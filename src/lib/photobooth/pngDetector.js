/**
 * Utility to analyze a PNG Frame Image and automatically detect
 * transparent holes (alpha < 20) as photo slot coordinates { x, y, width, height }.
 */
export function detectPngSlots(imgElement) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const width = imgElement.naturalWidth || imgElement.width;
    const height = imgElement.naturalHeight || imgElement.height;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      resolve({ canvasWidth: width, canvasHeight: height, slots: [] });
      return;
    }

    ctx.drawImage(imgElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    // Sample every 4th pixel for fast detection
    const step = 4;
    const cols = Math.floor(width / step);
    const rows = Math.floor(height / step);
    const mask = new Uint8Array(cols * rows);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pxX = c * step;
        const pxY = r * step;
        const alphaIndex = (pxY * width + pxX) * 4 + 3;
        // Alpha < 20 means transparent slot hole
        if (data[alphaIndex] < 20) {
          mask[r * cols + c] = 1;
        }
      }
    }

    // Connected Component Labeling using BFS
    const visited = new Uint8Array(cols * rows);
    const boundingBoxes = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (mask[idx] && !visited[idx]) {
          let minR = r, maxR = r, minC = c, maxC = c;
          const queue = [r, c];
          visited[idx] = 1;

          while (queue.length > 0) {
            const currC = queue.pop();
            const currR = queue.pop();

            if (currR < minR) minR = currR;
            if (currR > maxR) maxR = currR;
            if (currC < minC) minC = currC;
            if (currC > maxC) maxC = currC;

            const neighbors = [
              [currR + 1, currC],
              [currR - 1, currC],
              [currR, currC + 1],
              [currR, currC - 1]
            ];

            for (const [nr, nc] of neighbors) {
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                const nIdx = nr * cols + nc;
                if (mask[nIdx] && !visited[nIdx]) {
                  visited[nIdx] = 1;
                  queue.push(nr, nc);
                }
              }
            }
          }

          const slotX = minC * step;
          const slotY = minR * step;
          const slotW = (maxC - minC + 1) * step;
          const slotH = (maxR - minR + 1) * step;

          // Filter out tiny noise / holes smaller than 1.5% of canvas area
          const area = slotW * slotH;
          const minArea = width * height * 0.015;

          if (area >= minArea) {
            boundingBoxes.push({
              x: slotX,
              y: slotY,
              width: slotW,
              height: slotH
            });
          }
        }
      }
    }

    // Sort slots top-to-bottom, then left-to-right
    boundingBoxes.sort((a, b) => (a.y - b.y) || (a.x - b.x));

    resolve({
      canvasWidth: width,
      canvasHeight: height,
      slots: boundingBoxes
    });
  });
}
