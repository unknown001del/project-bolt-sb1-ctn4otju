/**
 * AI Image Provider - World-Class Image Generation
 * PRIMARY: Hugging Face Animagine XL 3.1 (Free, No Permission Errors)
 */

export interface ImageGenerationConfig {
  prompt: string;
  negativePrompt?: string;
  style?: 'realistic' | 'anime' | 'cinematic' | '3d' | 'portrait' | 'landscape';
  width?: number;
  height?: number;
  quality?: 'standard' | 'high' | 'ultra';
  seed?: number;
  model?: 'animagine-xl';
}

export interface ImageGenerationResult {
  url: string;
  seed: number;
  model: string;
  width: number;
  height: number;
  generationTime: number;
}

/**
 * Generate placeholder image when no API key is available
 */
async function generatePlaceholder(
  prompt: string,
  config: ImageGenerationConfig
): Promise<ImageGenerationResult> {
  const startTime = Date.now();
  
  // Use a placeholder image service
  const width = config.width || 1024;
  const height = config.height || 1024;
  const seed = config.seed || Math.floor(Math.random() * 1000000);
  
  // Use picsum.photos for placeholder images
  const url = `https://picsum.photos/seed/${seed}/${width}/${height}`;
  
  const generationTime = Date.now() - startTime;

  return {
    url,
    seed,
    model: 'placeholder',
    width,
    height,
    generationTime,
  };
}

/**
 * Generate image using Hugging Face Animagine XL 3.1
 */
async function generateWithAnimagineXL(
  prompt: string,
  negativePrompt: string,
  config: ImageGenerationConfig
): Promise<ImageGenerationResult> {
  const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  
  if (!HUGGINGFACE_API_KEY || HUGGINGFACE_API_KEY === 'hf_free') {
    console.warn('HUGGINGFACE_API_KEY not configured, using placeholder image');
    return await generatePlaceholder(prompt, config);
  }

  const startTime = Date.now();

  const response = await fetch(
    'https://api-inference.huggingface.co/models/cagliostrolab/animagine-xl-3.1',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: negativePrompt,
          width: config.width || 1024,
          height: config.height || 1024,
          num_inference_steps: config.quality === 'ultra' ? 50 : config.quality === 'high' ? 30 : 20,
          guidance_scale: 7.5,
          seed: config.seed,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.warn(`Hugging Face API error: ${response.statusText} - ${error}, using placeholder`);
    return await generatePlaceholder(prompt, config);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const generationTime = Date.now() - startTime;

  return {
    url,
    seed: config.seed || Math.floor(Math.random() * 1000000),
    model: 'animagine-xl-3.1',
    width: config.width || 1024,
    height: config.height || 1024,
    generationTime,
  };
}

/**
 * Main image generation function
 */
export async function generateImage(
  config: ImageGenerationConfig
): Promise<ImageGenerationResult> {
  const { prompt, negativePrompt = '', model = 'animagine-xl' } = config;

  return await generateWithAnimagineXL(prompt, negativePrompt, config);
}

/**
 * Compress image using browser native canvas
 */
export async function compressImage(
  imageUrl: string,
  quality: number = 0.9,
  maxWidth: number = 2048
): Promise<string> {
  try {
    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Calculate new dimensions
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = height * ratio;
    }

    // Create canvas and draw
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    ctx.drawImage(img, 0, 0, width, height);

    // Compress to WebP
    const compressedDataUrl = canvas.toDataURL('image/webp', quality);
    
    // Convert to blob URL
    const response = await fetch(compressedDataUrl);
    const blob = await response.blob();
    
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn('Image compression failed, returning original:', error);
    return imageUrl;
  }
}

/**
 * Upscale image using browser native canvas (simple scaling)
 */
export async function upscaleImage(
  imageUrl: string,
  scale: 2 | 4 = 4
): Promise<string> {
  try {
    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Calculate new dimensions
    const width = img.width * scale;
    const height = img.height * scale;

    // Create canvas and draw with high quality
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    // Enable high quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to WebP
    const upscaledDataUrl = canvas.toDataURL('image/webp', 0.95);
    
    // Convert to blob URL
    const response = await fetch(upscaledDataUrl);
    const blob = await response.blob();
    
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn('Image upscaling failed, returning original:', error);
    return imageUrl;
  }
}

/**
 * Generate image with automatic quality check and retry
 */
export async function generateImageWithQualityCheck(
  config: ImageGenerationConfig,
  maxRetries: number = 3
): Promise<{ result: ImageGenerationResult; qualityScore: number; attempts: number }> {
  const { generateWithQualityCheck } = await import('../quality-check');

  const qualityResult = await generateWithQualityCheck(
    async () => {
      const result = await generateImage(config);
      return { url: result.url, data: result };
    },
    'image',
    maxRetries,
    { minScore: 8 }
  );

  return {
    result: qualityResult.data as ImageGenerationResult,
    qualityScore: qualityResult.qualityScore,
    attempts: qualityResult.attempts,
  };
}
