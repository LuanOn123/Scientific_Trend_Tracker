/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0f2747",
        ocean: "#1d7ed0",
        ink: "#172033"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(15, 39, 71, 0.08)"
      }
    }
  },
  plugins: []
};
