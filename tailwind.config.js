/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2463eb",
          dark: "#1d4ed8",
        },
        "bg-dark": "#130f25", // Deep Purple for Dark Mode
        "bg-light": "#f6f6f8",
        "text-secondary": "#94a3b8",
      },
      fontFamily: {
        sans: ['"Cairo"', '"Outfit"', '"Noto Sans Arabic"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
