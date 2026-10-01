/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--line)',
        text: 'var(--text)',
        'text-2': 'var(--text-2)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        water: 'var(--water)',
        risk: {
          low: 'var(--low)',
          mod: 'var(--mod)',
          high: 'var(--high)',
          crit: 'var(--crit)',
        },
        sos: 'var(--sos)',
      },
      fontFamily: {
        heading: ['Outfit', '"Space Grotesk"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '14px' }],
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['20px', { lineHeight: '28px' }],
        'xl': ['28px', { lineHeight: '36px' }],
        '2xl': ['44px', { lineHeight: '52px' }],
      },
      borderRadius: {
        panel: '16px',
        control: '12px',
        pill: '999px',
      },
      boxShadow: {
        calm: '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
        'calm-sm': '0 2px 10px -1px rgba(0, 0, 0, 0.15)',
        glow: '0 0 25px -5px rgba(127, 181, 176, 0.25)',
        'sos-glow': '0 0 25px -2px rgba(181, 72, 79, 0.4)',
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
