/**
 * Character System Types
 * For consistent character generation across all AI generators
 */

export interface Character {
  id: string;
  name: string;
  faceImageUrl: string;
  faceEmbedding?: string; // Face ID embedding for consistency
  loraModel?: string; // LoRA model path if trained
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  outfit: string;
  artStyle: 'realistic' | 'anime' | 'cinematic' | '3d' | 'portrait';
  traits: string[];
  backstory?: string;
  createdAt: number;
  updatedAt: number;
  qualityScore: number; // 1-10
}

export interface CharacterGenerationConfig {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  outfit: string;
  artStyle: 'realistic' | 'anime' | 'cinematic' | '3d' | 'portrait';
  traits: string[];
  referenceImage?: string; // Optional user-uploaded reference
  prompt?: string; // Custom prompt for face generation
}

export interface CharacterConsistencyConfig {
  characterId: string;
  strength: number; // 0-1, how strongly to enforce consistency
  useIPAdapter: boolean;
  useFaceID: boolean;
}
