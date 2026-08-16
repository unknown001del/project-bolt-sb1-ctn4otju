/**
 * Image Generator - World-Class AI Image Generation
 * Uses FLUX 1.1 Pro Ultra / Recraft V3 with prompt enhancement and upscaling
 */

import { useState, useCallback } from 'react';
import { Sparkles, Image as ImageIcon, Download, RefreshCw, ZoomIn, Settings } from 'lucide-react';
import { enhancePrompt } from '@/lib/prompt-enhancer';
import { generateImageWithQualityCheck, upscaleImage } from '@/lib/ai-providers/image';
import type { Character } from '@/types/character';

interface ImageGeneratorProps {
  selectedCharacter?: Character;
}

type GenerationStyle = 'realistic' | 'anime' | 'cinematic' | '3d' | 'portrait' | 'landscape';
type GenerationQuality = 'standard' | 'high' | 'ultra';

export default function ImageGenerator({ selectedCharacter }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [style, setStyle] = useState<GenerationStyle>('realistic');
  const [quality, setQuality] = useState<GenerationQuality>('ultra');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [generationInfo, setGenerationInfo] = useState<{
    model: string;
    qualityScore: number;
    attempts: number;
    time: number;
  } | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);
    setUpscaledImage(null);
    setGenerationInfo(null);

    try {
      // Enhance prompt
      const enhancement = await enhancePrompt(prompt, {
        type: 'image',
        style,
        quality,
        addTechnical: true,
      });
      setEnhancedPrompt(enhancement.enhancedPrompt);

      // Inject character consistency if selected
      let finalPrompt = enhancement.enhancedPrompt;
      if (selectedCharacter) {
        finalPrompt += `, character ${selectedCharacter.name}, consistent face, same clothes, same hairstyle`;
      }

      const startTime = Date.now();

      // Generate with quality check
      const result = await generateImageWithQualityCheck({
        prompt: finalPrompt,
        negativePrompt: enhancement.negativePrompt,
        style,
        width: 1024,
        height: 1024,
        quality,
      });

      const generationTime = Date.now() - startTime;

      setGeneratedImage(result.result.url);
      setGenerationInfo({
        model: result.result.model,
        qualityScore: result.qualityScore,
        attempts: result.attempts,
        time: generationTime,
      });
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate image. Please check your API keys and try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, style, quality, selectedCharacter]);

  const handleUpscale = useCallback(async () => {
    if (!generatedImage) return;

    setIsUpscaling(true);
    try {
      const upscaled = await upscaleImage(generatedImage, 4);
      setUpscaledImage(upscaled);
    } catch (error) {
      console.error('Upscaling failed:', error);
      alert('Failed to upscale image. Please try again.');
    } finally {
      setIsUpscaling(false);
    }
  }, [generatedImage]);

  const handleDownload = useCallback((url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="text-violet-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Image Generator</h2>
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
          <div className="grid grid-cols-2 gap-4">
            {/* Style */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as GenerationStyle)}
                className="w-full rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              >
                <option value="realistic">Realistic Photo (RAW)</option>
                <option value="anime">Anime Masterpiece</option>
                <option value="cinematic">Cinematic Movie Still</option>
                <option value="3d">3D Pixar Style</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            {/* Quality */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Quality</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as GenerationQuality)}
                className="w-full rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              >
                <option value="standard">Standard</option>
                <option value="high">High</option>
                <option value="ultra">Ultra (8K)</option>
              </select>
            </div>
          </div>

          {/* Character Info */}
          {selectedCharacter && (
            <div className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2">
              <Sparkles size={14} className="text-violet-400" />
              <span className="text-xs text-violet-300">
                Using character: {selectedCharacter.name}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Prompt Input */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-400">Your Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your image... e.g., 'a samurai cat in ancient Japan'"
            rows={3}
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-obsidian/50 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 backdrop-blur"
          />
        </div>

        {/* Enhanced Prompt Preview */}
        {enhancedPrompt && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Enhanced Prompt (Auto)</label>
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-xs text-violet-300">
              {enhancedPrompt}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/20 px-4 py-3 text-sm font-medium text-violet-300 transition hover:bg-violet-500/30 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Image
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {(generatedImage || isGenerating) && (
        <div className="flex-1 space-y-3">
          {/* Image Preview */}
          <div className="relative aspect-square overflow-hidden rounded-xl border border-white/[0.08] bg-onyx">
            {isGenerating ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <RefreshCw size={32} className="mx-auto mb-2 animate-spin text-violet-400" />
                  <p className="text-sm text-zinc-500">Generating masterpiece...</p>
                </div>
              </div>
            ) : generatedImage ? (
              <>
                <img
                  src={upscaledImage || generatedImage}
                  alt="Generated"
                  className="h-full w-full object-cover"
                />
                {/* Actions Overlay */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(upscaledImage || generatedImage, 'generated-image.png')}
                      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur transition hover:bg-white/20"
                    >
                      <Download size={12} />
                      Download
                    </button>
                    {!upscaledImage && (
                      <button
                        onClick={handleUpscale}
                        disabled={isUpscaling}
                        className="flex items-center gap-1.5 rounded-lg bg-violet-500/30 px-3 py-1.5 text-xs text-violet-200 backdrop-blur transition hover:bg-violet-500/40 disabled:opacity-50"
                      >
                        <ZoomIn size={12} />
                        {isUpscaling ? 'Upscaling...' : '4K Upscale'}
                      </button>
                    )}
                  </div>
                  {generationInfo && (
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <span className="rounded bg-white/10 px-1.5 py-0.5">{generationInfo.model}</span>
                      <span className="flex items-center gap-1">
                        <Sparkles size={8} className="text-yellow-400" />
                        {generationInfo.qualityScore}/10
                      </span>
                      <span>{generationInfo.attempts} attempts</span>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Generation Info */}
          {generationInfo && (
            <div className="rounded-lg border border-white/[0.04] bg-obsidian/30 px-3 py-2">
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>Generated in {(generationInfo.time / 1000).toFixed(1)}s</span>
                <span>Auto-retry: {generationInfo.attempts > 1 ? 'Yes' : 'No'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="rounded-lg border border-white/[0.04] bg-obsidian/30 px-3 py-2">
        <p className="text-[10px] text-zinc-500">
          Powered by FLUX 1.1 Pro Ultra · Auto-enhanced prompts · Quality-checked generations
        </p>
      </div>
    </div>
  );
}
