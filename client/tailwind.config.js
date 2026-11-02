/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff8e1',
          100: '#ffecb3',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#ffca28',
          500: '#ffc107',
          600: '#e6a817',
          700: '#cc9400',
          800: '#b38000',
          900: '#996d00',
          950: '#7a5700',
        },
        brand: {
          gold: '#e6a817',
          dark: '#0d0d0d',
          darker: '#1a1a1a',
          card: '#222222',
          border: '#333333',
          muted: '#707070',
          light: '#a0a0a0',
        },
      },
      fontFamily: {
        display: ['Noto Sans SC', 'sans-serif'],
        body: ['Noto Sans SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.38, 0, 0, 1) forwards',
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.38, 0, 0, 1) forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.38, 0, 0, 1) forwards',
        'bounce-down': 'bounceDown 2s ease-in-out infinite',
        'number-count': 'numberCount 1.5s cubic-bezier(0.38, 0, 0, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(230, 168, 23, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(230, 168, 23, 0.6)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(60px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceDown: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(10px)' },
        },
      },
    },
  },
  plugins: [],
};