
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#3b1361', light: '#5e2b97' },
        accent: { DEFAULT: '#FFD700', dark: '#C7A500' },
        bg: '#0d0716',
        card: '#1b1030'
      },
      fontFamily: {
        display: ['ui-sans-serif','system-ui','Inter','Arial']
      }
    },
  },
  plugins: [],
}
