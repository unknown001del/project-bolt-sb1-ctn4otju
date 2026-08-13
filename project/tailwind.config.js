/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        onyx: {
          DEFAULT: '#050507',
          50: '#0a0a0d',
          100: '#08080b',
          200: '#060608',
        },
        obsidian: {
          DEFAULT: '#0F0F12',
          50: '#15151a',
          100: '#131318',
          200: '#1a1a20',
          300: '#1e1e25',
        },
        alpha: {
          indigo: '#6366F1',
          violet: '#7c3aed',
          crimson: '#dc2626',
          glow: '#818cf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Zen Kaku Gothic New', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'splash-out': 'splashOut 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1s forwards',
        'logo-assemble': 'logoAssemble 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'border-glow': 'borderGlow 2s ease-in-out infinite',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scan-line': 'scanLine 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        splashOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(1.05)' },
        },
        logoAssemble: {
          '0%': { opacity: '0', transform: 'scale(0.3) rotate(-90deg)', filter: 'blur(8px)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1) rotate(5deg)', filter: 'blur(2px)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)', filter: 'blur(0px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3', filter: 'blur(8px)' },
          '50%': { opacity: '0.8', filter: 'blur(12px)' },
        },
        borderGlow: {
          '0%, 100%': { boxShadow: '0 0 8px 1px rgba(99, 102, 241, 0.3), inset 0 0 4px 1px rgba(99, 102, 241, 0.1)' },
          '50%': { boxShadow: '0 0 20px 3px rgba(99, 102, 241, 0.5), inset 0 0 8px 2px rgba(99, 102, 241, 0.2)' },
        },
        skeleton: {
          '0%, 100%': { opacity: '0.15' },
          '50%': { opacity: '0.35' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      transitionTimingFunction: {
        'elite': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
