/**
 * Character Generator - World-Class Character Creation
 * Users can create consistent characters with LoRA/FaceID for use across all generators
 */

import { useState, useCallback } from 'react';
import { Sparkles, User, Plus, Trash2, Download, Upload, Camera, RefreshCw } from 'lucide-react';
import type { Character, CharacterGenerationConfig } from '@/types/character';
import { createCharacter, getAllCharacters, deleteCharacter, generateCharacterVariations } from '@/lib/character-service';

interface CharacterGeneratorProps {
  onSelectCharacter?: (character: Character) => void;
  selectedCharacterId?: string;
}

export default function CharacterGenerator({ onSelectCharacter, selectedCharacterId }: CharacterGeneratorProps) {
  const [characters, setCharacters] = useState<Character[]>(getAllCharacters());
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary' | 'other'>('other');
  const [outfit, setOutfit] = useState('');
  const [artStyle, setArtStyle] = useState<'realistic' | 'anime' | 'cinematic' | '3d' | 'portrait'>('realistic');
  const [traits, setTraits] = useState<string[]>([]);
  const [traitInput, setTraitInput] = useState('');

  const refreshCharacters = useCallback(() => {
    setCharacters(getAllCharacters());
  }, []);

  const handleAddTrait = useCallback(() => {
    if (traitInput.trim() && !traits.includes(traitInput.trim())) {
      setTraits([...traits, traitInput.trim()]);
      setTraitInput('');
    }
  }, [traitInput, traits]);

  const handleRemoveTrait = useCallback((trait: string) => {
    setTraits(traits.filter(t => t !== trait));
  }, [traits]);

  const handleGenerateCharacter = useCallback(async () => {
    if (!name.trim() || !outfit.trim()) {
      alert('Please fill in name and outfit fields');
      return;
    }

    setIsGenerating(true);
    try {
      const config: CharacterGenerationConfig = {
        name: name.trim(),
        age,
        gender,
        outfit: outfit.trim(),
        artStyle,
        traits,
      };

      const newCharacter = await createCharacter(config);
      setPreviewUrl(newCharacter.faceImageUrl);
      refreshCharacters();
      setIsCreating(false);
      
      // Reset form
      setName('');
      setAge(25);
      setGender('other');
      setOutfit('');
      setArtStyle('realistic');
      setTraits([]);
      setTraitInput('');
    } catch (error) {
      console.error('Failed to create character:', error);
      alert('Failed to create character. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [name, age, gender, outfit, artStyle, traits, refreshCharacters]);

  const handleDeleteCharacter = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this character?')) {
      deleteCharacter(id);
      refreshCharacters();
    }
  }, [refreshCharacters]);

  const handleSelectCharacter = useCallback((character: Character) => {
    onSelectCharacter?.(character);
  }, [onSelectCharacter]);

  const handleGenerateVariations = useCallback(async (characterId: string) => {
    const variations = ['happy', 'sad', 'angry', 'surprised', 'thoughtful'];
    try {
      await generateCharacterVariations(characterId, variations);
      alert('Variations generated successfully!');
    } catch (error) {
      console.error('Failed to generate variations:', error);
      alert('Failed to generate variations');
    }
  }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="text-violet-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Character Generator</h2>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-300 transition hover:bg-violet-500/20"
        >
          {isCreating ? <RefreshCw size={16} /> : <Plus size={16} />}
          {isCreating ? 'Cancel' : 'New Character'}
        </button>
      </div>

      {/* Character Creation Form */}
      {isCreating && (
        <div className="space-y-4 rounded-xl border border-white/[0.08] bg-obsidian/50 p-4 backdrop-blur">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Character Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Commander Shepard"
                className="w-full rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              />
            </div>

            {/* Age */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                min={1}
                max={150}
                className="w-full rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Art Style */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Art Style</label>
              <select
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value as any)}
                className="w-full rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              >
                <option value="realistic">Realistic Photo</option>
                <option value="anime">Anime Masterpiece</option>
                <option value="cinematic">Cinematic Movie</option>
                <option value="3d">3D Pixar Style</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
          </div>

          {/* Outfit */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Outfit / Clothing</label>
            <input
              type="text"
              value={outfit}
              onChange={(e) => setOutfit(e.target.value)}
              placeholder="e.g., futuristic space armor with glowing blue accents"
              className="w-full rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
            />
          </div>

          {/* Traits */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Character Traits</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={traitInput}
                onChange={(e) => setTraitInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTrait()}
                placeholder="e.g., brave, intelligent, mysterious"
                className="flex-1 rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              />
              <button
                onClick={handleAddTrait}
                className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-violet-300 transition hover:bg-violet-500/20"
              >
                <Plus size={16} />
              </button>
            </div>
            {traits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {traits.map((trait) => (
                  <span
                    key={trait}
                    className="flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-xs text-violet-300"
                  >
                    {trait}
                    <button
                      onClick={() => handleRemoveTrait(trait)}
                      className="hover:text-violet-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateCharacter}
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/20 px-4 py-3 text-sm font-medium text-violet-300 transition hover:bg-violet-500/30 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Generating Character...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Character
              </>
            )}
          </button>
        </div>
      )}

      {/* Character List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User size={48} className="mb-3 text-zinc-700" />
            <p className="text-sm text-zinc-500">No characters yet</p>
            <p className="text-xs text-zinc-600">Create your first character to get started</p>
          </div>
        ) : (
          characters.map((character) => (
            <div
              key={character.id}
              className={`group relative overflow-hidden rounded-xl border transition ${
                selectedCharacterId === character.id
                  ? 'border-violet-500/50 bg-violet-500/10'
                  : 'border-white/[0.08] bg-obsidian/30 hover:border-white/[0.12]'
              }`}
            >
              <div className="flex gap-3 p-3">
                {/* Character Image */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-onyx">
                  <img
                    src={character.faceImageUrl}
                    alt={character.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    <Sparkles size={8} className="text-yellow-400" />
                    {character.qualityScore}/10
                  </div>
                </div>

                {/* Character Info */}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <h3 className="truncate font-medium text-white">{character.name}</h3>
                    <p className="text-xs text-zinc-400">
                      {character.age} · {character.gender} · {character.artStyle}
                    </p>
                  </div>
                  <p className="truncate text-xs text-zinc-500">{character.outfit}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleSelectCharacter(character)}
                    className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-violet-400"
                    title="Select character"
                  >
                    <Camera size={14} />
                  </button>
                  <button
                    onClick={() => handleGenerateVariations(character.id)}
                    className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-violet-400"
                    title="Generate expressions"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteCharacter(character.id)}
                    className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-rose-400"
                    title="Delete character"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="rounded-lg border border-white/[0.04] bg-obsidian/30 px-3 py-2">
        <p className="text-[10px] text-zinc-500">
          Characters use FaceID + IP-Adapter for perfect consistency across all generators
        </p>
      </div>
    </div>
  );
}
