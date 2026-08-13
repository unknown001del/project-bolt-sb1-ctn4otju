/** Client-side canvas motion engine for the cinema player.
 *  Renders 2.5D parallax panning, Ken Burns zooming, screen shake,
 *  and layered particle effects over generated anime frames. */

import type { MotionType, ParticleType } from '@/types';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; rotation: number; vRot: number;
  opacity: number; life: number; maxLife: number;
  type: 'petal' | 'ember' | 'flare' | 'raindrop' | 'snowflake';
}

export class MotionEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement | null = null;
  private motion: MotionType = 'ken-burns-in';
  private particleType: ParticleType = 'none';
  private particles: Particle[] = [];
  private rafId = 0;
  private startTime = 0;
  private duration = 5000;
  private running = false;
  private dpr = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    this.ctx = ctx;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
  }

  setScene(imageUrl: string | null, motion: MotionType, particles: ParticleType, duration: number) {
    this.stop();
    this.motion = motion;
    this.particleType = particles;
    this.duration = duration;
    this.particles = [];

    if (imageUrl) {
      this.image = new Image();
      this.image.crossOrigin = 'anonymous';
      this.image.src = imageUrl;
    } else {
      this.image = null;
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = performance.now();
    this.resize();
    this.spawnInitialParticles();
    this.loop();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  private loop = () => {
    if (!this.running) return;
    const now = performance.now();
    const elapsed = now - this.startTime;
    const t = Math.min(1, elapsed / this.duration);

    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    this.ctx.clearRect(0, 0, w, h);

    // Draw background
    this.drawBackground(w, h, t);

    // Draw image with motion
    if (this.image && this.image.complete && this.image.naturalWidth > 0) {
      this.drawImageWithMotion(w, h, t);
    } else {
      this.drawPlaceholder(w, h, t);
    }

    // Draw particles
    this.updateAndDrawParticles(w, h);

    // Cinematic film grain overlay
    this.drawFilmGrain(w, h, now);

    // Letterbox bars
    this.drawLetterbox(w, h);

    this.rafId = requestAnimationFrame(this.loop);
  };

  private drawBackground(w: number, h: number, t: number) {
    // Subtle gradient that shifts with time
    const gradient = this.ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#0a0a0f');
    gradient.addColorStop(0.5, '#0d0d14');
    gradient.addColorStop(1, '#080810');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, w, h);
  }

  private drawImageWithMotion(w: number, h: number, t: number) {
    if (!this.image) return;
    const img = this.image;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = w / h;

    // Base dimensions to cover canvas
    let baseW: number, baseH: number;
    if (imgAspect > canvasAspect) {
      baseH = h;
      baseW = h * imgAspect;
    } else {
      baseW = w;
      baseH = w / imgAspect;
    }

    // Scale up 20% to allow panning room
    baseW *= 1.2;
    baseH *= 1.2;

    let dx = (w - baseW) / 2;
    let dy = (h - baseH) / 2;
    let scale = 1;

    const easedT = easeInOutCubic(t);

    switch (this.motion) {
      case 'ken-burns-in':
        scale = 1 + easedT * 0.15;
        dx = (w - baseW * scale) / 2;
        dy = (h - baseH * scale) / 2;
        break;
      case 'ken-burns-out':
        scale = 1.15 - easedT * 0.1;
        dx = (w - baseW * scale) / 2;
        dy = (h - baseH * scale) / 2;
        break;
      case 'pan-left':
        dx = (w - baseW) * (1 - easedT);
        dy = (h - baseH) / 2;
        break;
      case 'pan-right':
        dx = (w - baseW) * easedT;
        dy = (h - baseH) / 2;
        break;
      case 'pan-up':
        dx = (w - baseW) / 2;
        dy = (h - baseH) * (1 - easedT);
        break;
      case 'shake': {
        const intensity = 8;
        dx += Math.sin(t * Math.PI * 30) * intensity;
        dy += Math.cos(t * Math.PI * 25) * intensity * 0.5;
        scale = 1 + Math.sin(t * Math.PI * 10) * 0.02;
        dx = (w - baseW * scale) / 2 + (dx - (w - baseW) / 2);
        dy = (h - baseH * scale) / 2 + (dy - (h - baseH) / 2);
        break;
      }
      case 'static':
      default:
        // No motion
        break;
    }

    const drawW = baseW * scale;
    const drawH = baseH * scale;

    this.ctx.save();
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.drawImage(img, dx, dy, drawW, drawH);

    // Subtle vignette
    const vignette = this.ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.75);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.45)');
    this.ctx.fillStyle = vignette;
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.restore();
  }

  private drawPlaceholder(w: number, h: number, t: number) {
    this.ctx.save();
    const grad = this.ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#050507');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // Pulsing center
    const pulse = 0.5 + Math.sin(t * Math.PI * 4) * 0.3;
    this.ctx.fillStyle = `rgba(99, 102, 241, ${pulse * 0.15})`;
    this.ctx.beginPath();
    this.ctx.arc(w / 2, h / 2, 40, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private spawnInitialParticles() {
    if (this.particleType === 'none') return;
    const count = this.particleType === 'rain' ? 80 : 30;
    const rect = this.canvas.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(rect.width, rect.height));
    }
  }

  private createParticle(w: number, h: number): Particle {
    const type = this.particleTypeToKind();
    const p: Particle = {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0, vy: 0,
      size: 0, rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.05,
      opacity: 0, life: 0, maxLife: 0,
      type,
    };

    switch (type) {
      case 'petal':
        p.size = 4 + Math.random() * 6;
        p.vx = -0.3 - Math.random() * 0.5;
        p.vy = 0.5 + Math.random() * 1;
        p.opacity = 0.4 + Math.random() * 0.4;
        p.maxLife = 8000 + Math.random() * 4000;
        break;
      case 'ember':
        p.size = 1 + Math.random() * 3;
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = -0.5 - Math.random() * 1.5;
        p.opacity = 0.6 + Math.random() * 0.4;
        p.maxLife = 3000 + Math.random() * 2000;
        break;
      case 'flare':
        p.size = 30 + Math.random() * 60;
        p.vx = 0; p.vy = 0;
        p.opacity = 0.05 + Math.random() * 0.1;
        p.maxLife = 5000 + Math.random() * 3000;
        break;
      case 'raindrop':
        p.size = 1;
        p.vx = -1;
        p.vy = 8 + Math.random() * 4;
        p.opacity = 0.2 + Math.random() * 0.3;
        p.maxLife = 2000;
        break;
      case 'snowflake':
        p.size = 2 + Math.random() * 3;
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = 0.5 + Math.random() * 1;
        p.opacity = 0.3 + Math.random() * 0.4;
        p.maxLife = 8000 + Math.random() * 4000;
        break;
    }
    p.life = Math.random() * p.maxLife;
    return p;
  }

  private particleTypeToKind(): Particle['type'] {
    switch (this.particleType) {
      case 'cherry-blossom': return 'petal';
      case 'embers': return 'ember';
      case 'lens-flare': return 'flare';
      case 'rain': return 'raindrop';
      case 'snow': return 'snowflake';
      default: return 'petal';
    }
  }

  private updateAndDrawParticles(w: number, h: number) {
    if (this.particleType === 'none') return;
    const now = performance.now();
    const dt = 16;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;

      // Respawn if out of bounds or expired
      if (p.life >= p.maxLife || p.y > h + 20 || p.x < -20 || p.x > w + 20) {
        if (this.particles.length <= 100) {
          this.particles[i] = this.createParticle(w, h);
          this.particles[i].y = -10;
          this.particles[i].x = Math.random() * w;
        } else {
          this.particles.splice(i, 1);
        }
        continue;
      }

      // Fade in/out
      const lifeRatio = p.life / p.maxLife;
      let alpha = p.opacity;
      if (lifeRatio < 0.1) alpha *= lifeRatio / 0.1;
      else if (lifeRatio > 0.9) alpha *= (1 - lifeRatio) / 0.1;

      this.drawParticle(p, alpha, now);
    }
  }

  private drawParticle(p: Particle, alpha: number, now: number) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotation);

    switch (p.type) {
      case 'petal':
        this.ctx.fillStyle = '#fbcfe8';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'ember':
        this.ctx.fillStyle = '#fb923c';
        this.ctx.shadowColor = '#f97316';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'flare': {
        const pulse = 0.5 + Math.sin(now * 0.002 + p.x) * 0.3;
        const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, `rgba(168, 85, 247, ${pulse * 0.4})`);
        grad.addColorStop(0.5, `rgba(99, 102, 241, ${pulse * 0.15})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      }
      case 'raindrop':
        this.ctx.strokeStyle = 'rgba(165, 180, 252, 0.6)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-3, 12);
        this.ctx.stroke();
        break;
      case 'snowflake':
        this.ctx.fillStyle = '#e0e7ff';
        this.ctx.shadowColor = '#c7d2fe';
        this.ctx.shadowBlur = 4;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        break;
    }
    this.ctx.restore();
  }

  private drawFilmGrain(w: number, h: number, now: number) {
    // Subtle animated noise — very low opacity
    this.ctx.save();
    this.ctx.globalAlpha = 0.03;
    const noiseSize = 100;
    const grain = this.ctx.createImageData(noiseSize, noiseSize);
    for (let i = 0; i < grain.data.length; i += 4) {
      const v = Math.random() * 255;
      grain.data[i] = v; grain.data[i + 1] = v; grain.data[i + 2] = v;
      grain.data[i + 3] = 255;
    }
    // Use a temporary canvas for the noise pattern
    const tmp = document.createElement('canvas');
    tmp.width = noiseSize; tmp.height = noiseSize;
    tmp.getContext('2d')?.putImageData(grain, 0, 0);
    const pattern = this.ctx.createPattern(tmp, 'repeat');
    if (pattern) {
      this.ctx.fillStyle = pattern;
      this.ctx.fillRect(0, 0, w, h);
    }
    this.ctx.restore();
  }

  private drawLetterbox(w: number, h: number) {
    const barH = h * 0.06;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, w, barH);
    this.ctx.fillRect(0, h - barH, w, barH);
  }
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
