/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Young Serif', 'serif'],
        sans: ['Albert Sans', 'sans-serif'],
      },
      colors: {
        'legis-navy': '#060639',
        'legis-yellow': '#ffd387',
        'legis-cream': '#fff2e1',
        'legis-brown': '#9c6721',
      },
    },
  },
  plugins: [],
}

