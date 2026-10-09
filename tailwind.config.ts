import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF3EE',
          100: '#FFE4D8',
          200: '#FFC8B0',
          300: '#FFA581',
          400: '#FE8C5E',
          500: '#FE7743',
          600: '#EE5E28',
          700: '#C4471A',
        },
        ink: '#1B2537',
        canvas: '#FAFAF8',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,37,55,0.04), 0 10px 30px -14px rgba(27,37,55,0.14)',
        glow: '0 1px 2px rgba(27,37,55,0.04), 0 14px 36px -14px rgba(254,119,67,0.45)',
        cta: '0 10px 28px -8px rgba(254,119,67,0.65)',
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
