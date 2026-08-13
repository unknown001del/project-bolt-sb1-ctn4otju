/** Pollinations.ai image generation service — 100% free, zero API key.
 *  Uses the latest high-fidelity anime models via the public endpoint. */

import { buildImagePrompt, getNegativePrompt } from './promptEngine';

const BASE_URL = 'https://image.pollinations.ai/prompt/';

/** Build the full Pollinations.ai image URL for a given prompt + genre. */
export function buildImageUrl(rawPrompt: string, genre: string, seed: number): string {
  const fullPrompt = buildImagePrompt(rawPrompt, genre);
  const negative = getNegativePrompt();
  const encoded = encodeURIComponent(`${fullPrompt} || negative: ${negative}`);
  const params = new URLSearchParams({
    width: '1024',
    height: '576',
    seed: String(seed),
    nologo: 'true',
    model: 'flux',
  });
  return `${BASE_URL}${encoded}?${params.toString()}`;
}

/** Generate image URLs for multiple scenes in parallel.
 *  Returns immediately with URLs — images load lazily via <img> tags. */
export function generateImageUrls(
  prompts: { prompt: string; genre: string }[],
): string[] {
  return prompts.map((p, i) => buildImageUrl(p.prompt, p.genre, Math.floor(Math.random() * 100000) + i * 1000));
}

/** Preload an image and resolve when loaded (or timed out). */
export function preloadImage(url: string, timeoutMs = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ''; resolve(false); }, timeoutMs);
    img.onload = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = url;
  });
}
