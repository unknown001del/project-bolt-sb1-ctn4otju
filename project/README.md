# ALPHA STUDIO - World's Best AI Generation Platform

A premium AI generation suite featuring world-class models for images, videos, anime, characters, and stories. Built with quality as the #1 priority - better than Midjourney, Runway, and Pika combined.

## 🚀 Features

### 1. **AI Image Generator** - World Best Quality
- **Primary Models**: FLUX 1.1 Pro Ultra, Recraft V3
- **Fallback**: Stable Diffusion 3.5 Large Turbo
- **Features**:
  - Auto prompt enhancement for cinematic, professional results
  - Built-in 4K upscaling with Real-ESRGAN
  - Multiple styles: Realistic Photo, Anime Masterpiece, Cinematic Movie, 3D Pixar
  - Quality check with auto-regeneration (8/10 threshold)
  - Negative prompts for distortion-free results

### 2. **AI Video Generator** - Cinematic Motion
- **Primary Models**: Luma Dream Machine, Kling 2.0, Runway Gen-4 Turbo
- **Features**:
  - Image-to-video workflow for best quality
  - Camera controls: Static, Pan, Zoom, Orbit, Crane movements
  - Smooth 24fps motion with no warping
  - Real-time progress tracking with preview frames
  - Quality check with auto-retry

### 3. **AI Character Generator** - Consistency System
- **Features**:
  - Create consistent characters with FaceID + IP-Adapter
  - Character embedding for perfect consistency across all generators
  - Custom traits, outfits, and art styles
  - Expression variation generation
  - Character import/export

### 4. **Story Library** - Netflix-Style Experience
- **Features**:
  - AI story writing with GPT-4o
  - Novel-grade stories with chapters and world-building
  - Character auto-extraction from stories
  - Visual grid layout like Disney+/Netflix
  - One-click send to any generator
  - Genre filtering and search

### 5. **Anime Movie Generator** - Studio Ghibli Quality
- **Hero Feature** - Best anime generation in the world
- **Workflow**:
  1. LLM breaks story into 8-12 cinematic shots
  2. Generate keyframes with Animagine XL 3.1 / Niji 6
  3. Animate each shot with Luma/Kling
  4. Add cinematic music, Japanese voice-over (ElevenLabs), subtitles
- **Features**:
  - Storyboard timeline with shot-by-shot control
  - Quality threshold slider (7-10/10)
  - Regenerate individual shots
  - Character consistency locking
  - Smooth transitions

## 🎨 Premium Design

- **Glassmorphism UI** - Premium frosted glass effects
- **Ambient lighting** - Dynamic color glows (violet, cyan, pink)
- **Smooth animations** - 60fps transitions and micro-interactions
- **Dark theme** - Optimized for creative work
- **Responsive** - Works on all screen sizes

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, custom premium CSS
- **Icons**: Lucide React
- **AI Models**: Replicate API (FLUX, Recraft, SD 3.5, Luma, Kling, Runway)
- **LLM**: OpenAI GPT-4o for story generation and prompt enhancement
- **Voice**: ElevenLabs (optional)

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd project
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
VITE_REPLICATE_API_TOKEN=your_replicate_api_token_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here  # Optional
```

4. **Run the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
npm run preview
```

## 🔑 API Keys Required

### Required
- **Replicate API Token** - For FLUX, Recraft, SD 3.5, Luma, Kling, Runway
  - Get at: https://replicate.com/account/api-tokens

- **OpenAI API Key** - For GPT-4o story generation and prompt enhancement
  - Get at: https://platform.openai.com/api-keys

### Optional
- **ElevenLabs API Key** - For voice-over in anime movies
  - Get at: https://elevenlabs.io/app/settings/api-keys

## 📁 Project Structure

```
src/
├── components/
│   ├── Navigation.tsx          # Premium sidebar navigation
│   ├── CharacterGenerator.tsx  # Character creation UI
│   ├── ImageGenerator.tsx      # Image generation UI
│   ├── VideoGenerator.tsx      # Video generation UI
│   ├── StoryLibrary.tsx        # Story management UI
│   └── AnimeMovieGenerator.tsx # Anime movie production UI
├── lib/
│   ├── prompt-enhancer.ts      # AI prompt enhancement
│   ├── quality-check.ts        # Quality scoring and auto-retry
│   ├── ai-providers/
│   │   ├── image.ts           # FLUX/Recraft/SD integration
│   │   └── video.ts           # Luma/Kling/Runway integration
│   ├── character-service.ts    # Character management
│   └── story-service.ts       # Story management
├── types/
│   ├── character.ts            # Character types
│   └── story.ts               # Story types
├── App.tsx                     # Main application
└── index.css                   # Premium styling
```

## 🎯 Usage

### Creating a Character
1. Navigate to **Characters** tab
2. Click **New Character**
3. Fill in name, age, gender, outfit, art style
4. Add character traits
5. Click **Generate Character**
6. Use this character in any generator for consistency

### Generating Images
1. Navigate to **Image Generator** tab
2. Optionally select a character for consistency
3. Enter your prompt (e.g., "a samurai cat in ancient Japan")
4. Choose style and quality settings
5. Click **Generate Image**
6. Use **4K Upscale** for higher resolution

### Generating Videos
1. Navigate to **Video Generator** tab
2. Choose camera movement (Static, Pan, Zoom, etc.)
3. Enter your prompt or use image-to-video
4. Select motion strength and duration
5. Click **Generate Video**
6. Monitor real-time progress

### Creating Stories
1. Navigate to **Story Library** tab
2. Click **New Story**
3. Enter your story idea
4. Choose genre and length
5. Click **Generate Story**
6. Use **Generate Images/Video/Anime** buttons

### Producing Anime Movies
1. Navigate to **Anime Movie** tab
2. Select a story from Story Library
3. Optionally lock a character
4. Set quality threshold (9/10 recommended)
5. Enable music/voice-over/subtitles
6. Click **Generate Anime Movie**
7. Monitor storyboard timeline
8. Regenerate individual shots if needed

## 🔧 Configuration

### Quality Threshold
- Set in Anime Movie Generator
- 7/10: Fast, good quality
- 8/10: Balanced
- 9/10: High quality (recommended)
- 10/10: Maximum quality, slower

### Prompt Enhancement
Automatic enhancement adds:
- Technical keywords (8K, cinematic lighting, volumetric fog)
- Artist references (Artgerm, Greg Rutkowski)
- Style-specific modifiers
- Negative prompts for distortion prevention

### Character Consistency
Uses:
- FaceID embedding for face consistency
- IP-Adapter for style consistency
- Character traits injection
- Art style locking

## 🌟 Quality Features

### Auto-Regeneration
- If quality score < 8, automatically regenerates
- Up to 3 retry attempts
- Returns best result even if below threshold

### Real-Time Progress
- Video generation shows preview frames
- Percentage completion tracking
- Phase indicators (keyframes, animation, audio)

### Distortion Prevention
- Negative prompts: "blurry, low quality, deformed, extra limbs, bad anatomy"
- Face and hand quality checks
- Resolution verification

## 📝 Notes

- All API calls use Replicate for AI models
- Story generation uses OpenAI GPT-4o
- Character data stored in-memory (add Supabase for persistence)
- Environment variables must be set for full functionality
- Mock generation available when API keys missing

## 🚧 Future Enhancements

- Supabase integration for cloud storage
- Real-time collaboration
- Advanced video editing
- Custom model training
- Mobile app
- API access

## 📄 License

Proprietary - ALPHA STUDIO

## 🤝 Support

For issues and questions, please contact the development team.

---

**Built with ❤️ for world-class AI generation**
