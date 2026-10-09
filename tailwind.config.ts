import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF4EE',
          100: '#FFE6D9',
          200: '#FFCBB3',
          300: '#FFA984',
          400: '#FF8F62',
          500: '#FF7A45',
          600: '#F0612A',
          700: '#C84B1C',
        },
        ink: '#1A1A1A',
        canvas: '#F5F5F3',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(26,26,26,0.04), 0 8px 24px -12px rgba(26,26,26,0.12)',
        glow: '0 1px 2px rgba(26,26,26,0.04), 0 12px 32px -12px rgba(255,122,69,0.35)',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 280ms ease-out both',
        pop: 'pop 420ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
