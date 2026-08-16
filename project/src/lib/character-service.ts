/**
 * Character Service - Character Generation and Consistency System
 * Handles character creation, storage, and consistency injection for all generators
 */

import type { Character, CharacterGenerationConfig, CharacterConsistencyConfig } from '@/types/character';
import { enhancePrompt, enhanceCharacterPrompt } from './prompt-enhancer';
import { generateImageWithQualityCheck } from './ai-providers/image';

// In-memory storage (replace with Supabase in production)
let characters: Character[] = [];

/**
 * Generate a new character with consistent face
 */
export async function createCharacter(config: CharacterGenerationConfig): Promise<Character> {
  const { name, age, gender, outfit, artStyle, traits, referenceImage, prompt } = config;

  // Build character prompt for face generation
  const basePrompt = prompt || `${gender} character, ${age} years old, ${outfit}, ${traits.join(', ')}`;
  const enhancedPrompt = await enhanceCharacterPrompt(basePrompt, name, traits);

  // Generate character face image
  const imageResult = await generateImageWithQualityCheck({
    prompt: enhancedPrompt,
    negativePrompt: 'blurry, low quality, deformed, extra limbs, bad anatomy',
    style: artStyle,
    width: 1024,
    height: 1024,
    quality: 'ultra',
    model: 'animagine-xl',
  });

  // Create character object
  const character: Character = {
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    faceImageUrl: imageResult.result.url,
    faceEmbedding: await generateFaceEmbedding(imageResult.result.url),
    age,
    gender,
    outfit,
    artStyle,
    traits,
    backstory: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    qualityScore: imageResult.qualityScore,
  };

  // Store character
  characters.push(character);

  return character;
}

/**
 * Generate face embedding for character consistency
 * In production, this would use a face recognition model like FaceNet or ArcFace
 */
async function generateFaceEmbedding(imageUrl: string): Promise<string> {
  // TODO: Integrate with face recognition API
  // For now, return a mock embedding
  const mockEmbedding = Array.from({ length: 128 }, () => Math.random());
  return btoa(mockEmbedding.join(','));
}

/**
 * Get all characters
 */
export function getAllCharacters(): Character[] {
  return [...characters];
}

/**
 * Get character by ID
 */
export function getCharacterById(id: string): Character | undefined {
  return characters.find(c => c.id === id);
}

/**
 * Update character
 */
export function updateCharacter(id: string, updates: Partial<Character>): Character | null {
  const index = characters.findIndex(c => c.id === id);
  if (index === -1) return null;

  characters[index] = {
    ...characters[index],
    ...updates,
    updatedAt: Date.now(),
  };

  return characters[index];
}

/**
 * Delete character
 */
export function deleteCharacter(id: string): boolean {
  const index = characters.findIndex(c => c.id === id);
  if (index === -1) return false;

  characters.splice(index, 1);
  return true;
}

/**
 * Inject character consistency into a prompt
 * This is used when generating images/videos with a specific character
 */
export async function injectCharacterConsistency(
  prompt: string,
  config: CharacterConsistencyConfig
): Promise<string> {
  const character = getCharacterById(config.characterId);
  if (!character) return prompt;

  let enhancedPrompt = prompt;

  // Add character-specific keywords
  enhancedPrompt += `, character ${character.name}, consistent face, same clothes, same hairstyle`;

  // Add character traits
  if (character.traits.length > 0) {
    enhancedPrompt += `, ${character.traits.join(', ')}`;
  }

  // Add art style lock
  enhancedPrompt += `, ${character.artStyle} style`;

  // If using IP-Adapter or FaceID, add technical keywords
  if (config.useIPAdapter || config.useFaceID) {
    enhancedPrompt += ', face reference, character consistency';
  }

  return enhancedPrompt;
}

/**
 * Generate character reference image for IP-Adapter
 * This creates a clean reference image for consistency models
 */
export async function generateCharacterReference(
  characterId: string
): Promise<string> {
  const character = getCharacterById(characterId);
  if (!character) throw new Error('Character not found');

  // Generate a clean reference image with neutral expression
  const referencePrompt = await enhancePrompt(
    `${character.name}, neutral expression, front view, studio lighting, clean background`,
    { type: 'character', style: character.artStyle }
  );

  const result = await generateImageWithQualityCheck({
    prompt: referencePrompt.enhancedPrompt,
    negativePrompt: referencePrompt.negativePrompt,
    style: character.artStyle,
    width: 512,
    height: 512,
    quality: 'high',
  });

  return result.result.url;
}

/**
 * Batch generate character variations
 */
export async function generateCharacterVariations(
  characterId: string,
  variations: string[]
): Promise<{ expression: string; imageUrl: string }[]> {
  const character = getCharacterById(characterId);
  if (!character) throw new Error('Character not found');

  const results = await Promise.all(
    variations.map(async (expression) => {
      const prompt = await enhanceCharacterPrompt(
        `${character.name}, ${expression}`,
        character.name,
        character.traits
      );

      const result = await generateImageWithQualityCheck({
        prompt,
        negativePrompt: 'blurry, low quality, deformed',
        style: character.artStyle,
        width: 1024,
        height: 1024,
        quality: 'high',
      });

      return {
        expression,
        imageUrl: result.result.url,
      };
    })
  );

  return results;
}

/**
 * Export character data for backup
 */
export function exportCharacter(characterId: string): string {
  const character = getCharacterById(characterId);
  if (!character) throw new Error('Character not found');

  return JSON.stringify(character, null, 2);
}

/**
 * Import character data from backup
 */
export function importCharacter(characterData: string): Character {
  const character = JSON.parse(characterData) as Character;
  
  // Validate character
  if (!character.id || !character.name || !character.faceImageUrl) {
    throw new Error('Invalid character data');
  }

  // Check for duplicate ID
  if (characters.find(c => c.id === character.id)) {
    character.id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  characters.push(character);
  return character;
}
