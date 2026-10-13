/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#E11D48",
          hover: "#BE123C",
          light: "#FFE4E6",
        },
        darkBg: "#090D16",
        darkCard: "#1E293B",
        darkHeader: "#0F172A",
      },
    },
  },

  plugins: [],
};