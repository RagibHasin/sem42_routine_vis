/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./static/index.html", "./src/index.ts"],
  theme: {
    screens: {
      sm: "720px",
      md: "864px",
      lg: "1024px",
      xl: "1280px",
    },
    fontFamily: {
      serif: ["Source Serif Pro", "serif"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
