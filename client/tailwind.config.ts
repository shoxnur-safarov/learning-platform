import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff', 100: '#d9e5ff', 500: '#3b82f6',
          600: '#2563eb', 700: '#1d4ed8', 900: '#1e3a8a'
        }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      animation: {
        'fade-in': 'fadeIn .6s ease-out',
        'slide-up': 'slideUp .6s ease-out',
        'float': 'float 6s ease-in-out infinite'
      },
            keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-15px)' } }
      }
    }
  },
  plugins: []
} satisfies Config;