export interface SceneFrame {
  id: string;
  prompt: string;
  imageUrl: string | null;
  caption: string;
  duration: number;
  motion: MotionType;
  particles: ParticleType;
  audioText: string;
  speaker: string | null;
}

export type MotionType = 'ken-burns-in' | 'ken-burns-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'shake' | 'static';
export type ParticleType = 'none' | 'cherry-blossom' | 'embers' | 'lens-flare' | 'rain' | 'snow';

export interface StoryProject {
  id: string;
  title: string;
  genre: string;
  script: string;
  frames: SceneFrame[];
  createdAt: number;
  updatedAt: number;
}

export type Genre = 'shonen-battle' | 'cyberpunk-city' | 'fantasy-world' | 'custom';

export interface ScriptTemplate {
  id: Genre;
  label: string;
  icon: string;
  script: string;
  accent: string;
}

export const VOICE_TYPES = ['narrator', 'deep-male', 'soft-male', 'deep-female', 'soft-female'] as const;
export type VoiceType = typeof VOICE_TYPES[number];
