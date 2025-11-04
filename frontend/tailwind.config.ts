import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        'text-primary': '#EAEAEA',
        'text-secondary': '#B4B4B4',
        'acc-blue': '#8FC8FF',
        'acc-violet': '#C58AFF',
        'acc-rose': '#F59E0B',
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255,255,255,0.12)',
          'backdrop-filter': 'blur(12px)',
          'border-radius': '1rem',
          border: '1px solid rgba(255,255,255,0.2)',
        },
        '.glass-surface': {
          background: 'rgba(255,255,255,0.06)',
          'backdrop-filter': 'blur(12px)',
        },
        '.neon-edge': {
          'box-shadow': '0 0 8px rgba(197,138,255,0.3), 0 0 20px rgba(143,200,255,0.4)',
        },
        '.focus-ring': {
          '--tw-ring-color': 'rgba(197,138,255,0.5) !important',
          '--tw-ring-offset-shadow': '0 0 0 var(--tw-ring-offset-width, 0) var(--tw-ring-offset-color, #000) !important',
          '--tw-ring-shadow': '0 0 0 calc(2px + var(--tw-ring-offset-width, 0)) var(--tw-ring-color) !important',
          'box-shadow': 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000) !important',
          outline: 'none !important',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}

export default config
