/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1d4ed8", // blue-700
        secondary: "#93c5fd", // blue-300
        dark: "#1e293b", // slate-800
        light: "#f8fafc", // slate-50
      }
    },
  },
  plugins: [],
}
