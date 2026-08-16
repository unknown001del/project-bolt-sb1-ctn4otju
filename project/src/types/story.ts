/**
 * Story Library Types
 * For professional story management with character integration
 */

export interface Scene {
  id: string;
  scenePrompt: string;
  imageUrl?: string;
  videoUrl?: string;
  duration?: number;
  shotType: 'establishing' | 'close-up' | 'medium' | 'wide' | 'detail' | 'action';
}

export interface Story {
  id: string;
  title: string;
  fullStory: string;
  genre: string;
  summary: string;
  characters: string[]; // Character IDs
  scenes: Scene[];
  coverImageUrl?: string;
  qualityScore: number; // 1-10
  createdAt: number;
  updatedAt: number;
}

export interface StoryGenerationConfig {
  prompt: string;
  genre?: string;
  length?: 'short' | 'medium' | 'full';
  style?: 'cinematic' | 'anime' | 'realistic';
}
