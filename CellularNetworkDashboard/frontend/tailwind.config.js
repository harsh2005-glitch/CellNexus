/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        primary: {
          500: '#3B82F6',
          400: '#60A5FA',
        },
        accent: {
          cyan: '#06B6D4',
          indigo: '#6366F1'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
