/**
 * Prompt Enhancer - World-Class AI Prompt Engineering
 * Transforms simple user prompts into professional, cinematic, studio-quality prompts
 * Uses Groq SDK for free LLM-based prompt enhancement
 */

import Groq from 'groq-sdk';

export type PromptType = 'image' | 'video' | 'anime' | 'character' | 'story';

interface EnhancementConfig {
  type: PromptType;
  style?: string;
  quality?: 'standard' | 'high' | 'ultra';
  addTechnical?: boolean;
}

const STYLE_PRESETS: Record<string, string> = {
  realistic: 'photorealistic, RAW photo, 8K, ultra detailed, sharp focus, highly detailed skin texture, natural lighting',
  anime: 'masterpiece anime, studio ghibli style, makoto shinkai lighting, ultra detailed, 8K, vibrant colors',
  cinematic: 'cinematic movie still, anamorphic lens, film grain, color graded, dramatic lighting, shallow depth of field',
  '3d': '3D render, Pixar style, octane render, subsurface scattering, global illumination, ray tracing',
  portrait: 'professional portrait, studio lighting, catchlight in eyes, skin detail, hair detail, 85mm lens',
  landscape: 'wide angle, epic landscape, golden hour, atmospheric perspective, volumetric fog, ultra detailed',
};

const TECHNICAL_KEYWORDS = {
  image: [
    'ultra detailed',
    '8K resolution',
    'cinematic lighting',
    'volumetric fog',
    'sharp focus',
    'highly detailed',
    'professional photography',
    'award-winning',
  ],
  video: [
    'high motion quality',
    'smooth motion',
    '24fps',
    '4K resolution',
    'cinematic',
    'no flicker',
    'stable camera',
    'professional video',
  ],
  anime: [
    'masterpiece',
    'best quality',
    'ultra detailed',
    'anime keyframe',
    'studio ghibli',
    'makoto shinkai',
    'vibrant colors',
    'clean lines',
  ],
  character: [
    'consistent face',
    'same character',
    'highly detailed features',
    'professional character design',
    'memorable',
    'iconic',
  ],
  story: [
    'cinematic storytelling',
    'compelling narrative',
    'rich world-building',
    'developed characters',
    'emotional depth',
    'professional screenplay',
  ],
};

const NEGATIVE_PROMPTS = {
  image: 'blurry, low quality, deformed, extra limbs, bad anatomy, distorted faces, distorted hands, watermark, signature, text, ugly, poor quality',
  video: 'blurry, low quality, warping, distortion, flicker, bad motion, extra limbs, bad anatomy, distorted faces',
  anime: 'blurry, low quality, deformed, extra limbs, bad anatomy, distorted faces, simple, low effort, amateur',
  character: 'blurry, low quality, deformed, extra limbs, bad anatomy, distorted faces, inconsistent, generic',
  story: 'repetitive, boring, cliché, poorly written, inconsistent, plot holes, weak characters',
};

/**
 * Enhances a user prompt using Groq LLM for world-class results
 */
async function enhanceWithGroq(
  userPrompt: string,
  type: PromptType,
  style?: string,
  quality?: string
): Promise<string> {
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!GROQ_API_KEY || GROQ_API_KEY === 'groq_free') {
    // Fall back to rule-based enhancement
    return enhanceWithRules(userPrompt, type, style, quality);
  }

  try {
    const groq = new Groq({ apiKey: GROQ_API_KEY });
    
    const systemPrompt = `You are a world-class AI prompt engineer specializing in ${type} generation. 
Transform simple user prompts into professional, cinematic, studio-quality prompts.
Add technical keywords, artist references, and style-specific modifiers.
Return ONLY the enhanced prompt, no explanations.`;

    const userPromptWithContext = `Enhance this ${type} prompt: "${userPrompt}"
${style ? `Style: ${style}` : ''}
${quality ? `Quality: ${quality}` : ''}
Add technical keywords, cinematic lighting, and professional modifiers.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPromptWithContext },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || userPrompt;
  } catch (error) {
    console.warn('Groq API failed, falling back to rule-based enhancement:', error);
    return enhanceWithRules(userPrompt, type, style, quality);
  }
}

/**
 * Rule-based prompt enhancement (fallback)
 */
function enhanceWithRules(
  userPrompt: string,
  type: PromptType,
  style?: string,
  quality?: string
): string {
  const cleanedPrompt = userPrompt.trim().replace(/\s+/g, ' ');
  let enhancedParts: string[] = [];

  // Add style preset if specified
  if (style && STYLE_PRESETS[style]) {
    enhancedParts.push(STYLE_PRESETS[style]);
  }

  // Add quality keywords based on quality level
  if (quality === 'ultra') {
    enhancedParts.push('ultra detailed', '8K', 'masterpiece', 'best quality', 'professional');
  } else if (quality === 'high') {
    enhancedParts.push('highly detailed', '4K', 'high quality');
  }

  // Add technical keywords for the type
  if (TECHNICAL_KEYWORDS[type]) {
    enhancedParts.push(...TECHNICAL_KEYWORDS[type]);
  }

  // Add artist references for image/anime types
  if (type === 'image' || type === 'anime') {
    enhancedParts.push('by artgerm and greg rutkowski');
  }

  // Add the user's prompt
  enhancedParts.push(cleanedPrompt);

  return enhancedParts.join(', ');
}

/**
 * Enhances a user prompt into a world-class professional prompt
 */
export async function enhancePrompt(
  userPrompt: string,
  config: EnhancementConfig
): Promise<{ enhancedPrompt: string; negativePrompt: string }> {
  const { type, style, quality = 'ultra', addTechnical = true } = config;

  // Use Groq for AI-powered enhancement
  const enhancedPrompt = await enhanceWithGroq(userPrompt, type, style, quality);

  // Get appropriate negative prompt
  const negativePrompt = NEGATIVE_PROMPTS[type] || NEGATIVE_PROMPTS.image;

  return { enhancedPrompt, negativePrompt };
}

/**
 * Enhances a prompt specifically for character consistency
 */
export async function enhanceCharacterPrompt(
  userPrompt: string,
  characterName: string,
  characterTraits?: string[]
): Promise<string> {
  const baseEnhancement = await enhanceWithGroq(userPrompt, 'character', undefined, 'ultra');
  
  let characterSpecific = `character ${characterName}, consistent face, same clothes, same hairstyle`;
  
  if (characterTraits && characterTraits.length > 0) {
    characterSpecific += `, ${characterTraits.join(', ')}`;
  }
  
  return `${baseEnhancement}, ${characterSpecific}`;
}

/**
 * Enhances a prompt for anime movie shot generation
 */
export async function enhanceAnimeShotPrompt(
  userPrompt: string,
  shotType: 'establishing' | 'close-up' | 'medium' | 'wide' | 'detail' | 'action'
): Promise<string> {
  const shotModifiers: Record<string, string> = {
    establishing: 'wide establishing shot, epic scale, environmental storytelling',
    'close-up': 'extreme close-up, emotional intensity, detailed expression',
    medium: 'medium shot, balanced composition, character interaction',
    wide: 'wide shot, cinematic scope, environmental context',
    detail: 'extreme detail shot, texture focus, intricate elements',
    action: 'dynamic action shot, motion blur, energy, impact frame',
  };

  const modifier = shotModifiers[shotType] || '';
  const baseEnhancement = await enhanceWithGroq(userPrompt, 'anime', 'anime', 'ultra');
  
  return `${modifier}, ${baseEnhancement}`;
}

/**
 * Enhances a prompt for video generation with camera movement
 */
export async function enhanceVideoPrompt(
  userPrompt: string,
  cameraMovement: 'static' | 'pan-left' | 'pan-right' | 'zoom-in' | 'zoom-out' | 'orbit' | 'crane-up' | 'crane-down'
): Promise<string> {
  const cameraModifiers: Record<string, string> = {
    static: 'static camera, locked shot, stable composition',
    'pan-left': 'slow pan left, smooth camera movement, cinematic panning',
    'pan-right': 'slow pan right, smooth camera movement, cinematic panning',
    'zoom-in': 'slow zoom in, dolly zoom, dramatic push in',
    'zoom-out': 'slow zoom out, dolly zoom, reveal shot',
    orbit: 'orbit camera, 360 degree rotation, dynamic movement',
    'crane-up': 'crane up, ascending shot, epic reveal',
    'crane-down': 'crane down, descending shot, dramatic entrance',
  };

  const modifier = cameraModifiers[cameraMovement] || 'static camera';
  const baseEnhancement = await enhanceWithGroq(userPrompt, 'video', undefined, 'ultra');
  
  return `${modifier}, ${baseEnhancement}`;
}
