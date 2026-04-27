/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: '#10b981',
          hover: '#059669',
          glow: 'rgba(16,185,129,0.2)',
          dim: 'rgba(16,185,129,0.1)',
        },
        surface: 'rgba(255,255,255,0.05)',
        'surface-hover': 'rgba(255,255,255,0.08)',
        border: 'rgba(255,255,255,0.08)',
      },
      backdropBlur: {
        glass: '20px',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 12s ease-in-out infinite reverse',
        'pulse-emerald': 'pulse-emerald 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '33%': { transform: 'translateY(-30px) translateX(20px)' },
          '66%': { transform: 'translateY(20px) translateX(-15px)' },
        },
        'pulse-emerald': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.2)' },
          '50%': { boxShadow: '0 0 40px 10px rgba(16,185,129,0.1)' },
        },
      },
    },
  },
  plugins: [],
}
