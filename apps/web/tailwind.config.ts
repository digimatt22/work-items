import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#f8fafc",
        accent: "#1f7a8c",
        app: "#f7f8fc",
        surface: "#ffffff",
        line: "#e7eaf5",
        muted: "#667085",
        soft: "#a3add2",
        primary: "#5468ff",
        "primary-dark": "#3f51dc",
        "primary-soft": "#eef1ff",
        "blue-soft": "#f2f5ff",
        focus: "#5468ff"
      },
      boxShadow: {
        card: "0 18px 45px rgba(31, 42, 68, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
