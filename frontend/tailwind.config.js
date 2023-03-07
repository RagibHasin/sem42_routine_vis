/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./static/index.html", "./src/index.ts"],
  theme: {
    extend: {},
    // fontSize: {
    //   sm: ["1rem", "1.5rem"],
    //   base: ["1.125rem", "1.625rem"],
    //   lg: ["1.25rem", "1.75rem"],
    //   h1: ["2.25rem", "2.5rem"],
    // },
    fontFamily: {
      serif: ["Source Serif Pro", "serif"],
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    // ...
  ],
};
