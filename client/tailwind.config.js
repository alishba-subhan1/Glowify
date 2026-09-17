/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
       glowifyRed: "#7a001b",
        glowifyCard: "#171717"
        // glowifyRed: "#0055aa",
        // glowifyCard: "#0055aa"

      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ['"Cormorant Garamond"', "Georgia", "Times New Roman", "serif"]
      }
    }
  },
  plugins: []
};
