/** @type {import('tailwindcss').Config} */
const systemUi = [
  "-apple-system",
  "BlinkMacSystemFont",
  '"SF Pro Text"',
  '"Helvetica Neue"',
  "Helvetica",
  "Arial",
  "sans-serif",
].join(", ");

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [systemUi],
        display: [systemUi],
      },
      fontSize: {
        micro: ["0.75rem", { lineHeight: "1.33", letterSpacing: "-0.12px" }],
        caption: ["0.875rem", { lineHeight: "1.29", letterSpacing: "-0.224px" }],
        /** DESIGN.md body */
        body: ["1.0625rem", { lineHeight: "1.47", letterSpacing: "-0.0234em" }],
        /** Tile / section headings scale */
        "display-hero": [
          "3.5rem",
          { lineHeight: "1.07", letterSpacing: "-0.0175rem", fontWeight: "600" },
        ],
        "section-heading": ["2.5rem", { lineHeight: "1.1", fontWeight: "600" }],
        "tile-heading": ["1.75rem", { lineHeight: "1.14", letterSpacing: "0.01225rem", fontWeight: "400" }],
      },
      maxWidth: {
        /** Legacy alias; prefer .layout-container for fluid full-width layout */
        content: "min(100rem, 100% - 2rem)",
      },
      boxShadow: {
        "apple-card": "3px 5px 30px 0 rgba(0, 0, 0, 0.22)",
      },
      colors: {
        ink: { 950: "#1d1d1f", 900: "#1d1d1f", 800: "rgba(0, 0, 0, 0.8)" },
        accent: { DEFAULT: "#0071e3", hover: "#0077ed" },
        apple: {
          black: "#000000",
          gray: "#f5f5f7",
          nearBlack: "#1d1d1f",
          blue: "#0071e3",
          link: "#0066cc",
          linkDark: "#2997ff",
          focus: "#0071e3",
          filterBg: "#fafafc",
          filterBorder: "rgba(0, 0, 0, 0.04)",
          textSecondary: "rgba(0, 0, 0, 0.8)",
          textTertiary: "rgba(0, 0, 0, 0.48)",
          surface1: "#272729",
          surface2: "#262628",
          surface3: "#28282a",
          surface4: "#2a2a2d",
          surface5: "#242426",
        },
        moss: { DEFAULT: "#059669", light: "#34d399", deep: "#064e3b" },
      },
    },
  },
  plugins: [],
};
