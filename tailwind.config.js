/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Kanit", "sans-serif"],
      },
      animation: {
        "gradient-shift": "gradient-shift 15s ease infinite",
        blob: "blob 7s infinite",
        "gradient-rotate": "gradient-rotate 8s linear infinite",
        shake: "shake 0.5s ease-in-out",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        "gradient-rotate": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        shake: {
          "0%, 100%": {
            transform: "translateX(0)",
          },
          "10%, 30%, 50%, 70%, 90%": {
            transform: "translateX(-5px)",
          },
          "20%, 40%, 60%, 80%": {
            transform: "translateX(5px)",
          },
        },
      },
    },
  },
  plugins: [],
};
