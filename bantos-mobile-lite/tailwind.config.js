/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3f51b5',
          light: '#757de8',
          dark: '#002984',
        },
        background: '#f4f6f8',
        surface: '#ffffff',
        text: '#1f2937',
        textSecondary: '#6b7280',
      }
    },
  },
  plugins: [],
}
