/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
    , "./pages/**/*.{js,ts,jsx,tsx,mdx}"
    , "./components/**/*.{js,ts,jsx,tsx,mdx}"
    , "./utils/**/*.{js,ts,jsx,tsx,mdx}"
    , "node_modules/nextra-theme-docs/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("daisyui")],
  darkTheme: "light",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#93BBFB",
          "primary-content": "#212638",
          secondary: "#DAE8FF",
          "secondary-content": "#212638",
          accent: "#93BBFB",
          "accent-content": "#212638",
          neutral: "#212638",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f4f8ff",
          "base-300": "#DAE8FF",
          "base-content": "#212638",
          info: "#93BBFB",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        dark: {
          primary: "#324455",
          "primary-content": "#E5E7EB",
          secondary: "#374151",
          "secondary-content": "#D1D5DB",
          accent: "#2563EB",
          "accent-content": "#F9FAFB",
          neutral: "#111827",
          "neutral-content": "#F3F4F6",
          "base-100": "#1F2933",
          "base-200": "#0a0e17",
          "base-300": "#000000",
          "base-content": "#E5E7EB",
          info: "#2563EB",
          success: "#22C55E",
          warning: "#EAB308",
          error: "#EF4444",
          "--rounded-btn": "8px",
          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "#374151",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
