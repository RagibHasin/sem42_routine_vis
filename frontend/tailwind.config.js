const stripes = `
var(--tw-gradient-from) 0.25rem,
var(--tw-gradient-to)   0.25rem 0.5rem,
var(--tw-gradient-from) 0.5rem 0.75rem,
var(--tw-gradient-to)   0.75rem 1rem,
var(--tw-gradient-from) 1rem 1.25rem,
var(--tw-gradient-to)   1.25rem`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./static/index.html", "./src/index.ts"],
  theme: {
    extend: {
      backgroundImage: {
        "diag-stripe-bl": `linear-gradient( 45deg, ${stripes})`,
        "diag-stripe-br": `linear-gradient(-45deg, ${stripes})`,
      },
    },
    fontFamily: {
      serif: ["Source Serif Pro", "serif"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
