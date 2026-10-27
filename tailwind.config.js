/** @type {import('tailwindcss').Config} */
module.exports = {
  // Configures NativeWind v4 colorScheme support for dark mode toggle later
  darkMode: "class",

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
        // Customer Primary Palette (Red)
        brand: {
          DEFAULT: "#E11D48",
          hover: "#BE123C",
          light: "#FFE4E6",
        },

        // Rider Primary Palette (Sky Blue)
        rider: {
          DEFAULT: "#0284C7",
          hover: "#0369A1",
          light: "#E0F2FE",
        },

        // Status & Escrow Alerts
        status: {
          success: "#10B981", // Emerald green for escrow secured / PIN verified
          warning: "#F59E0B", // Amber for running market timers
          danger: "#EF4444",  // Red for cancellations / disputes
        },

        // Dark Mode Surfaces
        darkBg: "#090D16",
        darkCard: "#1E293B",
        darkHeader: "#0F172A",
        darkBorder: "#334155",

        // Light Mode Surfaces
        lightBg: "#F8FAFC",
        lightCard: "#FFFFFF",
        lightBorder: "#E2E8F0",
      },
    },
  },

  plugins: [],
};