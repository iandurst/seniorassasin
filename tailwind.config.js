
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0612',
        primary: { DEFAULT: '#3b1361', light: '#5e2b97' },
        accent: { DEFAULT: '#FFD700', dark: '#C7A500' }
      }
    },
  },
  plugins: [],
}
