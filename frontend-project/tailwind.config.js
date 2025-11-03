/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'main-bg': 'var(--main-bg)',
        'main-text': 'var(--main-text)',
        'sub-text': 'var(--sub-text)',
        'blue-bg': 'var(--blue-bg)',
      },
    },
  },
  plugins: [],
}
