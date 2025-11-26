import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563eb' },
        accent: { DEFAULT: '#06b6d4' },
      },
      fontFamily: {
        // Jadikan Montserrat sebagai sans default
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'],
      },
      keyframes: {
        blob: {
          '0%':   { transform: 'translate(0px, 0px) scale(1)' },
          '33%':  { transform: 'translate(20px, -30px) scale(1.05)' },
          '66%':  { transform: 'translate(-10px, 20px) scale(0.97)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%':   { transform: 'translateY(0px)' },
          '50%':  { transform: 'translateY(-8px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' }
        },
        glowText: {
          '0%':   { textShadow: '0 0 0 rgba(37,99,235,0.0)' },
          '50%':  { textShadow: '0 0 12px rgba(37,99,235,0.45)' },
          '100%': { textShadow: '0 0 0 rgba(37,99,235,0.0)' }
        }
      },
      animation: {
        blob: 'blob 12s ease-in-out infinite',
        'blob-delayed': 'blob 14s ease-in-out infinite 1s',
        'blob-slow': 'blob 18s ease-in-out infinite 2s',
        float: 'float 4s ease-in-out infinite',
        fadeIn: 'fadeIn 600ms ease-out both',
        shimmer: 'shimmer 3.5s linear infinite',
        glowText: 'glowText 3s ease-in-out infinite'
      },
      boxShadow: {
        glass: '0 10px 30px -12px rgba(37, 99, 235, 0.25)',
      }
    },
  },
  plugins: [],
} satisfies Config
