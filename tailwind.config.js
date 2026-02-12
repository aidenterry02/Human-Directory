/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2196F3',
        success: '#4CAF50',
        warning: '#ff6b6b',
      },
    },
  },
  plugins: [],
}
