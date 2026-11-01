/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Lora", "Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        primary: {
          50:  "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d6fe",
          300: "#a4bbfc",
          400: "#7c96f8",
          500: "#5c71f0",
          600: "#4550e4",
          700: "#3840ca",
          800: "#3037a3",
          900: "#2d3482",
          950: "#1c2051",
        },
        accent: {
          50:  "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#f0abfc",
          400: "#e879f9",
          500: "#d946ef",
          600: "#c026d3",
          700: "#a21caf",
          800: "#86198f",
          900: "#701a75",
        },
        surface: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.surface.700"),
            "h1,h2,h3,h4": { color: theme("colors.surface.900") },
            a: { color: theme("colors.primary.600") },
            code: { color: theme("colors.accent.700") },
          },
        },
        invert: {
          css: {
            color: theme("colors.surface.300"),
            "h1,h2,h3,h4": { color: theme("colors.surface.50") },
            a: { color: theme("colors.primary.400") },
          },
        },
      }),
      animation: {
        "fade-in":   "fadeIn 0.4s ease-out",
        "slide-up":  "slideUp 0.4s ease-out",
        "slide-down":"slideDown 0.3s ease-out",
        "scale-in":  "scaleIn 0.2s ease-out",
        shimmer:     "shimmer 1.5s infinite",
        float:       "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },                  to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideDown: { from: { opacity: 0, transform: "translateY(-10px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        scaleIn:   { from: { opacity: 0, transform: "scale(0.95)" }, to: { opacity: 1, transform: "scale(1)" } },
        shimmer:   { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        float:     { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
      },
      backdropBlur: { xs: "2px" },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(92,113,240,0.35)",
        "glow-accent":  "0 0 20px rgba(217,70,239,0.35)",
        "card":  "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.1), 0 12px 40px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
