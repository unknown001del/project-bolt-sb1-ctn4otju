/**
 * Alpha Studio - World-Class AI Generation Platform
 * Main application with routing to all generators
 */

import { useState, useCallback } from 'react';
import Navigation, { NavigationTab } from '@/components/Navigation';
import CharacterGenerator from '@/components/CharacterGenerator';
import ImageGenerator from '@/components/ImageGenerator';
import VideoGenerator from '@/components/VideoGenerator';
import StoryLibrary from '@/components/StoryLibrary';
import AnimeMovieGenerator from '@/components/AnimeMovieGenerator';
import type { Character } from '@/types/character';
import type { Story } from '@/types/story';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('characters');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | undefined>();
  const [selectedStory, setSelectedStory] = useState<Story | undefined>();

  const handleTabChange = useCallback((tab: NavigationTab) => {
    setActiveTab(tab);
  }, []);

  const handleSelectCharacter = useCallback((character: Character) => {
    setSelectedCharacter(character);
  }, []);

  const handleSelectStory = useCallback((story: Story) => {
    setSelectedStory(story);
  }, []);

  const handleStoryForGeneration = useCallback((story: Story, generator: 'image' | 'video' | 'anime') => {
    setSelectedStory(story);
    if (generator === 'image') setActiveTab('image');
    if (generator === 'video') setActiveTab('video');
    if (generator === 'anime') setActiveTab('anime');
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-onyx text-zinc-100">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-600/5 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-600/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-600/5 blur-3xl" />
      </div>

      {/* Main Layout */}
      <div className="relative flex h-full">
        {/* Navigation Sidebar */}
        <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Content Area */}
        <main className="flex-1 overflow-hidden p-6">
          {activeTab === 'characters' && (
            <CharacterGenerator
              onSelectCharacter={handleSelectCharacter}
              selectedCharacterId={selectedCharacter?.id}
            />
          )}
          {activeTab === 'image' && (
            <ImageGenerator selectedCharacter={selectedCharacter} />
          )}
          {activeTab === 'video' && (
            <VideoGenerator selectedCharacter={selectedCharacter} />
          )}
          {activeTab === 'stories' && (
            <StoryLibrary
              onSelectStory={handleSelectStory}
              onSelectStoryForGeneration={handleStoryForGeneration}
              characters={selectedCharacter ? [selectedCharacter] : []}
            />
          )}
          {activeTab === 'anime' && (
            <AnimeMovieGenerator
              story={selectedStory}
              selectedCharacter={selectedCharacter}
            />
          )}
        </main>
      </div>
    </div>
  );
}
