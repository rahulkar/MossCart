/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        ink: { 950: "#0c0f14", 900: "#141922", 800: "#1e2430" },
        accent: { DEFAULT: "#0d9488", hover: "#0f766e" },
        moss: { DEFAULT: "#059669", light: "#34d399", deep: "#064e3b" },
      },
    },
  },
  plugins: [],
};
