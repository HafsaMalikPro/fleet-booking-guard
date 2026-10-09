import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FEF4EF',
          100: '#FDE6DB',
          200: '#FACCB6',
          300: '#F6AB8A',
          400: '#F39268',
          500: '#F07C4E',
          600: '#E0643A',
          700: '#B94D2B',
        },
        ink: '#1B2537',
        canvas: '#FAFAF8',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,37,55,0.04), 0 10px 30px -14px rgba(27,37,55,0.14)',
        glow: '0 1px 2px rgba(27,37,55,0.04), 0 14px 36px -14px rgba(240,124,78,0.45)',
        cta: '0 10px 28px -8px rgba(240,124,78,0.65)',
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
