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
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'acc-blue': 'rgb(var(--acc-blue) / <alpha-value>)',
        'acc-violet': 'rgb(var(--acc-violet) / <alpha-value>)',
        'acc-rose': 'rgb(var(--acc-rose) / <alpha-value>)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.glass': {
          background: 'var(--glass-bg)',
          'backdrop-filter': 'blur(18px)',
          'border-radius': '1rem',
          border: '1px solid var(--glass-border)',
          'box-shadow': 'var(--shadow-soft)',
          transition: 'background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease',
        },
        '.glass-surface': {
          background: 'var(--glass-surface-bg)',
          'backdrop-filter': 'blur(22px)',
          border: '1px solid var(--glass-border)',
          'box-shadow': 'var(--shadow-soft)',
          transition: 'background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease',
        },
        '.neon-edge': {
          'box-shadow': 'var(--shadow-glow)',
        },
        '.focus-ring': {
          '--tw-ring-color': 'var(--ring-accent) !important',
          '--tw-ring-offset-shadow': '0 0 0 var(--tw-ring-offset-width, 0) var(--tw-ring-offset-color, rgba(0,0,0,0)) !important',
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
