/**
 * Story Library - Netflix-Style UI with AI Story Writer
 * Professional story management with character integration and visual grid
 */

import { useState, useCallback } from 'react';
import { BookOpen, Plus, Sparkles, Film, Trash2, Play, Clock, Star, Search, Filter } from 'lucide-react';
import type { Story } from '@/types/story';
import { getAllStories, deleteStory, generateStory, extractCharactersFromStory } from '@/lib/story-service';
import type { Character } from '@/types/character';

interface StoryLibraryProps {
  onSelectStory?: (story: Story) => void;
  onSelectStoryForGeneration?: (story: Story, generator: 'image' | 'video' | 'anime') => void;
  characters?: Character[];
}

export default function StoryLibrary({ 
  onSelectStory, 
  onSelectStoryForGeneration,
  characters = []
}: StoryLibraryProps) {
  const [stories, setStories] = useState<Story[]>(getAllStories());
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  
  // Form state
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('fantasy');
  const [length, setLength] = useState<'short' | 'medium' | 'full'>('medium');

  const refreshStories = useCallback(() => {
    setStories(getAllStories());
  }, []);

  const handleGenerateStory = useCallback(async () => {
    if (!prompt.trim()) {
      alert('Please enter a story prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const newStory = await generateStory({
        prompt: prompt.trim(),
        genre,
        length,
      });

      // Auto-extract characters
      const extractedCharacters = await extractCharactersFromStory(newStory.id);
      
      setStories(getAllStories());
      setIsCreating(false);
      setPrompt('');
      
      // Show success
      alert(`Story "${newStory.title}" generated with ${newStory.scenes.length} scenes!`);
    } catch (error) {
      console.error('Failed to generate story:', error);
      alert('Failed to generate story. Please check your API keys and try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, genre, length]);

  const handleDeleteStory = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      deleteStory(id);
      refreshStories();
    }
  }, [refreshStories]);

  const handleSelectStory = useCallback((story: Story) => {
    setSelectedStory(story);
    onSelectStory?.(story);
  }, [onSelectStory]);

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = genreFilter === 'all' || story.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const genres = ['all', ...new Set(stories.map(s => s.genre))];

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="text-violet-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Story Library</h2>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-300 transition hover:bg-violet-500/20"
        >
          {isCreating ? <Plus size={16} className="rotate-45" /> : <Plus size={16} />}
          {isCreating ? 'Cancel' : 'New Story'}
        </button>
      </div>

      {/* Story Creation Form */}
      {isCreating && (
        <div className="space-y-4 rounded-xl border border-white/[0.08] bg-obsidian/50 p-4 backdrop-blur">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Story Idea</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'a boy who finds a dragon in modern Tokyo' or 'a detective solving crimes in a magical world'"
              rows={3}
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              >
                <option value="fantasy">Fantasy</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="romance">Romance</option>
                <option value="thriller">Thriller</option>
                <option value="horror">Horror</option>
                <option value="adventure">Adventure</option>
                <option value="mystery">Mystery</option>
                <option value="drama">Drama</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as any)}
                className="w-full rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              >
                <option value="short">Short (5-10 min)</option>
                <option value="medium">Medium (20-30 min)</option>
                <option value="full">Full (60+ min)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateStory}
            disabled={isGenerating || !prompt.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/20 px-4 py-3 text-sm font-medium text-violet-300 transition hover:bg-violet-500/30 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles size={16} className="animate-spin" />
                Writing Story...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Story
              </>
            )}
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories..."
            className="w-full rounded-lg border border-white/[0.08] bg-obsidian/50 pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
          />
        </div>
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="rounded-lg border border-white/[0.08] bg-obsidian/50 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
        >
          {genres.map(g => (
            <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Story Grid - Netflix Style */}
      <div className="flex-1 overflow-y-auto">
        {filteredStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen size={48} className="mb-3 text-zinc-700" />
            <p className="text-sm text-zinc-500">
              {stories.length === 0 ? 'No stories yet' : 'No stories match your search'}
            </p>
            <p className="text-xs text-zinc-600">
              {stories.length === 0 ? 'Generate your first story to get started' : 'Try a different search'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="group relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.08] bg-obsidian/50 transition hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/10"
              >
                {/* Cover Image */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80">
                  {story.coverImageUrl ? (
                    <img
                      src={story.coverImageUrl}
                      alt={story.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-900/20 to-cyan-900/20">
                      <Film size={48} className="text-zinc-700" />
                    </div>
                  )}
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <h3 className="truncate font-semibold text-white text-sm">{story.title}</h3>
                  <p className="line-clamp-2 text-xs text-zinc-400">{story.summary}</p>
                  
                  {/* Stats */}
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {story.scenes.length} scenes
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={10} className="text-yellow-400" />
                      {story.qualityScore}/10
                    </span>
                  </div>

                  {/* Actions on Hover */}
                  <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => handleSelectStory(story)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-violet-500/90 px-2 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-violet-500"
                    >
                      <Play size={12} />
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteStory(story.id)}
                      className="rounded-lg bg-rose-500/90 p-1.5 text-white backdrop-blur transition hover:bg-rose-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Genre Badge */}
                <div className="absolute top-2 right-2 rounded-full border border-white/[0.1] bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur">
                  {story.genre}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Story Detail */}
      {selectedStory && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 backdrop-blur">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white">{selectedStory.title}</h3>
              <p className="text-xs text-zinc-400">{selectedStory.genre} · {selectedStory.scenes.length} scenes</p>
            </div>
            <button
              onClick={() => setSelectedStory(null)}
              className="rounded-lg p-1 text-zinc-500 hover:bg-white/[0.06] hover:text-white"
            >
              ×
            </button>
          </div>

          <p className="mb-3 text-sm text-zinc-300 line-clamp-3">{selectedStory.summary}</p>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onSelectStoryForGeneration?.(selectedStory, 'image')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-300 transition hover:bg-violet-500/20"
            >
              <Sparkles size={12} />
              Generate Images
            </button>
            <button
              onClick={() => onSelectStoryForGeneration?.(selectedStory, 'video')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300 transition hover:bg-cyan-500/20"
            >
              <Film size={12} />
              Generate Video
            </button>
            <button
              onClick={() => onSelectStoryForGeneration?.(selectedStory, 'anime')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-pink-500/30 bg-pink-500/10 px-3 py-2 text-xs text-pink-300 transition hover:bg-pink-500/20"
            >
              <Sparkles size={12} />
              Anime Movie
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="rounded-lg border border-white/[0.04] bg-obsidian/30 px-3 py-2">
        <p className="text-[10px] text-zinc-500">
          AI-powered story writing with GPT-4o · Auto character extraction · One-click generation
        </p>
      </div>
    </div>
  );
}
