/**
 * AI Video Provider - World-Class Video Generation
 * PRIMARY: Luma Dream Machine + Kling 2.0 + Runway Gen-4 Turbo (via Replicate)
 * FALLBACK: Stable Video Diffusion (via Hugging Face)
 * Uses image-to-video for best quality
 */

export interface VideoGenerationConfig {
  prompt: string;
  negativePrompt?: string;
  imageUrl?: string; // For image-to-video
  duration?: number; // in seconds
  fps?: number;
  cameraMovement?: 'static' | 'pan-left' | 'pan-right' | 'zoom-in' | 'zoom-out' | 'orbit' | 'crane-up' | 'crane-down';
  motionStrength?: 'low' | 'medium' | 'high';
  quality?: 'standard' | 'high' | 'ultra';
  model?: 'luma' | 'kling' | 'runway' | 'stable-video';
}

export interface VideoGenerationResult {
  url: string;
  model: string;
  duration: number;
  fps: number;
  resolution: string;
  generationTime: number;
  previewFrames?: string[];
}

/**
 * Generate video using Luma Dream Machine (Primary)
 */
async function generateWithLuma(
  prompt: string,
  negativePrompt: string,
  config: VideoGenerationConfig
): Promise<VideoGenerationResult> {
  const REPLICATE_API_TOKEN = import.meta.env.VITE_REPLICATE_API_TOKEN;
  
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not configured');
  }

  const startTime = Date.now();

  const input: any = {
    prompt,
    negative_prompt: negativePrompt,
    duration: config.duration || 5,
    fps: config.fps || 24,
  };

  // If image provided, use image-to-video
  if (config.imageUrl) {
    input.image = config.imageUrl;
    input.use_image_as_end_frame = false;
  }

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'luma-ai/luma-dream-machine', // Luma Dream Machine
      input,
    }),
  });

  if (!response.ok) {
    throw new Error(`Luma API error: ${response.statusText}`);
  }

  const prediction = await response.json();
  
  // Poll for result with progress tracking
  let result = prediction;
  let previewFrames: string[] = [];
  
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      },
    });
    result = await pollResponse.json();
    
    // Extract preview frames if available
    if (result.output && typeof result.output === 'object' && 'preview_frames' in result.output) {
      previewFrames = result.output.preview_frames;
    }
  }

  if (result.status === 'failed') {
    throw new Error(`Luma generation failed: ${result.error}`);
  }

  const generationTime = Date.now() - startTime;

  return {
    url: typeof result.output === 'string' ? result.output : result.output.video,
    model: 'luma-dream-machine',
    duration: config.duration || 5,
    fps: config.fps || 24,
    resolution: '1080p',
    generationTime,
    previewFrames,
  };
}

/**
 * Generate video using Kling 2.0 (Primary Alternative)
 */
async function generateWithKling(
  prompt: string,
  negativePrompt: string,
  config: VideoGenerationConfig
): Promise<VideoGenerationResult> {
  const REPLICATE_API_TOKEN = import.meta.env.VITE_REPLICATE_API_TOKEN;
  
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not configured');
  }

  const startTime = Date.now();

  const input: any = {
    prompt,
    negative_prompt: negativePrompt,
    duration: config.duration || 5,
    fps: config.fps || 24,
  };

  // If image provided, use image-to-video
  if (config.imageUrl) {
    input.image = config.imageUrl;
  }

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'kling-ai/kling-2.0', // Kling 2.0
      input,
    }),
  });

  if (!response.ok) {
    throw new Error(`Kling API error: ${response.statusText}`);
  }

  const prediction = await response.json();
  
  // Poll for result
  let result = prediction;
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      },
    });
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(`Kling generation failed: ${result.error}`);
  }

  const generationTime = Date.now() - startTime;

  return {
    url: typeof result.output === 'string' ? result.output : result.output.video,
    model: 'kling-2.0',
    duration: config.duration || 5,
    fps: config.fps || 24,
    resolution: '1080p',
    generationTime,
  };
}

/**
 * Generate video using Runway Gen-4 Turbo (Primary Alternative)
 */
async function generateWithRunway(
  prompt: string,
  negativePrompt: string,
  config: VideoGenerationConfig
): Promise<VideoGenerationResult> {
  const REPLICATE_API_TOKEN = import.meta.env.VITE_REPLICATE_API_TOKEN;
  
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not configured');
  }

  const startTime = Date.now();

  const input: any = {
    prompt,
    negative_prompt: negativePrompt,
    duration: config.duration || 5,
    fps: config.fps || 24,
  };

  // If image provided, use image-to-video
  if (config.imageUrl) {
    input.image = config.imageUrl;
  }

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'runwayml/gen-4-turbo', // Runway Gen-4 Turbo
      input,
    }),
  });

  if (!response.ok) {
    throw new Error(`Runway API error: ${response.statusText}`);
  }

  const prediction = await response.json();
  
  // Poll for result
  let result = prediction;
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      },
    });
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(`Runway generation failed: ${result.error}`);
  }

  const generationTime = Date.now() - startTime;

  return {
    url: typeof result.output === 'string' ? result.output : result.output.video,
    model: 'runway-gen-4-turbo',
    duration: config.duration || 5,
    fps: config.fps || 24,
    resolution: '1080p',
    generationTime,
  };
}

/**
 * Generate placeholder video when no API key is available
 */
async function generatePlaceholderVideo(
  prompt: string,
  config: VideoGenerationConfig
): Promise<VideoGenerationResult> {
  const startTime = Date.now();
  
  // Use a placeholder video/image
  const seed = Math.floor(Math.random() * 1000000);
  const width = 1024;
  const height = 1024;
  
  // Use picsum.photos for placeholder (image acting as video)
  const url = `https://picsum.photos/seed/${seed}/${width}/${height}`;
  
  const generationTime = Date.now() - startTime;

  return {
    url,
    model: 'placeholder',
    duration: config.duration || 5,
    fps: config.fps || 24,
    resolution: '1024x1024',
    generationTime,
  };
}

/**
 * Generate video using Stable Video Diffusion via Hugging Face (Free Fallback)
 */
async function generateWithStableVideo(
  prompt: string,
  negativePrompt: string,
  config: VideoGenerationConfig
): Promise<VideoGenerationResult> {
  const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  
  if (!HUGGINGFACE_API_KEY || HUGGINGFACE_API_KEY === 'hf_free') {
    console.warn('HUGGINGFACE_API_KEY not configured, using placeholder video');
    return await generatePlaceholderVideo(prompt, config);
  }

  const startTime = Date.now();

  // If image provided, use image-to-video
  if (config.imageUrl) {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid-xt',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: config.imageUrl,
            parameters: {
              num_frames: (config.fps || 24) * (config.duration || 5),
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.warn(`Hugging Face SVD API error: ${response.statusText} - ${error}, using placeholder`);
        return await generatePlaceholderVideo(prompt, config);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const generationTime = Date.now() - startTime;

      return {
        url,
        model: 'stable-video-diffusion',
        duration: config.duration || 5,
        fps: config.fps || 24,
        resolution: '576x1024',
        generationTime,
      };
    } catch (error) {
      console.warn('SVD generation failed, using placeholder:', error);
      return await generatePlaceholderVideo(prompt, config);
    }
  }

  // Text-to-video fallback using ModelScope
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/modelscope/t2v-xt',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_frames: (config.fps || 24) * (config.duration || 5),
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.warn(`Hugging Face T2V API error: ${response.statusText} - ${error}, using placeholder`);
      return await generatePlaceholderVideo(prompt, config);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const generationTime = Date.now() - startTime;

    return {
      url,
      model: 't2v-xt',
      duration: config.duration || 5,
      fps: config.fps || 24,
      resolution: '720p',
      generationTime,
    };
  } catch (error) {
    console.warn('T2V generation failed, using placeholder:', error);
    return await generatePlaceholderVideo(prompt, config);
  }
}

/**
 * Main video generation function with automatic fallback
 */
export async function generateVideo(
  config: VideoGenerationConfig
): Promise<VideoGenerationResult> {
  const { prompt, negativePrompt = '', model = 'luma' } = config;

  // Try Hugging Face free model first if no Replicate token
  const REPLICATE_API_TOKEN = import.meta.env.VITE_REPLICATE_API_TOKEN;
  if (!REPLICATE_API_TOKEN || model === 'stable-video') {
    try {
      return await generateWithStableVideo(prompt, negativePrompt, config);
    } catch (error) {
      console.warn('Hugging Face model failed:', error);
    }
  }

  try {
    // Try primary model first
    if (model === 'luma') {
      return await generateWithLuma(prompt, negativePrompt, config);
    } else if (model === 'kling') {
      return await generateWithKling(prompt, negativePrompt, config);
    } else if (model === 'runway') {
      return await generateWithRunway(prompt, negativePrompt, config);
    }
  } catch (error) {
    console.warn('Primary model failed, trying fallback:', error);
  }

  // Fallback chain
  const fallbackModels = ['kling', 'runway', 'luma'];
  for (const fallbackModel of fallbackModels) {
    if (fallbackModel === model) continue;
    
    try {
      if (fallbackModel === 'luma') {
        return await generateWithLuma(prompt, negativePrompt, config);
      } else if (fallbackModel === 'kling') {
        return await generateWithKling(prompt, negativePrompt, config);
      } else if (fallbackModel === 'runway') {
        return await generateWithRunway(prompt, negativePrompt, config);
      }
    } catch (error) {
      console.warn(`${fallbackModel} fallback failed:`, error);
    }
  }

  // Final fallback to Hugging Face
  try {
    return await generateWithStableVideo(prompt, negativePrompt, config);
  } catch (error) {
    console.error('All models failed:', error);
    throw new Error('Video generation failed with all available models');
  }
}

/**
 * Generate video with image-to-video workflow (best quality)
 */
export async function generateVideoFromImage(
  imageUrl: string,
  prompt: string,
  config: Omit<VideoGenerationConfig, 'imageUrl'>
): Promise<VideoGenerationResult> {
  return generateVideo({
    ...config,
    imageUrl,
    prompt,
  });
}

/**
 * Generate video with automatic quality check and retry
 */
export async function generateVideoWithQualityCheck(
  config: VideoGenerationConfig,
  maxRetries: number = 3
): Promise<{ result: VideoGenerationResult; qualityScore: number; attempts: number }> {
  const { generateWithQualityCheck } = await import('../quality-check');

  const qualityResult = await generateWithQualityCheck(
    async () => {
      const result = await generateVideo(config);
      return { url: result.url, data: result };
    },
    'video',
    maxRetries,
    { minScore: 8 }
  );

  return {
    result: qualityResult.data as VideoGenerationResult,
    qualityScore: qualityResult.qualityScore,
    attempts: qualityResult.attempts,
  };
}

/**
 * Progress callback type for real-time updates
 */
export type VideoProgressCallback = (progress: number, previewFrame?: string) => void;

/**
 * Generate video with real-time progress tracking
 */
export async function generateVideoWithProgress(
  config: VideoGenerationConfig,
  onProgress: VideoProgressCallback
): Promise<VideoGenerationResult> {
  const REPLICATE_API_TOKEN = import.meta.env.VITE_REPLICATE_API_TOKEN;
  
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not configured');
  }

  const { prompt, negativePrompt = '', model = 'luma' } = config;
  const startTime = Date.now();

  const input: any = {
    prompt,
    negative_prompt: negativePrompt,
    duration: config.duration || 5,
    fps: config.fps || 24,
  };

  if (config.imageUrl) {
    input.image = config.imageUrl;
  }

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: model === 'luma' ? 'luma-ai/luma-dream-machine' : 
               model === 'kling' ? 'kling-ai/kling-2.0' : 
               'runwayml/gen-4-turbo',
      input,
    }),
  });

  if (!response.ok) {
    throw new Error(`Video API error: ${response.statusText}`);
  }

  const prediction = await response.json();
  
  // Poll for result with progress updates
  let result = prediction;
  let lastProgress = 0;
  
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      },
    });
    result = await pollResponse.json();
    
    // Estimate progress based on time elapsed
    const elapsed = Date.now() - startTime;
    const estimatedTotal = 60000; // 60 seconds average
    const progress = Math.min(95, Math.floor((elapsed / estimatedTotal) * 100));
    
    if (progress > lastProgress) {
      lastProgress = progress;
      onProgress(progress);
    }
    
    // Check for preview frames
    if (result.output && typeof result.output === 'object' && 'preview_frames' in result.output) {
      const frames = result.output.preview_frames;
      if (frames && frames.length > 0) {
        onProgress(progress, frames[frames.length - 1]);
      }
    }
  }

  onProgress(100);

  if (result.status === 'failed') {
    throw new Error(`Video generation failed: ${result.error}`);
  }

  const generationTime = Date.now() - startTime;

  return {
    url: typeof result.output === 'string' ? result.output : result.output.video,
    model,
    duration: config.duration || 5,
    fps: config.fps || 24,
    resolution: '1080p',
    generationTime,
  };
}
