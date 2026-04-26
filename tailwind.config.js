/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Manrope", "sans-serif"]
      },
      colors: {
        ink: "#111318",
        cloud: "#f9f9f6",
        sand: "#efece2",
        accent: "#0f5c4e"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(18, 22, 33, 0.08)"
      }
    }
  },
  plugins: []
};
