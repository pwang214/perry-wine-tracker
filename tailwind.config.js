/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        wine: {
          50: '#fdf2f2',
          100: '#fce7e7',
          200: '#fbd0d0',
          300: '#f8a9a9',
          400: '#f27272',
          500: '#e94545',
          600: '#d62626',
          700: '#b31919',
          800: '#931818',
          900: '#7a1919',
          950: '#430a0a',
        }
      }
    },
  },
  plugins: [],
}