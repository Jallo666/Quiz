/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- importante per scansionare le classi nei file React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}