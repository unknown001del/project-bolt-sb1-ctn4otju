/** Prompt expansion engine — automatically pads simple descriptions
 *  with strict cinematic masterpiece style keys for the highest fidelity
 *  anime output via the Pollinations.ai API. */

const STYLE_KEYS = [
  'Masterpiece anime film scene',
  'crisp 2D hand-drawn linework',
  'rich watercolor backgrounds',
  'Ufotable lighting',
  'Wit Studio composition',
  'Kyoto Animation atmospheric glow',
  'high contrast',
  '8k resolution',
  'trending on Sakugabooru',
];

const NEGATIVE_PROMPT =
  'low quality, blurry, deformed, 3d render, photorealistic, western cartoon, ' +
  'bad anatomy, extra limbs, watermark, text, jpeg artifacts, dull colors, flat shading';

const GENRE_KEYWORDS: Record<string, string[]> = {
  'shonen-battle': ['dynamic action pose', 'energy aura', 'dramatic impact frame', 'speed lines', 'explosive effects'],
  'cyberpunk-city': ['neon reflections', 'rain-soaked streets', 'holographic UI', 'dark atmospheric', 'blade runner aesthetic'],
  'fantasy-world': ['magical particles', 'ethereal light rays', 'ancient temple architecture', 'mystical atmosphere', 'golden hour'],
  custom: [],
};

/** Build the full prompt sent to Pollinations.ai from a raw scene description. */
export function buildImagePrompt(rawPrompt: string, genre: string): string {
  const genreKeys = GENRE_KEYWORDS[genre] ?? [];
  const parts = [rawPrompt.trim(), ...STYLE_KEYS, ...genreKeys];
  return parts.join(', ');
}

export function getNegativePrompt(): string {
  return NEGATIVE_PROMPT;
}

/** Parse a raw multi-scene script into structured scene objects.
 *  Recognizes "SCENE N — TITLE" headers, [Setting: ...] blocks,
 *  SPEAKER: dialogue, and NARRATOR: lines. */
export interface ParsedScene {
  title: string;
  setting: string;
  lines: { speaker: string | null; text: string; isAction: boolean }[];
}

export function parseScript(script: string): ParsedScene[] {
  const scenes: ParsedScene[] = [];
  let current: ParsedScene | null = null;
  let currentSetting = '';

  const lines = script.split('\n').map((l) => l.trim());

  for (const line of lines) {
    if (!line) continue;

    // SCENE N — TITLE
    const sceneMatch = line.match(/^SCENE\s+\d+\s*[—–-]\s*(.+)$/i);
    if (sceneMatch) {
      if (current) scenes.push(current);
      current = { title: sceneMatch[1].trim(), setting: '', lines: [] };
      currentSetting = '';
      continue;
    }

    if (!current) {
      current = { title: 'Opening', setting: '', lines: [] };
    }

    // [Setting: ...] or [action text]
    if (line.startsWith('[')) {
      const inner = line.replace(/[\[\]]/g, '');
      const settingMatch = inner.match(/^Setting:\s*(.+)$/i);
      if (settingMatch) {
        current.setting = settingMatch[1].trim();
        currentSetting = current.setting;
      } else {
        current.lines.push({ speaker: null, text: inner, isAction: true });
      }
      continue;
    }

    // SPEAKER: text
    const speakerMatch = line.match(/^([A-Z][A-Z_\s]+?):\s*(.+)$/);
    if (speakerMatch) {
      const speaker = speakerMatch[1].trim();
      current.lines.push({
        speaker: speaker === 'NARRATOR' ? null : speaker,
        text: speakerMatch[2].trim(),
        isAction: false,
      });
      continue;
    }

    // Plain narration line
    current.lines.push({ speaker: null, text: line, isAction: false });
  }

  if (current) scenes.push(current);
  return scenes;
}

/** Build a visual prompt for a scene from its parsed structure. */
export function sceneToPrompt(scene: ParsedScene, genre: string): string {
  const setting = scene.setting || 'anime cinematic scene';
  const actionLines = scene.lines.filter((l) => l.isAction).map((l) => l.text);
  const dialogueChars = scene.lines.filter((l) => l.speaker).map((l) => l.speaker);
  const chars = [...new Set(dialogueChars)].join(' and ');

  const parts = [setting];
  if (chars) parts.push(`featuring ${chars}`);
  if (actionLines.length > 0) parts.push(actionLines[0]);

  const moodMap: Record<string, string> = {
    'shonen-battle': 'dramatic battle scene with energy clashes',
    'cyberpunk-city': 'neon-soaked cyberpunk atmosphere',
    'fantasy-world': 'ethereal fantasy world with magical lighting',
  };
  if (moodMap[genre]) parts.push(moodMap[genre]);

  return parts.join(', ');
}

/** Pick a motion type based on genre and scene content. */
export function pickMotion(scene: ParsedScene, genre: string): string {
  const hasAction = scene.lines.some((l) => l.isAction || /charge|strike|burst|erupt|explode|fight|clash/i.test(l.text));
  if (hasAction) return 'shake';
  if (genre === 'cyberpunk-city') return 'pan-right';
  if (genre === 'fantasy-world') return 'ken-burns-in';
  if (genre === 'shonen-battle') return 'ken-burns-out';
  return 'ken-burns-in';
}

/** Pick particle effect based on genre. */
export function pickParticles(genre: string): string {
  switch (genre) {
    case 'shonen-battle': return 'embers';
    case 'cyberpunk-city': return 'lens-flare';
    case 'fantasy-world': return 'cherry-blossom';
    default: return 'none';
  }
}

/** Generate a unique ID. */
export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
