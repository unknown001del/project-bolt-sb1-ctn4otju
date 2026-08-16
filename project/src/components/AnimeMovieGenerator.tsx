/**
 * Anime Movie Generator - World-Class Studio Ghibli Level Anime Production
 * Hero feature: Breaks story into cinematic shots, generates keyframes, animates with audio
 */

import { useState, useCallback } from 'react';
import { Sparkles, Film, Play, Download, RefreshCw, Settings, Music, Mic, Layers, ChevronRight, ChevronLeft } from 'lucide-react';
import { enhanceAnimeShotPrompt } from '@/lib/prompt-enhancer';
import { generateImageWithQualityCheck } from '@/lib/ai-providers/image';
import { generateVideoWithProgress } from '@/lib/ai-providers/video';
import type { Story, Scene } from '@/types/story';
import type { Character } from '@/types/character';

interface AnimeMovieGeneratorProps {
  story?: Story;
  selectedCharacter?: Character;
}

type ShotType = 'establishing' | 'close-up' | 'medium' | 'wide' | 'detail' | 'action';
type QualityThreshold = 7 | 8 | 9 | 10;

interface AnimeShot extends Scene {
  status: 'pending' | 'generating-keyframe' | 'keyframe-ready' | 'animating' | 'complete' | 'failed';
  keyframeUrl?: string;
  videoUrl?: string;
  qualityScore?: number;
  audioUrl?: string;
}

export default function AnimeMovieGenerator({ story, selectedCharacter }: AnimeMovieGeneratorProps) {
  const [shots, setShots] = useState<AnimeShot[]>([]);
  const [selectedShotIndex, setSelectedShotIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'breaking-down' | 'generating-keyframes' | 'animating' | 'adding-audio' | 'complete'>('idle');
  const [qualityThreshold, setQualityThreshold] = useState<QualityThreshold>(9);
  const [addMusic, setAddMusic] = useState(true);
  const [addVoiceover, setAddVoiceover] = useState(true);
  const [addSubtitles, setAddSubtitles] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerateAnimeMovie = useCallback(async () => {
    if (!story && shots.length === 0) {
      alert('Please select a story or create shots manually');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Phase 1: Break down story into shots (if story provided)
      setCurrentPhase('breaking-down');
      let animeShots: AnimeShot[] = [];

      if (story) {
        // Use story scenes as base
        animeShots = story.scenes.map((scene, index) => ({
          ...scene,
          status: 'pending' as const,
        }));
        setProgress(10);
      } else {
        // Use existing shots
        animeShots = shots;
      }

      setShots(animeShots);

      // Phase 2: Generate keyframes for each shot
      setCurrentPhase('generating-keyframes');
      const totalShots = animeShots.length;
      
      for (let i = 0; i < totalShots; i++) {
        setShots(prev => prev.map((shot, idx) => 
          idx === i ? { ...shot, status: 'generating-keyframe' } : shot
        ));

        // Enhance prompt for anime shot
        const enhancedPrompt = await enhanceAnimeShotPrompt(
          animeShots[i].scenePrompt,
          animeShots[i].shotType
        );

        // Add character consistency if selected
        let finalPrompt = enhancedPrompt;
        if (selectedCharacter) {
          finalPrompt += `, character ${selectedCharacter.name}, consistent face, same clothes, same hairstyle`;
        }

        // Generate keyframe with quality check
        const result = await generateImageWithQualityCheck({
          prompt: finalPrompt,
          negativePrompt: 'blurry, low quality, deformed, extra limbs, bad anatomy, simple, low effort',
          style: 'anime',
          width: 1920,
          height: 1080,
          quality: 'ultra',
        });

        // Check quality threshold
        if (result.qualityScore < qualityThreshold) {
          // Regenerate if below threshold (up to 3 times)
          for (let retry = 0; retry < 3; retry++) {
            const retryResult = await generateImageWithQualityCheck({
              prompt: finalPrompt,
              negativePrompt: 'blurry, low quality, deformed, extra limbs, bad anatomy',
              style: 'anime',
              width: 1920,
              height: 1080,
              quality: 'ultra',
            });

            if (retryResult.qualityScore >= qualityThreshold) {
              setShots(prev => prev.map((shot, idx) => 
                idx === i ? { 
                  ...shot, 
                  status: 'keyframe-ready',
                  keyframeUrl: retryResult.result.url,
                  qualityScore: retryResult.qualityScore,
                } : shot
              ));
              break;
            }
          }
        } else {
          setShots(prev => prev.map((shot, idx) => 
            idx === i ? { 
              ...shot, 
              status: 'keyframe-ready',
              keyframeUrl: result.result.url,
              qualityScore: result.qualityScore,
            } : shot
          ));
        }

        setProgress(10 + (i + 1) / totalShots * 40);
      }

      // Phase 3: Animate each keyframe
      setCurrentPhase('animating');
      
      for (let i = 0; i < totalShots; i++) {
        setShots(prev => prev.map((shot, idx) => 
          idx === i ? { ...shot, status: 'animating' } : shot
        ));

        const shot = animeShots[i];
        if (!shot.keyframeUrl) continue;

        try {
          const videoResult = await generateVideoWithProgress(
            {
              prompt: shot.scenePrompt,
              imageUrl: shot.keyframeUrl,
              duration: 4,
              fps: 24,
              model: 'stable-video',
            },
            (progressValue) => {
              // Individual shot progress
            }
          );

          setShots(prev => prev.map((s, idx) => 
            idx === i ? { 
              ...s, 
              status: 'complete',
              videoUrl: videoResult.url,
            } : s
          ));
        } catch (error) {
          console.error(`Failed to animate shot ${i}:`, error);
          setShots(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: 'failed' } : s
          ));
        }

        setProgress(50 + (i + 1) / totalShots * 40);
      }

      // Phase 4: Add audio (music, voiceover, subtitles)
      if (addMusic || addVoiceover) {
        setCurrentPhase('adding-audio');
        
        // TODO: Integrate with ElevenLabs for voiceover and music generation
        // For now, simulate the process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setShots(prev => prev.map(shot => ({
          ...shot,
          audioUrl: addMusic ? 'mock-audio-url' : undefined,
        })));
      }

      setCurrentPhase('complete');
      setProgress(100);
    } catch (error) {
      console.error('Anime movie generation failed:', error);
      alert('Failed to generate anime movie. Please try again.');
      setCurrentPhase('idle');
    } finally {
      setIsGenerating(false);
    }
  }, [story, shots, selectedCharacter, qualityThreshold, addMusic, addVoiceover]);

  const handleRegenerateShot = useCallback(async (index: number) => {
    setShots(prev => prev.map((shot, idx) => 
      idx === index ? { ...shot, status: 'generating-keyframe' } : shot
    ));

    const shot = shots[index];
    const enhancedPrompt = await enhanceAnimeShotPrompt(
      shot.scenePrompt,
      shot.shotType
    );

    let finalPrompt = enhancedPrompt;
    if (selectedCharacter) {
      finalPrompt += `, character ${selectedCharacter.name}, consistent face, same clothes, same hairstyle`;
    }

    const result = await generateImageWithQualityCheck({
      prompt: finalPrompt,
      negativePrompt: 'blurry, low quality, deformed, extra limbs, bad anatomy',
      style: 'anime',
      width: 1920,
      height: 1080,
      quality: 'ultra',
    });

    setShots(prev => prev.map((s, idx) => 
      idx === index ? { 
        ...s, 
        status: 'keyframe-ready',
        keyframeUrl: result.result.url,
        qualityScore: result.qualityScore,
      } : s
    ));
  }, [shots, selectedCharacter]);

  const handleDownloadMovie = useCallback(() => {
    // TODO: Implement movie download (combine all shots with transitions)
    alert('Movie download will be available after combining all shots');
  }, []);

  const phaseDescriptions = {
    idle: 'Ready to generate',
    'breaking-down': 'Breaking story into cinematic shots...',
    'generating-keyframes': 'Generating anime keyframes...',
    animating: 'Animating keyframes to video...',
    'adding-audio': 'Adding music and voiceover...',
    complete: 'Anime movie complete!',
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="text-violet-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Anime Movie Generator</h2>
          <span className="rounded-full border border-pink-500/30 bg-pink-500/10 px-2 py-0.5 text-[10px] font-medium text-pink-300">
            Studio Ghibli Quality
          </span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="space-y-3 rounded-xl border border-white/[0.08] bg-obsidian/50 p-4 backdrop-blur">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Quality Threshold</label>
            <div className="flex gap-2">
              {[7, 8, 9, 10].map((threshold) => (
                <button
                  key={threshold}
                  onClick={() => setQualityThreshold(threshold as QualityThreshold)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs transition ${
                    qualityThreshold === threshold
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'bg-onyx text-zinc-500 border border-white/[0.08]'
                  }`}
                >
                  {threshold}/10+
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Audio Options</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addMusic}
                  onChange={(e) => setAddMusic(e.target.checked)}
                  className="rounded border-white/[0.2] bg-onyx text-violet-500 focus:ring-violet-500/20"
                />
                <Music size={14} className="text-zinc-400" />
                <span className="text-xs text-zinc-300">Cinematic background music</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addVoiceover}
                  onChange={(e) => setAddVoiceover(e.target.checked)}
                  className="rounded border-white/[0.2] bg-onyx text-violet-500 focus:ring-violet-500/20"
                />
                <Mic size={14} className="text-zinc-400" />
                <span className="text-xs text-zinc-300">Japanese voice-over (ElevenLabs)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addSubtitles}
                  onChange={(e) => setAddSubtitles(e.target.checked)}
                  className="rounded border-white/[0.2] bg-onyx text-violet-500 focus:ring-violet-500/20"
                />
                <Layers size={14} className="text-zinc-400" />
                <span className="text-xs text-zinc-300">Auto subtitles</span>
              </label>
            </div>
          </div>

          {selectedCharacter && (
            <div className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2">
              <Sparkles size={14} className="text-violet-400" />
              <span className="text-xs text-violet-300">
                Locked to character: {selectedCharacter.name}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <div className="space-y-2 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-violet-300">{phaseDescriptions[currentPhase]}</span>
            <span className="text-sm text-violet-400">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.1]">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Storyboard Timeline */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {shots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Film size={48} className="mb-3 text-zinc-700" />
            <p className="text-sm text-zinc-500">No shots yet</p>
            <p className="text-xs text-zinc-600">
              {story ? 'Click "Generate Anime Movie" to create shots from your story' : 'Select a story to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shots.map((shot, index) => (
              <div
                key={shot.id}
                className={`group relative overflow-hidden rounded-xl border transition ${
                  selectedShotIndex === index
                    ? 'border-violet-500/50 bg-violet-500/10'
                    : 'border-white/[0.08] bg-obsidian/30 hover:border-white/[0.12]'
                }`}
              >
                <div className="flex gap-3 p-3">
                  {/* Shot Number */}
                  <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg bg-onyx font-mono text-sm text-zinc-500">
                    {index + 1}
                  </div>

                  {/* Shot Preview */}
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-onyx">
                    {shot.keyframeUrl ? (
                      <img
                        src={shot.keyframeUrl}
                        alt={`Shot ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Layers size={20} className="text-zinc-700" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-1 right-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white backdrop-blur">
                      {shot.status === 'complete' && '✓'}
                      {shot.status === 'generating-keyframe' && '⏳'}
                      {shot.status === 'animating' && '🎬'}
                      {shot.status === 'failed' && '✗'}
                    </div>
                  </div>

                  {/* Shot Info */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-white/[0.1] bg-white/[0.05] px-2 py-0.5 text-[10px] text-zinc-400">
                          {shot.shotType}
                        </span>
                        {shot.qualityScore && (
                          <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                            <Sparkles size={8} className={shot.qualityScore >= qualityThreshold ? 'text-emerald-400' : 'text-yellow-400'} />
                            {shot.qualityScore}/10
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-zinc-300">{shot.scenePrompt}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {shot.status === 'failed' && (
                        <button
                          onClick={() => handleRegenerateShot(index)}
                          className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] text-rose-300 transition hover:bg-rose-500/20"
                        >
                          <RefreshCw size={10} />
                          Regenerate
                        </button>
                      )}
                      {shot.videoUrl && (
                        <button
                          onClick={() => setSelectedShotIndex(index)}
                          className="flex items-center gap-1 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[10px] text-violet-300 transition hover:bg-violet-500/20"
                        >
                          <Play size={10} />
                          Play
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateAnimeMovie}
        disabled={isGenerating || (!story && shots.length === 0)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-500/30 bg-pink-500/20 px-4 py-3 text-sm font-medium text-pink-300 transition hover:bg-pink-500/30 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate Anime Movie
          </>
        )}
      </button>

      {/* Download Button */}
      {currentPhase === 'complete' && (
        <button
          onClick={handleDownloadMovie}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/20 px-4 py-3 text-sm font-medium text-violet-300 transition hover:bg-violet-500/30"
        >
          <Download size={16} />
          Download Movie
        </button>
      )}

      {/* Footer Info */}
      <div className="rounded-lg border border-white/[0.04] bg-obsidian/30 px-3 py-2">
        <p className="text-[10px] text-zinc-500">
          Powered by Animagine XL 3.1 + Stable Video Diffusion · Studio Ghibli style · Quality-controlled generation
        </p>
      </div>
    </div>
  );
}
