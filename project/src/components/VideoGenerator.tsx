/**
 * Video Generator - World-Class AI Video Generation
 * Uses Luma Dream Machine + Kling 2.0 + Runway Gen-4 Turbo with camera controls
 */

import { useState, useCallback } from 'react';
import { Sparkles, Video, Download, RefreshCw, Play, Settings, Camera, Move3D } from 'lucide-react';
import { enhancePrompt, enhanceVideoPrompt } from '@/lib/prompt-enhancer';
import { generateVideoWithProgress, generateVideoFromImage } from '@/lib/ai-providers/video';
import type { Character } from '@/types/character';

interface VideoGeneratorProps {
  selectedCharacter?: Character;
}

type CameraMovement = 'static' | 'pan-left' | 'pan-right' | 'zoom-in' | 'zoom-out' | 'orbit' | 'crane-up' | 'crane-down';
type MotionStrength = 'low' | 'medium' | 'high';
type VideoModel = 'luma' | 'kling' | 'runway' | 'stable-video';

export default function VideoGenerator({ selectedCharacter }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [cameraMovement, setCameraMovement] = useState<CameraMovement>('static');
  const [motionStrength, setMotionStrength] = useState<MotionStrength>('medium');
  const [duration, setDuration] = useState(5);
  const [model, setModel] = useState<VideoModel>('luma');
  const [useImageToVideo, setUseImageToVideo] = useState(false);
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [generationInfo, setGenerationInfo] = useState<{
    model: string;
    duration: number;
    fps: number;
    time: number;
  } | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setProgress(0);
    setPreviewFrame(null);
    setGeneratedVideo(null);
    setGenerationInfo(null);

    try {
      // Enhance prompt with camera movement
      const enhancement = await enhancePrompt(prompt, {
        type: 'video',
        addTechnical: true,
      });
      
      const cameraEnhanced = await enhanceVideoPrompt(enhancement.enhancedPrompt, cameraMovement);
      setEnhancedPrompt(cameraEnhanced);

      // Inject character consistency if selected
      let finalPrompt = cameraEnhanced;
      if (selectedCharacter) {
        finalPrompt += `, character ${selectedCharacter.name}, consistent face, same clothes, same hairstyle`;
      }

      const startTime = Date.now();

      let result;
      if (useImageToVideo && referenceImageUrl) {
        // Image-to-video workflow
        result = await generateVideoFromImage(referenceImageUrl, finalPrompt, {
          prompt: finalPrompt,
          duration,
          fps: 24,
          cameraMovement,
          motionStrength,
          model,
        });
      } else {
        // Text-to-video workflow with progress tracking
        result = await generateVideoWithProgress(
          {
            prompt: finalPrompt,
            negativePrompt: enhancement.negativePrompt,
            duration,
            fps: 24,
            cameraMovement,
            motionStrength,
            model,
          },
          (progressValue, frame) => {
            setProgress(progressValue);
            if (frame) setPreviewFrame(frame);
          }
        );
      }

      const generationTime = Date.now() - startTime;

      setGeneratedVideo(result.url);
      setGenerationInfo({
        model: result.model,
        duration: result.duration,
        fps: result.fps,
        time: generationTime,
      });
      setProgress(100);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate video. Please check your API keys and try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, cameraMovement, motionStrength, duration, model, useImageToVideo, referenceImageUrl, selectedCharacter]);

  const handleDownload = useCallback(() => {
    if (!generatedVideo) return;
    const link = document.createElement('a');
    link.href = generatedVideo;
    link.download = 'generated-video.mp4';
    link.click();
  }, [generatedVideo]);

  const cameraOptions = [
    { value: 'static', label: 'Static', icon: Camera },
    { value: 'pan-left', label: 'Pan Left', icon: Move3D },
    { value: 'pan-right', label: 'Pan Right', icon: Move3D },
    { value: 'zoom-in', label: 'Zoom In', icon: Camera },
    { value: 'zoom-out', label: 'Zoom Out', icon: Camera },
    { value: 'orbit', label: 'Orbit', icon: Move3D },
    { value: 'crane-up', label: 'Crane Up', icon: Camera },
    { value: 'crane-down', label: 'Crane Down', icon: Camera },
  ] as const;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="text-violet-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Video Generator</h2>
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
            {/* Model */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">AI Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as VideoModel)}
                className="w-full rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              >
                <option value="stable-video">Stable Video Diffusion (Free)</option>
                <option value="luma">Luma Dream Machine</option>
                <option value="kling">Kling 2.0</option>
                <option value="runway">Runway Gen-4 Turbo</option>
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              >
                <option value={3}>3 seconds</option>
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
              </select>
            </div>

            {/* Motion Strength */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Motion Strength</label>
              <select
                value={motionStrength}
                onChange={(e) => setMotionStrength(e.target.value as MotionStrength)}
                className="w-full rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Image-to-Video Toggle */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setUseImageToVideo(false)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs transition ${
                    !useImageToVideo
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'bg-onyx text-zinc-500 border border-white/[0.08]'
                  }`}
                >
                  Text to Video
                </button>
                <button
                  onClick={() => setUseImageToVideo(true)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs transition ${
                    useImageToVideo
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'bg-onyx text-zinc-500 border border-white/[0.08]'
                  }`}
                >
                  Image to Video
                </button>
              </div>
            </div>
          </div>

          {/* Reference Image for Image-to-Video */}
          {useImageToVideo && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Reference Image URL</label>
              <input
                type="text"
                value={referenceImageUrl}
                onChange={(e) => setReferenceImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-white/[0.08] bg-onyx px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              />
            </div>
          )}

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

      {/* Camera Controls */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400">Camera Movement</label>
        <div className="grid grid-cols-4 gap-2">
          {cameraOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setCameraMovement(option.value)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition ${
                  cameraMovement === option.value
                    ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                    : 'border-white/[0.08] bg-obsidian/30 text-zinc-500 hover:border-white/[0.12]'
                }`}
              >
                <Icon size={16} />
                <span className="text-[10px]">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-400">Your Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your video... e.g., 'a samurai cat walking through ancient Japan at sunset'"
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
          disabled={isGenerating || !prompt.trim() || (useImageToVideo && !referenceImageUrl)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/20 px-4 py-3 text-sm font-medium text-violet-300 transition hover:bg-violet-500/30 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Generating Video... {progress}%
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Video
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {(generatedVideo || isGenerating) && (
        <div className="flex-1 space-y-3">
          {/* Video Preview */}
          <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.08] bg-onyx">
            {isGenerating ? (
              <div className="flex h-full flex-col items-center justify-center">
                {previewFrame ? (
                  <img
                    src={previewFrame}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <RefreshCw size={32} className="mx-auto mb-2 animate-spin text-violet-400" />
                    <p className="text-sm text-zinc-500">Generating video...</p>
                    <p className="text-xs text-zinc-600">{progress}% complete</p>
                  </div>
                )}
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.1]">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : generatedVideo ? (
              <>
                <video
                  src={generatedVideo}
                  controls
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                />
                {/* Actions Overlay */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-3">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur transition hover:bg-white/20"
                  >
                    <Download size={12} />
                    Download
                  </button>
                  {generationInfo && (
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <span className="rounded bg-white/10 px-1.5 py-0.5">{generationInfo.model}</span>
                      <span>{generationInfo.duration}s @ {generationInfo.fps}fps</span>
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
                <span>Camera: {cameraMovement}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="rounded-lg border border-white/[0.04] bg-obsidian/30 px-3 py-2">
        <p className="text-[10px] text-zinc-500">
          Powered by Hugging Face Stable Video Diffusion · Smooth 24fps motion · Camera controls
        </p>
      </div>
    </div>
  );
}
