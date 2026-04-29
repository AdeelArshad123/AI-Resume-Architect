import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0.75rem rgba(64, 156, 255, 0.28)"
      },
      colors: {
        deep: "#121212",
        electric: "#2F7BFF",
        lavender: "#B9A7FF"
      }
    }
  },
  plugins: []
} satisfies Config;

