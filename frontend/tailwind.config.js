/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deere: {
          green: "#367C2B",
          yellow: "#FFDE00",
          darkGreen: "#275C20",
        },
      },
    },
  },
  plugins: [],
};
