/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue", 
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Helvetica Neue', 'Noto Sans JP', 'Arial', 'sans-serif']
      },
      colors: {
        'sky-start': '#87CEEB',
        'sky-end': '#E0F6FF'
      }
    },
  },
  plugins: [],
}