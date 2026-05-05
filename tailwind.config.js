/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#08080f',
          secondary: '#0f0f1a',
          tertiary: '#141422',
          panel: '#1a1a2e',
        },
        accent: {
          violet: '#7c6fff',
          violet2: '#a78bfa',
          green: '#22d3a0',
          red: '#f87171',
          amber: '#fbbf24',
          blue: '#60a5fa',
        },
        border: {
          dim: 'rgba(255,255,255,0.06)',
          mid: 'rgba(255,255,255,0.1)',
          bright: 'rgba(255,255,255,0.18)',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        glow: {
          from: { boxShadow: '0 0 10px rgba(124,111,255,0.3)' },
          to: { boxShadow: '0 0 24px rgba(124,111,255,0.6)' }
        }
      }
    },
  },
  plugins: [],
}
