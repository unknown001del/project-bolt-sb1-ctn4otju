/**
 * Story Service - AI Story Writing and Management
 * Handles story generation, character extraction, and scene management
 */

import type { Story, Scene, StoryGenerationConfig } from '@/types/story';
import { enhancePrompt } from './prompt-enhancer';

// In-memory storage (replace with Supabase in production)
let stories: Story[] = [];

/**
 * Generate a full story from a simple prompt using GPT-4o
 */
export async function generateStory(config: StoryGenerationConfig): Promise<Story> {
  const { prompt, genre = 'fantasy', length = 'medium', style = 'cinematic' } = config;

  // In production, this would call OpenAI GPT-4o API
  // For now, we'll simulate the story generation
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  let fullStory: string;
  let summary: string;
  let scenes: Scene[] = [];

  if (OPENAI_API_KEY) {
    // Real API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a world-class screenwriter and novelist. Write compelling, professional-grade stories with rich world-building, developed characters, and emotional depth. Genre: ${genre}. Style: ${style}.`,
          },
          {
            role: 'user',
            content: `Write a ${length} story based on this prompt: "${prompt}". Include:
1. A compelling title
2. A 2-3 sentence summary
3. The full story with chapters/scenes
4. Break down into 8-12 cinematic scenes with detailed visual descriptions for each scene

Format your response as JSON with these fields: title, summary, fullStory, scenes (array of objects with shotType and scenePrompt)`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generated = JSON.parse(data.choices[0].message.content);

    fullStory = generated.fullStory;
    summary = generated.summary;
    scenes = generated.scenes.map((scene: any, index: number) => ({
      id: `scene_${Date.now()}_${index}`,
      scenePrompt: scene.scenePrompt,
      shotType: scene.shotType || 'medium',
    }));
  } else {
    // Mock generation for demo
    fullStory = generateMockStory(prompt, genre);
    summary = `A ${genre} tale about ${prompt}. Follow the journey through unexpected challenges and triumphs.`;
    scenes = generateMockScenes(prompt, genre);
  }

  const story: Story = {
    id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: generateTitle(prompt, genre),
    fullStory,
    genre,
    summary,
    characters: [],
    scenes,
    qualityScore: 9,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  stories.push(story);
  return story;
}

/**
 * Extract characters from a story and offer to create them
 */
export async function extractCharactersFromStory(storyId: string): Promise<string[]> {
  const story = stories.find(s => s.id === storyId);
  if (!story) return [];

  // In production, use GPT-4o to extract character information
  // For now, return mock character names
  const mockCharacters = ['Protagonist', 'Antagonist', 'Mentor', 'Sidekick'];
  return mockCharacters;
}

/**
 * Get all stories
 */
export function getAllStories(): Story[] {
  return [...stories].sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Get story by ID
 */
export function getStoryById(id: string): Story | undefined {
  return stories.find(s => s.id === id);
}

/**
 * Update story
 */
export function updateStory(id: string, updates: Partial<Story>): Story | null {
  const index = stories.findIndex(s => s.id === id);
  if (index === -1) return null;

  stories[index] = {
    ...stories[index],
    ...updates,
    updatedAt: Date.now(),
  };

  return stories[index];
}

/**
 * Delete story
 */
export function deleteStory(id: string): boolean {
  const index = stories.findIndex(s => s.id === id);
  if (index === -1) return false;

  stories.splice(index, 1);
  return true;
}

/**
 * Link a character to a story
 */
export function linkCharacterToStory(storyId: string, characterId: string): boolean {
  const story = stories.find(s => s.id === storyId);
  if (!story) return false;

  if (!story.characters.includes(characterId)) {
    story.characters.push(characterId);
    story.updatedAt = Date.now();
  }

  return true;
}

/**
 * Update scene with generated media
 */
export function updateSceneMedia(
  storyId: string,
  sceneId: string,
  imageUrl?: string,
  videoUrl?: string
): boolean {
  const story = stories.find(s => s.id === storyId);
  if (!story) return false;

  const scene = story.scenes.find(s => s.id === sceneId);
  if (!scene) return false;

  if (imageUrl) scene.imageUrl = imageUrl;
  if (videoUrl) scene.videoUrl = videoUrl;

  story.updatedAt = Date.now();
  return true;
}

// Helper functions for mock generation
function generateTitle(prompt: string, genre: string): string {
  const titles = [
    `The ${genre.charAt(0).toUpperCase() + genre.slice(1)} of ${prompt}`,
    `${prompt}: A ${genre} Tale`,
    `Beyond ${prompt}`,
    `The ${prompt} Chronicles`,
    `Echoes of ${prompt}`,
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateMockStory(prompt: string, genre: string): string {
  return `Chapter 1: The Beginning

In a world where ${prompt} was merely a legend, our story begins. The protagonist discovers that ${prompt} holds the key to everything they've ever known.

Chapter 2: The Journey

Armed with newfound knowledge, they embark on a perilous journey through ${genre} landscapes, facing challenges that test their resolve.

Chapter 3: The Revelation

At the height of their adventure, a shocking revelation changes everything. ${prompt} is not what it seemed.

Chapter 4: The Resolution

In the end, our hero must make a choice that will determine the fate of their world. The legacy of ${prompt} will never be forgotten.`;
}

function generateMockScenes(prompt: string, genre: string): Scene[] {
  const shotTypes: Array<'establishing' | 'close-up' | 'medium' | 'wide' | 'detail' | 'action'> = [
    'establishing',
    'medium',
    'close-up',
    'action',
    'wide',
    'detail',
    'medium',
    'close-up',
    'action',
    'wide',
    'medium',
    'establishing',
  ];

  return shotTypes.map((shotType, index) => ({
    id: `scene_${Date.now()}_${index}`,
    shotType,
    scenePrompt: `${shotType} shot of ${prompt} in ${genre} setting, cinematic lighting, ${index === 0 ? 'epic scale' : 'detailed composition'}`,
  }));
}
