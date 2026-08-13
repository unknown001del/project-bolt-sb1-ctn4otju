// Text-to-Speech narration engine using the Web Speech API.
// Maps character voice profiles to system voices and speaks dialogue lines.

type VoiceType = 'narrator' | 'deep-male' | 'soft-male' | 'deep-female' | 'soft-female';

interface CharacterVoice {
  voice_type: VoiceType;
  voice_pitch: number;
  voice_rate: number;
}

interface NarrationSegment {
  speaker: string | null;
  text: string;
  characterVoice?: CharacterVoice;
}

export class TTSEngine {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private speaking = false;
  private queue: NarrationSegment[] = [];
  private currentUtter: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      this.synth.addEventListener('voiceschanged', () => this.loadVoices());
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  isSpeaking() { return this.speaking; }

  stop() {
    this.speaking = false;
    this.queue = [];
    this.currentUtter = null;
    if (this.synth) { try { this.synth.cancel(); } catch { /* ignore */ } }
  }

  pause() { if (this.synth) this.synth.pause(); }
  resume() { if (this.synth) this.synth.resume(); }

  static parseNarration(text: string): { speaker: string | null; text: string; isAction: boolean }[] {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    return lines.map((line) => {
      if (line.startsWith('[')) {
        return { speaker: null, text: line.replace(/[\[\]]/g, ''), isAction: true };
      }
      const match = line.match(/^([A-Z][A-Z_\s]+?):\s*(.+)$/);
      if (match) {
        const speaker = match[1].trim();
        return { speaker: speaker === 'NARRATOR' ? null : speaker, text: match[2].trim(), isAction: false };
      }
      return { speaker: null, text: line, isAction: false };
    });
  }

  async speakLines(
    lines: { speaker: string | null; text: string }[],
    onSegment?: (index: number, total: number, seg: { speaker: string | null; text: string }) => void,
  ) {
    if (!this.synth) return;
    this.stop();
    this.speaking = true;

    for (let i = 0; i < lines.length; i++) {
      if (!this.speaking) break;
      onSegment?.(i, lines.length, lines[i]);
      const isFemale = lines[i].speaker && /LYRA|NOVA|GIRL|WOMAN|FEM/i.test(lines[i].speaker!);
      const voice: CharacterVoice = isFemale
        ? { voice_type: 'soft-female', voice_pitch: 1.1, voice_rate: 0.95 }
        : lines[i].speaker
          ? { voice_type: 'deep-male', voice_pitch: 0.8, voice_rate: 0.95 }
          : { voice_type: 'narrator', voice_pitch: 0.9, voice_rate: 0.92 };
      await this.speakOne(lines[i].text, voice);
    }
    this.speaking = false;
  }

  private pickVoice(type: VoiceType): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) this.loadVoices();
    if (this.voices.length === 0) return null;
    const en = this.voices.filter((v) => v.lang.startsWith('en'));
    const pool = en.length > 0 ? en : this.voices;
    const maleNames = ['daniel', 'alex', 'fred', 'george', 'david', 'mark', 'james', 'arthur'];
    const femaleNames = ['samantha', 'victoria', 'karen', 'susan', 'zira', 'fiona', 'moira', 'tessa'];

    switch (type) {
      case 'deep-male': return pool.find((v) => maleNames.some((n) => v.name.toLowerCase().includes(n))) ?? pool[0];
      case 'soft-male': return pool.find((v) => maleNames.some((n) => v.name.toLowerCase().includes(n))) ?? pool[0];
      case 'deep-female': return pool.find((v) => femaleNames.some((n) => v.name.toLowerCase().includes(n))) ?? pool[0];
      case 'soft-female': return pool.find((v) => femaleNames.some((n) => v.name.toLowerCase().includes(n))) ?? pool[0];
      case 'narrator': return pool.find((v) => maleNames.some((n) => v.name.toLowerCase().includes(n))) ?? pool[0];
      default: return pool[0];
    }
  }

  private speakOne(text: string, voice: CharacterVoice): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) { resolve(); return; }
      const u = new SpeechSynthesisUtterance(text);
      const v = this.pickVoice(voice.voice_type);
      if (v) u.voice = v;
      u.pitch = Math.max(0, Math.min(2, voice.voice_pitch));
      u.rate = Math.max(0.1, Math.min(2, voice.voice_rate));
      u.volume = 0.9;
      this.currentUtter = u;
      u.onend = () => { this.currentUtter = null; resolve(); };
      u.onerror = () => { this.currentUtter = null; resolve(); };
      this.synth.speak(u);
    });
  }
}

export const ttsEngine = new TTSEngine();
