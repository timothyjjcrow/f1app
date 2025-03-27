/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "fade-in-out": "fadeInOut 3s ease-in-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "slide-in": "slideIn 0.5s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
      },
      keyframes: {
        fadeInOut: {
          "0%": { opacity: 0, transform: "translateY(-10px)" },
          "10%": { opacity: 1, transform: "translateY(0)" },
          "80%": { opacity: 1, transform: "translateY(0)" },
          "100%": { opacity: 0, transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(59, 130, 246, 0)" },
          "50%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-20px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
      colors: {
        // F1 brand colors
        "f1-red": "#E10600",
        "f1-black": "#15151E",
        "f1-carbon": "#38383f",

        // Team colors
        team: {
          mercedes: "#00D2BE",
          "red-bull": "#0600EF",
          ferrari: "#DC0000",
          mclaren: "#FF8700",
          alpine: "#0090FF",
          "aston-martin": "#006F62",
          alphatauri: "#2B4562",
          "alfa-romeo": "#900000",
          williams: "#005AFF",
          haas: "#FFFFFF",
        },
      },
      borderRadius: {
        f1: "0.25rem",
      },
      fontFamily: {
        f1: ["Titillium Web", "sans-serif"],
      },
      boxShadow: {
        "f1-card":
          "0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
        "f1-glow": "0 0 15px rgba(59, 130, 246, 0.5)",
        "f1-inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        2000: "2000ms",
      },
    },
  },
  plugins: [],
  safelist: [
    // Ensure these team-specific dynamic classes are generated
    "text-team-mercedes",
    "text-team-red-bull",
    "text-team-ferrari",
    "text-team-mclaren",
    "text-team-alpine",
    "text-team-aston-martin",
    "text-team-alphatauri",
    "text-team-alfa-romeo",
    "text-team-williams",
    "text-team-haas",
    // Add bg- versions if needed
    "bg-team-mercedes",
    "bg-team-red-bull",
    "bg-team-ferrari",
    "bg-team-mclaren",
    "bg-team-alpine",
    "bg-team-aston-martin",
    "bg-team-alphatauri",
    "bg-team-alfa-romeo",
    "bg-team-williams",
    "bg-team-haas",
    // Animations
    "animate-pulse-glow",
    "animate-slide-in",
    "animate-scale-in",
  ],
};
