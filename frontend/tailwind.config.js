/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          50:  "#EFF6FF",
          100: "#DBEAFE",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        accent: {
          DEFAULT: "#38BDF8",
          400: "#38BDF8",
          500: "#0EA5E9",
        },
        bg: {
          DEFAULT: "#0F172A",
          secondary: "#1E293B",
          tertiary:  "#334155",
        },
        card: "#1E293B",
        success:  "#22C55E",
        danger:   "#EF4444",
        warning:  "#F59E0B",
        muted:    "#CBD5E1",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial":    "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":      "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
        "card-gradient":      "linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))",
        "primary-gradient":   "linear-gradient(135deg, #2563EB, #38BDF8)",
        "success-gradient":   "linear-gradient(135deg, #16A34A, #22C55E)",
        "danger-gradient":    "linear-gradient(135deg, #DC2626, #EF4444)",
        "warning-gradient":   "linear-gradient(135deg, #D97706, #F59E0B)",
      },
      animation: {
        "fade-in":     "fadeIn 0.5s ease-in-out",
        "slide-up":    "slideUp 0.4s ease-out",
        "slide-in":    "slideIn 0.3s ease-out",
        "pulse-slow":  "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow":   "spin 3s linear infinite",
        "counter":     "counter 1s ease-out",
        "shimmer":     "shimmer 2s infinite",
        "glow":        "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(20px)" },
                   to:   { opacity: "1", transform: "translateY(0)" } },
        slideIn: { from: { opacity: "0", transform: "translateX(-20px)" },
                   to:   { opacity: "1", transform: "translateX(0)" } },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glow: {
          from: { boxShadow: "0 0 10px rgba(37,99,235,0.3)" },
          to:   { boxShadow: "0 0 20px rgba(56,189,248,0.6)" },
        },
      },
      boxShadow: {
        "card":   "0 4px 24px rgba(0,0,0,0.4)",
        "glow":   "0 0 20px rgba(37,99,235,0.4)",
        "accent": "0 0 20px rgba(56,189,248,0.4)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.1)",
      },
      backdropBlur: { xs: "2px" },
      borderRadius: { "2xl": "1rem", "3xl": "1.5rem" },
    },
  },
  plugins: [],
};
