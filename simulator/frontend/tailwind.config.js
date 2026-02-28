/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['"Space Mono"', 'ui-monospace', 'monospace'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono:  ['"Space Mono"', 'ui-monospace', 'monospace'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        lavender: {
          50: '#f5f0ff',
          100: '#ede5ff',
          200: '#ddd0ff',
          300: '#c4b0ff',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        mint: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
        },
        peach: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
        },
        blush: {
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
        },
        sage: {
          50:  '#f0f7f4',
          100: '#daeee3',
          200: '#b6ddc8',
          300: '#88c4a5',
          400: '#58a67e',
          500: '#3d8a63',
          600: '#2e6e4f',
          700: '#265840',
        },
        forest: {
          50:  '#f2f6f5',
          100: '#d8eae3',
          200: '#b2d4c7',
          300: '#7db8a3',
          400: '#4e9b80',
          500: '#357e66',
          600: '#296552',
        },
      },
      backgroundImage: {
        'gradient-mind': 'linear-gradient(135deg, #f0f7f4 0%, #e0f0ea 50%, #d8ede6 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(240,248,244,0.72))',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(61, 138, 99, 0.10)',
        'soft-lg': '0 8px 40px rgba(61, 138, 99, 0.16)',
        glow: '0 0 30px rgba(61, 138, 99, 0.24)',
        warm: '0 8px 32px rgba(180, 83, 9, 0.22)',
        'warm-lg': '0 12px 48px rgba(180, 83, 9, 0.28)',
        card: '0 4px 16px rgba(0,0,0,0.08)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
