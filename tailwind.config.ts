import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Legacy aliases (keep for backward compat) ────────────────────────
        "mindfire-text-red": "#F81F1F",
        "mindfire-text-black": "#3A3D41",
        "mindfire-footer-border-color": "#EFF0F1",
        "mindfire-footer-text-color": "#819198",
        "mindfire-content-p-text-color": "#7F8082",

        // ─── New canonical brand tokens ───────────────────────────────────────
        "mf-red": "#F81F1F",
        "mf-dark": "#3A3D41",
        "mf-light-grey": "#7F8082",

        // ─── Semantic surfaces (new — use these going forward) ────────────────
        "mf-bg": "#FFFFFF",
        "mf-bg-subtle": "#F8F9FA", // replaces bg-slate-50 throughout the app
        "mf-border": "#EFF0F1", // replaces the footer border color alias
        "mf-border-soft": "#E5E7EB",

        // ─── Interactive / state colours ──────────────────────────────────────
        "mf-red-hover": "#D91818",
        "mf-red-subtle": "#FEF2F2", // bg-red-50 equivalent, branded
        "mf-red-border": "#FECACA", // border-red-200 equivalent, branded

        // ─── Footer ───────────────────────────────────────────────────────────
        "mf-footer-text": "#819198",
      },

      // ─── Font families ───────────────────────────────────────────────────────
      fontFamily: {
        // Roboto is already loaded in layout.tsx — expose it here so components
        // can reference font-roboto explicitly if needed.
        roboto: ["Roboto", "sans-serif"],
        // Nunito Sans woff2 files are already declared in globals.css — wire it up.
        nunito: ["Nunito Sans", "sans-serif"],
      },

      // ─── Font sizes ──────────────────────────────────────────────────────────
      fontSize: {
        "5.5xl": "3.25rem",
      },

      // ─── Gradients ───────────────────────────────────────────────────────────
      // Used for: progress bars, avatar rings, monorepo badges, score bars, etc.
      // Define the stop values here so we don't repeat the literal hex in every file.
      backgroundImage: {
        "mf-gradient": "linear-gradient(to right, #F81F1F, #F97316)",
        "mf-gradient-tr":
          "linear-gradient(to top right, #F81F1F, #F97316, #EAB308)",
        "mf-gradient-score": "linear-gradient(to right, #F81F1F, #F97316)",
      },

      // ─── Box shadows ─────────────────────────────────────────────────────────
      boxShadow: {
        "mf-red": "0 4px 14px 0 rgba(248, 31, 31, 0.25)",
        "mf-card": "0 1px 3px 0 rgba(0, 0, 0, 0.08)",
        "mf-card-hover": "0 10px 25px -3px rgba(0, 0, 0, 0.12)",
      },

      // ─── Border radius ───────────────────────────────────────────────────────
      borderRadius: {
        "mf-pill": "9999px", // the rounded-full pills used for CTA buttons
        "mf-card": "1rem", // rounded-2xl used for cards, panels, badges
      },
    },
  },
  plugins: [],
};

export default config;
