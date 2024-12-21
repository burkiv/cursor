const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        coupleAccent: '#E91E63', // Ana pembe renk
        coupleBg: '#FFF5F7',    // Arka plan rengi
        couplePanel: '#FCE7F3',  // Panel arka plan rengi
        coupleText: '#1F2937',   // Metin rengi
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
}
