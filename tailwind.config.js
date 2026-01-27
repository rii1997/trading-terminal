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
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#1a1a1a',
        'bg-tertiary': '#252525',
        'border': '#333333',
        'text-primary': '#ffffff',
        'text-secondary': '#888888',
        'accent-green': '#00c853',
        'accent-red': '#ff5252',
        'accent-blue': '#4dabf7',
        'accent-orange': '#ffa726',
        'accent-yellow': '#ffc107',
        'accent-purple': '#a855f7',
        'accent-cyan': '#22d3ee',
      },
      fontFamily: {
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', 'monospace'],
      },
    },
  },
  plugins: [],
}
