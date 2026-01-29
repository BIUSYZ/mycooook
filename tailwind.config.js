/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B35", // Warm Orange
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#2C3E50", // Dark Gray
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#ECF0F1", // Light Gray
          foreground: "#64748B",
        },
        background: "#FFFFFF",
        foreground: "#2C3E50",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
