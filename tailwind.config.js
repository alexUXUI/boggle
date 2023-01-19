/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f2f8ff",
          100: "#e6f1ff",
          200: "#c8dcff",
          300: "#a9c7ff",
          400: "#8bb2ff",
          500: "#6d9dff",
          600: "#4f88ff",
          700: "#3173ff",
          800: "#135eff",
          900: "#0049ff",

          950: "#0039cc",
        },
      },
    },
  },
  plugins: [],
};
