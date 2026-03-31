/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'factory-bg': '#fcfcfd',
        'factory-indigo': '#4f46e5',
      },
      borderRadius: {
        'super': '2.5rem',
      }
    },
  },
  plugins: [],
}