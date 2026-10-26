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
        fintech: {
          dark: '#0B0E14',
          card: '#121824',
          muted: '#1A2333',
          border: '#243046',
          emerald: '#10B981',
          emeraldDark: '#059669',
          rose: '#EF4444',
          accent: '#3B82F6',
          gold: '#F59E0B',
          crypto: '#8B5CF6'
        }
      }
    },
  },
  plugins: [],
}
