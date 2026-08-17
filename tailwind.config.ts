import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        inter: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        void: "#0b0c0e",
        graphite: "#131416",
        charcoal: "#1f1f21",
        smoke: "#3c3d3e",
        steel: "#71717a",
        fog: "#858687",
        ash: "#9d9e9f",
        chalk: "#cececf",
        snow: "#ffffff",
        bone: "#f2f2f2",
        ink: "#333333",
        "signal-blue": "#3b82f6",
        "arc-blue": "#60a5fa",
        "ring-blue": "#93c5fd",
        mint: "#4ade80",
        fern: "#22c55e",
        coral: "#f87171",
        ember: "#ea580c",
        iris: "#314ef0",
      },
      borderRadius: {
        xs: "5.26px",
        sm: "8.77px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        pill: "10px",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 400ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
