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
        fromex: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdeff',
          300: '#8eccff',
          400: '#58b0ff',
          500: '#0057b8', // Official primary
          600: '#00428b', // Official primary-dark
          700: '#00336d',
          800: '#002550',
          900: '#001938',
          teal: '#00b4a6', // Official secondary
          emerald: '#14b866', // Official accent
          light: '#f4f7f9',
          dark: '#0f172a',
          surfaceDark: '#1e293b',
          cardDark: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 87, 184, 0.12)',
        'glow': '0 0 20px rgba(0, 87, 184, 0.25)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
      }
    },
  },
  plugins: [],
}
