/**
 * Local, bounded composition analysis for TV title placement.
 * Scores visual complexity on a tiny 80x45 canvas; no model, remote AI or image upload.
 * Canvas CORS failures gracefully use the default left-side layout.
 */
export type TextSide = "left" | "right";
const remembered = new Map<string, TextSide>();
const MAX_CACHE = 36;

export function chooseTextSide(pixels: Uint8ClampedArray, width: number, height: number): TextSide {
  if (width < 8 || height < 8 || pixels.length < width * height * 4) return "left";
  const luminosity = (p: number) => .2126 * pixels[p] + .7152 * pixels[p+1] + .0722 * pixels[p+2];
  let left = 0, right = 0;
  for (let y = Math.floor(height * .18); y < Math.floor(height * .84); y += 2) {
    for (let x = Math.floor(width * .07); x < Math.floor(width * .93) - 1; x += 2) {
      const i = (y * width + x) * 4;
      const next = (y * width + x + 1) * 4;
      const below = ((y + 1) * width + x) * 4;
      const energy = Math.abs(luminosity(i) - luminosity(next)) +
        Math.abs(luminosity(i) - luminosity(below));
      const saturation = Math.max(pixels[i], pixels[i+1], pixels[i+2]) -
        Math.min(pixels[i], pixels[i+1], pixels[i+2]);
      const weight = energy + saturation * .11;
      if (x < width * .47) left += weight;
      else if (x > width * .53) right += weight;
    }
  }
  return left > right * 1.12 ? "right" : "left";
}

export function analyzeWallpaperTextSide(src: string): Promise<TextSide> {
  const cached = remembered.get(src);
  if (cached) return Promise.resolve(cached);
  if (typeof window === "undefined" || !src) return Promise.resolve("left");
  return new Promise(resolve => {
    const img = new Image();
    let finished = false;
    const complete = (side: TextSide) => {
      if (finished) return;
      finished = true;
      if (remembered.size >= MAX_CACHE) remembered.delete(remembered.keys().next().value!);
      remembered.set(src, side);
      resolve(side);
    };
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 80; canvas.height = 45;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return complete("left");
        ctx.drawImage(img, 0, 0, 80, 45);
        const data = ctx.getImageData(0, 0, 80, 45).data;
        complete(chooseTextSide(data, 80, 45));
      } catch { complete("left"); }
    };
    img.onerror = () => complete("left");
    img.src = src;
  });
}
